export interface CustomChecks {
  hasPhone: boolean | null;
  hasClickToCall: boolean | null;
  hasHttps: boolean | null;
  hasAnalytics: boolean | null;
  hasViewport: boolean | null;
  hasContactForm: boolean | null;
}

const USER_AGENT = 'Mozilla/5.0 (compatible; AuditDropBot/1.0)';
const FETCH_TIMEOUT_MS = 10_000;

/**
 * Matches common phone-number patterns including:
 * - International:  +1 (555) 123-4567, +44 20 7946 0958
 * - Indian:         +91 98765 43210, 091-9876543210, 0xx-xxxxxxx, bare 10-digit
 * - US/generic:     (555) 123-4567, 555-123-4567, 555.123.4567
 */
const PHONE_REGEX =
  /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,5}[\s.-]?\d{4,}/;

/**
 * Checks for common analytics/tracking snippets in the HTML.
 */
const ANALYTICS_PATTERNS = [
  'gtag(',
  'ga.js',
  'analytics.js',
  'fbq(',
  '_gaq',
  'googletagmanager.com',
  'google-analytics.com',
] as const;

function nullChecks(): CustomChecks {
  return {
    hasPhone: null,
    hasClickToCall: null,
    hasHttps: null,
    hasAnalytics: null,
    hasViewport: null,
    hasContactForm: null,
  };
}

export async function runCustomChecks(url: string): Promise<CustomChecks> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });

    if (!response.ok) {
      return nullChecks();
    }

    html = await response.text();
  } catch {
    // Network error, timeout, or any other failure — return unknowns
    return nullChecks();
  } finally {
    clearTimeout(timeout);
  }

  const lowerHtml = html.toLowerCase();

  const hasPhone = PHONE_REGEX.test(html);

  const hasClickToCall = lowerHtml.includes('href="tel:') || lowerHtml.includes("href='tel:");

  const hasHttps = url.startsWith('https://');

  const hasAnalytics = ANALYTICS_PATTERNS.some((pattern) =>
    lowerHtml.includes(pattern.toLowerCase())
  );

  const hasViewport =
    lowerHtml.includes('<meta name="viewport"') ||
    lowerHtml.includes("<meta name='viewport'") ||
    lowerHtml.includes('<meta name=viewport');

  const hasContactForm = lowerHtml.includes('<form');

  return {
    hasPhone,
    hasClickToCall,
    hasHttps,
    hasAnalytics,
    hasViewport,
    hasContactForm,
  };
}
