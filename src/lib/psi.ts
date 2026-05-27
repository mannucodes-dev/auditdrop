const PSI_API_URL =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export interface PSIMetrics {
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
}

export interface PSIResult {
  mobileScore: number;
  desktopScore: number;
  metrics: PSIMetrics;
}

interface LighthouseAudit {
  displayValue?: string;
}

interface LighthouseResult {
  categories: {
    performance: { score: number | null };
  };
  audits: Record<string, LighthouseAudit>;
}

interface PSIApiResponse {
  lighthouseResult: LighthouseResult;
}

async function fetchStrategy(
  url: string,
  strategy: 'mobile' | 'desktop',
  signal: AbortSignal
): Promise<PSIApiResponse> {
  const apiKey = process.env.NEXT_PUBLIC_PSI_API_KEY ?? '';

  const params = new URLSearchParams({
    url,
    strategy,
    category: 'performance',
    ...(apiKey && { key: apiKey }),
  });

  const response = await fetch(`${PSI_API_URL}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `PSI API error (${strategy}): ${response.status} — ${errorBody}`
    );
  }

  return response.json() as Promise<PSIApiResponse>;
}

function extractMetrics(lighthouse: LighthouseResult): PSIMetrics {
  const audits = lighthouse.audits;

  return {
    fcp: audits['first-contentful-paint']?.displayValue ?? '—',
    lcp: audits['largest-contentful-paint']?.displayValue ?? '—',
    tbt: audits['total-blocking-time']?.displayValue ?? '—',
    cls: audits['cumulative-layout-shift']?.displayValue ?? '—',
  };
}

function scoreToPercent(raw: number | null): number {
  if (raw === null || raw === undefined) return 0;
  return Math.round(raw * 100);
}

export async function runAudit(url: string): Promise<PSIResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const [mobileRes, desktopRes] = await Promise.all([
      fetchStrategy(url, 'mobile', controller.signal),
      fetchStrategy(url, 'desktop', controller.signal),
    ]);

    const mobileLH = mobileRes.lighthouseResult;
    const desktopLH = desktopRes.lighthouseResult;

    const mobileScore = scoreToPercent(
      mobileLH.categories.performance.score
    );
    const desktopScore = scoreToPercent(
      desktopLH.categories.performance.score
    );

    // Pull display-value metrics from the mobile run (more representative)
    const metrics = extractMetrics(mobileLH);

    return { mobileScore, desktopScore, metrics };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `PageSpeed audit timed out after 30 seconds for: ${url}`
      );
    }

    if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
      throw new Error(
        `Could not reach the URL for audit. Ensure "${url}" is publicly accessible.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
