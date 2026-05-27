const PSI_API_URL =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Per-strategy timeout — 45s gives headroom for slow sites
const STRATEGY_TIMEOUT_MS = 45_000;

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

/** Empty metrics returned when PSI is unreachable */
function emptyMetrics(): PSIMetrics {
  return { fcp: '—', lcp: '—', tbt: '—', cls: '—' };
}

async function fetchStrategy(
  url: string,
  strategy: 'mobile' | 'desktop'
): Promise<PSIApiResponse | null> {
  const apiKey = process.env.PSI_API_KEY ?? '';

  const params = new URLSearchParams({
    url,
    strategy,
    category: 'performance',
  });

  // Only attach a real key
  if (apiKey && apiKey.length > 10 && apiKey !== 'REPLACE_ME') {
    params.set('key', apiKey);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STRATEGY_TIMEOUT_MS);

  console.log(`[PSI] ${strategy} → ${url}`);
  const t0 = Date.now();

  try {
    const res = await fetch(`${PSI_API_URL}?${params.toString()}`, {
      signal: controller.signal,
    });

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    if (!res.ok) {
      // Read the body as text to avoid JSON parse failures on HTML error pages
      const body = await res.text().catch(() => '');
      console.error(`[PSI] ${strategy} HTTP ${res.status} in ${elapsed}s — ${body.slice(0, 200)}`);
      return null; // graceful fallback
    }

    console.log(`[PSI] ${strategy} OK in ${elapsed}s`);
    return (await res.json()) as PSIApiResponse;
  } catch (err) {
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[PSI] ${strategy} failed in ${elapsed}s: ${msg}`);
    return null; // graceful fallback
  } finally {
    clearTimeout(timer);
  }
}

function extractMetrics(lh: LighthouseResult): PSIMetrics {
  const a = lh.audits;
  return {
    fcp: a['first-contentful-paint']?.displayValue ?? '—',
    lcp: a['largest-contentful-paint']?.displayValue ?? '—',
    tbt: a['total-blocking-time']?.displayValue ?? '—',
    cls: a['cumulative-layout-shift']?.displayValue ?? '—',
  };
}

function scoreToPercent(raw: number | null): number {
  if (raw === null || raw === undefined) return 0;
  return Math.round(raw * 100);
}

export async function runAudit(url: string): Promise<PSIResult> {
  // Run mobile + desktop in parallel — they're independent server-side jobs
  const [mobileRes, desktopRes] = await Promise.all([
    fetchStrategy(url, 'mobile'),
    fetchStrategy(url, 'desktop'),
  ]);

  // If BOTH failed, throw so the user gets a clear error
  if (!mobileRes && !desktopRes) {
    throw new Error(
      'Google PageSpeed Insights is temporarily unavailable (rate limited). ' +
      'Please wait a few minutes and try again.'
    );
  }

  // Use whichever succeeded, fall back to 0/empty for the other
  const mobileScore = mobileRes
    ? scoreToPercent(mobileRes.lighthouseResult.categories.performance.score)
    : 0;
  const desktopScore = desktopRes
    ? scoreToPercent(desktopRes.lighthouseResult.categories.performance.score)
    : 0;

  // Prefer mobile metrics, fall back to desktop
  const metrics = mobileRes
    ? extractMetrics(mobileRes.lighthouseResult)
    : desktopRes
      ? extractMetrics(desktopRes.lighthouseResult)
      : emptyMetrics();

  return { mobileScore, desktopScore, metrics };
}
