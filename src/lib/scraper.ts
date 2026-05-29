/**
 * Custom HTML checks + SEO checks + business category detection.
 *
 * Fetches the target HTML once and extracts everything needed.
 * All checks return null/false on failure — never blocks report creation.
 */

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

export type BusinessCategory =
  | 'dental'
  | 'medical'
  | 'restaurant'
  | 'interior_design'
  | 'photography'
  | 'coaching'
  | 'salon'
  | 'retail'
  | 'real_estate'
  | 'general';

export interface ScraperResult {
  checks: CustomChecks;
  seoChecks: SEOChecks;
  businessCategory: BusinessCategory;
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

// ── HTML Entity Decoding ──────────────────────────────────────────

/**
 * Decodes common HTML entities and numeric character references.
 * Handles named entities, decimal (&#123;), and hex (&#x7B;) forms.
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

// ── Business Name Extraction ──────────────────────────────────────

/**
 * Extracts a clean business name from the page <title>.
 * Decodes HTML entities and strips common suffixes like "- Home", "| Welcome".
 */
export async function extractBusinessName(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    if (titleMatch?.[1]) {
      let title = decodeHtmlEntities(titleMatch[1].trim());
      title = title.replace(/\s*[-|–—]\s*(Home|Homepage|Welcome).*$/i, '');
      title = title.replace(/\s*[-|–—]\s*$/, '');
      return title.substring(0, 100) || new URL(url).hostname;
    }

    return new URL(url).hostname;
  } catch {
    try {
      return new URL(url).hostname;
    } catch {
      return 'Unknown';
    }
  }
}

// ── Business Category Detection ───────────────────────────────────

const CATEGORY_KEYWORDS: Record<BusinessCategory, string[]> = {
  dental: ['dental', 'dentist', 'dent', 'orthodon', 'oral care', 'teeth', 'smile clinic'],
  medical: ['clinic', 'hospital', 'doctor', 'dr.', 'physician', 'healthcare', 'health care', 'medical', 'diagnostic', 'pharmacy', 'pathology', 'physiotherapy'],
  restaurant: ['restaurant', 'cafe', 'bistro', 'diner', 'food', 'cuisine', 'kitchen', 'catering', 'bakery', 'dhaba', 'biryani', 'pizza', 'burger'],
  interior_design: ['interior', 'design studio', 'home decor', 'furnish', 'architect', 'modular kitchen', 'renovation'],
  photography: ['photo', 'studio', 'wedding shoot', 'portrait', 'cinemato', 'videograph'],
  coaching: ['coaching', 'tuition', 'classes', 'academy', 'institute', 'training', 'edtech', 'education', 'tutor', 'ielts', 'upsc', 'neet', 'jee'],
  salon: ['salon', 'spa', 'beauty', 'parlour', 'parlor', 'hair', 'grooming', 'nail', 'skincare', 'makeover'],
  retail: ['shop', 'store', 'mart', 'retail', 'ecommerce', 'e-commerce', 'buy', 'fashion', 'clothing', 'jewel'],
  real_estate: ['real estate', 'realty', 'property', 'builder', 'construction', 'apartment', 'villa', 'plot', 'housing'],
  general: [],
};

/**
 * Detects business category from HTML content and URL.
 * Scans title, meta description, body text, and domain name.
 */
export function detectBusinessCategory(html: string, url: string): BusinessCategory {
  const lowerHtml = html.toLowerCase();
  let lowerDomain = '';
  try {
    lowerDomain = new URL(url).hostname.toLowerCase();
  } catch { /* ignore */ }

  const searchText = lowerHtml + ' ' + lowerDomain;

  // Check each category's keywords (order matters — more specific first)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return category as BusinessCategory;
      }
    }
  }

  return 'general';
}

// ── Null/Empty Defaults ───────────────────────────────────────────

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

// ── Main Scraper ──────────────────────────────────────────────────

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
      return { checks: nullChecks(), seoChecks: emptySeoChecks(), businessCategory: 'general' };
    }

    html = await response.text();
  } catch {
    // Network error, timeout, or any other failure — return unknowns
    return { checks: nullChecks(), seoChecks: emptySeoChecks(), businessCategory: 'general' };
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
  const titleContent = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1].trim()) : '';
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

  // ── Business Category ──────────────────────────────────────────
  const businessCategory = detectBusinessCategory(html, url);

  return { checks, seoChecks, businessCategory };
}
