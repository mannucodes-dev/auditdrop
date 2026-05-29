/**
 * Google PageSpeed Insights API wrapper.
 *
 * Runs mobile + desktop audits in parallel with:
 * - Independent failure handling (Promise.allSettled)
 * - Exponential backoff retry on 429/500 (2 retries, 2s/4s delays)
 * - Null scores when a strategy fails (never returns 0 for a failed call)
 * - PSI_API_KEY support for higher quotas
 */

const PSI_API_URL =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Per-strategy timeout — 45s gives headroom for slow sites
const STRATEGY_TIMEOUT_MS = 45_000;

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [2000, 4000];

export interface PSIMetrics {
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
}

export interface PSIResult {
  mobileScore: number | null;
  desktopScore: number | null;
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

/** Sleep helper for retry delays */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStrategyOnce(
  url: string,
  strategy: 'mobile' | 'desktop',
  signal: AbortSignal
): Promise<{ data: PSIApiResponse | null; shouldRetry: boolean }> {
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

  try {
    const res = await fetch(`${PSI_API_URL}?${params.toString()}`, { signal });

    if (!res.ok) {
      const status = res.status;
      const body = await res.text().catch(() => '');
      console.error(`[PSI] ${strategy} HTTP ${status} — ${body.slice(0, 200)}`);

      // Retry on 429 (rate limit) or 500+ (server error)
      if (status === 429 || status >= 500) {
        return { data: null, shouldRetry: true };
      }
      return { data: null, shouldRetry: false };
    }

    return { data: (await res.json()) as PSIApiResponse, shouldRetry: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Don't retry on abort (timeout) — it means we've waited long enough
    if (msg.includes('abort')) {
      return { data: null, shouldRetry: false };
    }
    return { data: null, shouldRetry: true };
  }
}

async function fetchStrategy(
  url: string,
  strategy: 'mobile' | 'desktop'
): Promise<PSIApiResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STRATEGY_TIMEOUT_MS);

  console.log(`[PSI] ${strategy} → ${url}`);
  const t0 = Date.now();

  try {
    // First attempt
    let result = await fetchStrategyOnce(url, strategy, controller.signal);
    if (result.data) {
      console.log(`[PSI] ${strategy} OK in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      return result.data;
    }

    // Retry with exponential backoff
    for (let retry = 0; retry < MAX_RETRIES && result.shouldRetry; retry++) {
      const delay = RETRY_DELAYS_MS[retry] || 4000;
      console.log(`[PSI] ${strategy} retrying in ${delay}ms (attempt ${retry + 2}/${MAX_RETRIES + 1})`);
      await sleep(delay);

      result = await fetchStrategyOnce(url, strategy, controller.signal);
      if (result.data) {
        console.log(`[PSI] ${strategy} OK on retry ${retry + 1} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        return result.data;
      }
    }

    console.error(`[PSI] ${strategy} failed after all retries in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    return null;
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

function scoreToPercent(raw: number | null): number | null {
  if (raw === null || raw === undefined) return null;
  return Math.round(raw * 100);
}

export async function runAudit(url: string): Promise<PSIResult> {
  // Run mobile + desktop independently — one can fail without affecting the other
  const [mobileResult, desktopResult] = await Promise.allSettled([
    fetchStrategy(url, 'mobile'),
    fetchStrategy(url, 'desktop'),
  ]);

  const mobileRes = mobileResult.status === 'fulfilled' ? mobileResult.value : null;
  const desktopRes = desktopResult.status === 'fulfilled' ? desktopResult.value : null;

  // If BOTH failed, throw so the user gets a clear error
  if (!mobileRes && !desktopRes) {
    throw new Error(
      'Google PageSpeed Insights is temporarily unavailable. ' +
      'Please wait a few minutes and try again.'
    );
  }

  // Use whichever succeeded, return null for the other (never 0)
  const mobileScore = mobileRes
    ? scoreToPercent(mobileRes.lighthouseResult.categories.performance.score)
    : null;
  const desktopScore = desktopRes
    ? scoreToPercent(desktopRes.lighthouseResult.categories.performance.score)
    : null;

  // Prefer mobile metrics, fall back to desktop
  const metrics = mobileRes
    ? extractMetrics(mobileRes.lighthouseResult)
    : desktopRes
      ? extractMetrics(desktopRes.lighthouseResult)
      : emptyMetrics();

  return { mobileScore, desktopScore, metrics };
}
