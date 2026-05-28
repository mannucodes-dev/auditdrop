export interface CustomChecks {
  hasPhone: boolean | null;
  hasClickToCall: boolean | null;
  hasHttps: boolean | null;
  hasAnalytics: boolean | null;
  hasViewport: boolean | null;
  hasContactForm: boolean | null;
}

export interface SEOChecks {
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  hasH1: boolean;
  hasCanonical: boolean;
  hasStructuredData: boolean;
  hasOpenGraph: boolean;
  titleLength: number;
  titleTooLong: boolean;
  titleTooShort: boolean;
}

export interface ScraperResult {
  checks: CustomChecks;
  seoChecks: SEOChecks;
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

function emptySeoChecks(): SEOChecks {
  return {
    hasMetaTitle: false,
    hasMetaDescription: false,
    hasH1: false,
    hasCanonical: false,
    hasStructuredData: false,
    hasOpenGraph: false,
    titleLength: 0,
    titleTooLong: false,
    titleTooShort: false,
  };
}

export async function runCustomChecks(url: string): Promise<ScraperResult> {
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
      return { checks: nullChecks(), seoChecks: emptySeoChecks() };
    }

    html = await response.text();
  } catch {
    // Network error, timeout, or any other failure — return unknowns
    return { checks: nullChecks(), seoChecks: emptySeoChecks() };
  } finally {
    clearTimeout(timeout);
  }

  const lowerHtml = html.toLowerCase();

  // ── Custom Checks ──────────────────────────────────────────────

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

  const checks: CustomChecks = {
    hasPhone,
    hasClickToCall,
    hasHttps,
    hasAnalytics,
    hasViewport,
    hasContactForm,
  };

  // ── SEO Checks ─────────────────────────────────────────────────

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleContent = titleMatch?.[1]?.trim() ?? '';
  const titleLength = titleContent.length;
  const hasMetaTitle = titleLength > 0;
  const titleTooLong = titleLength > 60;
  const titleTooShort = titleLength < 10 && titleLength > 0;

  // Meta description
  const hasMetaDescription =
    /<meta\s[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']+["'][^>]*name=["']description["'][^>]*>/i.test(html);

  // H1
  const hasH1 = /<h1[\s>]/i.test(html);

  // Canonical
  const hasCanonical = /<link\s[^>]*rel=["']canonical["'][^>]*>/i.test(html);

  // Structured data (JSON-LD)
  const hasStructuredData = lowerHtml.includes('application/ld+json');

  // Open Graph
  const hasOpenGraph = /<meta\s[^>]*property=["']og:title["'][^>]*>/i.test(html);

  const seoChecks: SEOChecks = {
    hasMetaTitle,
    hasMetaDescription,
    hasH1,
    hasCanonical,
    hasStructuredData,
    hasOpenGraph,
    titleLength,
    titleTooLong,
    titleTooShort,
  };

  return { checks, seoChecks };
}
