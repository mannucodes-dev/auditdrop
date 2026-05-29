import type { CustomChecks, SEOChecks, BusinessCategory } from './scraper';
import type { PSIMetrics } from './psi';
import type { RevenueImpact } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Issue {
  key: string;
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
  icon: string;
  fixTime?: string;
  fixCost?: string;
  fixDifficulty?: 'easy' | 'medium' | 'hard';
  fixDescription?: string;
}

export interface Verdict {
  lostLeadsMin: number;
  lostLeadsMax: number;
  severity: 'critical' | 'poor' | 'fair';
  verdictText: string;
}

type ScoreColor = 'red' | 'amber' | 'green';
type ScoreLabel = 'Poor' | 'Needs Work' | 'Good';

// ---------------------------------------------------------------------------
// Revenue Impact Engine — Category-aware ₹ estimation
// ---------------------------------------------------------------------------

/** Monthly visitor estimates by business category (conservative for Indian SMBs). */
const MONTHLY_VISITORS: Record<BusinessCategory, number> = {
  dental: 800,
  medical: 1200,
  restaurant: 1500,
  interior_design: 600,
  photography: 500,
  coaching: 1000,
  salon: 700,
  retail: 2000,
  real_estate: 900,
  general: 500,
};

/** Average lead value in ₹ by category. */
const LEAD_VALUE: Record<BusinessCategory, number> = {
  dental: 3000,
  medical: 2500,
  restaurant: 500,
  interior_design: 15000,
  photography: 8000,
  coaching: 5000,
  salon: 1500,
  retail: 1000,
  real_estate: 50000,
  general: 2000,
};

/** Baseline conversion rate for a well-optimized site. */
const CONVERSION_BASELINE = 0.03; // 3%

/**
 * Calculates estimated monthly revenue loss based on audit issues.
 *
 * Uses category-specific visitor and lead-value estimates to produce
 * a ₹ range that resonates with Indian SMB owners.
 */
export function calculateRevenueImpact(
  mobileScore: number | null,
  desktopScore: number | null,
  checks: CustomChecks,
  seoChecks: SEOChecks | undefined,
  businessCategory: BusinessCategory = 'general'
): RevenueImpact {
  const visitors = MONTHLY_VISITORS[businessCategory];
  const leadValue = LEAD_VALUE[businessCategory];

  // Calculate conversion loss percentage from issues
  let lossPct = 0;

  // Mobile speed impact
  const effectiveMobileScore = mobileScore ?? 30; // assume bad if unavailable
  if (effectiveMobileScore < 50) {
    lossPct += 35;
  } else if (effectiveMobileScore < 70) {
    lossPct += 20;
  } else if (effectiveMobileScore < 90) {
    lossPct += 5;
  }

  // Desktop speed impact (lower weight than mobile)
  const effectiveDesktopScore = desktopScore ?? 50;
  if (effectiveDesktopScore < 50) {
    lossPct += 10;
  } else if (effectiveDesktopScore < 70) {
    lossPct += 5;
  }

  // Functional issues
  if (checks.hasClickToCall === false) lossPct += 15;
  if (checks.hasContactForm === false) lossPct += 10;
  if (checks.hasViewport === false) lossPct += 25;
  if (checks.hasHttps === false) lossPct += 20;

  // SEO issues (moderate impact)
  if (seoChecks) {
    if (!seoChecks.hasMetaDescription) lossPct += 5;
    if (!seoChecks.hasH1) lossPct += 5;
    if (!seoChecks.hasStructuredData) lossPct += 3;
  }

  // Cap at 80%
  lossPct = Math.min(lossPct, 80);

  // Calculate lost conversions and revenue
  const lostConversions = Math.round(visitors * CONVERSION_BASELINE * (lossPct / 100));
  const baseLostRevenue = lostConversions * leadValue;
  const lostRevenueMin = roundToNearest(baseLostRevenue * 0.8, 500);
  const lostRevenueMax = roundToNearest(baseLostRevenue * 1.2, 500);

  // Determine severity and headline
  let severity: 'critical' | 'poor' | 'fair';
  let headline: string;

  if (lossPct > 50) {
    severity = 'critical';
    headline = `This website is losing ₹${formatINR(lostRevenueMin)}–₹${formatINR(lostRevenueMax)} every month`;
  } else if (lossPct >= 30) {
    severity = 'poor';
    headline = `This website is leaking ₹${formatINR(lostRevenueMin)}–₹${formatINR(lostRevenueMax)}/month in lost business`;
  } else {
    severity = 'fair';
    headline = `Fixing these issues could recover ₹${formatINR(lostRevenueMin)}–₹${formatINR(lostRevenueMax)}/month`;
  }

  return {
    monthlyVisitorsEstimate: visitors,
    conversionBaseline: CONVERSION_BASELINE,
    lostConversions,
    lostRevenueMin,
    lostRevenueMax,
    currency: '₹',
    severity,
    headline,
    disclaimer:
      'Estimates based on industry averages for similar businesses. Actual results depend on location, competition, and service quality.',
  };
}

/** Format number in Indian numbering system (1,00,000). */
function formatINR(num: number): string {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(1).replace(/\.0$/, '') + ' L';
  }
  // Indian grouping: last 3 digits then groups of 2
  const str = Math.round(num).toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return grouped + ',' + last3;
}

// ---------------------------------------------------------------------------
// Plain-language issue copy — written for non-technical business owners
// (clinic / salon / restaurant / local service owners)
// ---------------------------------------------------------------------------

export const ISSUE_COPY = {
  slowLoad: {
    title: 'Site Loads Too Slowly on Mobile',
    body: (lcp: string) =>
      `Your site takes ${lcp} to fully load on a mobile phone. Most visitors will leave if a page takes more than 3 seconds. A faster site means more customers stay and take action.`,
    impact: 'High' as const,
    icon: '⏱️',
    fixTime: '1–3 days',
    fixCost: '₹3,000–₹8,000',
    fixDifficulty: 'medium' as const,
    fixDescription: 'Compress images, enable caching, and use a faster hosting provider.',
  },

  noClickToCall: {
    title: 'No Tap-to-Call Button',
    body: 'Visitors on their phone can\'t tap a button to call you directly. Adding a tap-to-call link is the single easiest way to turn a website visit into an enquiry.',
    impact: 'High' as const,
    icon: '📞',
    fixTime: '30 minutes',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Add a single line of code linking your phone number — any developer can do this in minutes.',
  },

  noHttps: {
    title: 'Site Not Secure (No HTTPS)',
    body: 'Your site doesn\'t use a secure connection. Browsers show a "Not Secure" warning which scares visitors away, and Google ranks insecure sites lower in search results.',
    impact: 'Medium' as const,
    icon: '🔓',
    fixTime: '1–2 hours',
    fixCost: '₹0–₹1,000/year',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Enable SSL through your hosting provider. Most modern hosts offer this free.',
  },

  noAnalytics: {
    title: 'No Visitor Tracking',
    body: 'There\'s no analytics tool installed, so you have no idea how many people visit your site, where they come from, or what pages they look at. You\'re flying blind.',
    impact: 'Medium' as const,
    icon: '📊',
    fixTime: '1–2 hours',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Set up Google Analytics — it\'s free and takes minutes to add a tracking snippet to your site.',
  },

  noViewport: {
    title: 'Poor Mobile Layout',
    body: 'Your site isn\'t set up to display properly on phones and tablets. Visitors have to pinch and zoom just to read your content, and most will give up and leave.',
    impact: 'High' as const,
    icon: '📱',
    fixTime: '30 minutes',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Add a viewport meta tag to your HTML — one line of code fixes this instantly.',
  },

  noContactForm: {
    title: 'No Contact Form',
    body: 'There\'s no easy way for visitors to send you a message from the website. A simple contact form captures enquiries even when you\'re too busy to answer the phone.',
    impact: 'Medium' as const,
    icon: '✉️',
    fixTime: '2–4 hours',
    fixCost: '₹0–₹2,000',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Add a simple contact form using a free tool like Google Forms or a WordPress plugin.',
  },

  // SEO issues
  noMetaDescription: {
    title: 'No Meta Description',
    body: 'No meta description — Google has nothing to show under your link in search results. You\'re invisible in the one line that makes people click.',
    impact: 'Medium' as const,
    icon: '🔍',
    fixTime: '30 minutes',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Add a 1–2 sentence description of your business in your website settings.',
  },

  noH1: {
    title: 'No Main Heading (H1)',
    body: 'No main heading (H1) — Search engines don\'t know what your page is about. This directly hurts your Google ranking for relevant searches.',
    impact: 'Medium' as const,
    icon: '🏷️',
    fixTime: '30 minutes',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Set your main page headline as an H1 tag — this tells Google what your business does.',
  },

  titleTooLong: {
    title: 'Page Title Too Long',
    body: 'Page title too long — Google cuts it off in search results, making your listing look broken or unprofessional.',
    impact: 'Low' as const,
    icon: '✂️',
    fixTime: '15 minutes',
    fixCost: '₹0 (free)',
    fixDifficulty: 'easy' as const,
    fixDescription: 'Shorten your page title to under 60 characters so it displays fully in Google search results.',
  },

  noStructuredData: {
    title: 'No Business Schema',
    body: 'No business schema — You\'re missing rich results (star ratings, hours, location) that appear in Google Search for local businesses.',
    impact: 'Low' as const,
    icon: '⭐',
    fixTime: '1–2 hours',
    fixCost: '₹500–₹1,500',
    fixDifficulty: 'medium' as const,
    fixDescription: 'Add structured data (JSON-LD) to your page — it helps Google show rich snippets like ratings and business hours.',
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a Tailwind-friendly color bucket for a Lighthouse-style 0-100 score.
 *
 * - 0–49  → red
 * - 50–89 → amber
 * - 90–100 → green
 */
export function getScoreColor(score: number | null): ScoreColor {
  if (score === null) return 'red';
  if (score >= 90) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

/**
 * Human-readable label for a 0-100 performance score.
 */
export function getScoreLabel(score: number | null): ScoreLabel {
  if (score === null) return 'Poor';
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

/**
 * Generates a random 8-character alphanumeric report ID.
 */
export function generateReportId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Rounds a number to the nearest multiple of `step`.
 */
function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// ---------------------------------------------------------------------------
// Verdict generator (legacy — kept for backwards compatibility)
// ---------------------------------------------------------------------------

/**
 * Generates a plain-English verdict estimating lost leads based on audit data.
 */
export function generateVerdict(
  mobileScore: number | null,
  checks: CustomChecks
): Verdict {
  const BASE_LEADS = 100;
  let lossPercentage = 0;

  const effectiveScore = mobileScore ?? 30;

  // Mobile speed
  if (effectiveScore < 50) {
    lossPercentage += 35;
  } else if (effectiveScore < 70) {
    lossPercentage += 20;
  }

  // Click-to-call
  if (checks.hasClickToCall === false) {
    lossPercentage += 15;
  }

  // Contact form
  if (checks.hasContactForm === false) {
    lossPercentage += 10;
  }

  // Viewport
  if (checks.hasViewport === false) {
    lossPercentage += 25;
  }

  // HTTPS
  if (checks.hasHttps === false) {
    lossPercentage += 20;
  }

  // Cap at 80%
  lossPercentage = Math.min(lossPercentage, 80);

  const lostLeadsMin = roundToNearest(BASE_LEADS * (lossPercentage / 100) * 0.8, 5);
  const lostLeadsMax = roundToNearest(BASE_LEADS * (lossPercentage / 100) * 1.2, 5);

  let severity: 'critical' | 'poor' | 'fair';
  let verdictText: string;

  if (lossPercentage > 50) {
    severity = 'critical';
    verdictText = 'This website is actively turning away potential customers every day.';
  } else if (lossPercentage >= 30) {
    severity = 'poor';
    verdictText = 'This website is losing a significant number of potential leads each month.';
  } else {
    severity = 'fair';
    verdictText = 'This website has issues that are costing you customers.';
  }

  return { lostLeadsMin, lostLeadsMax, severity, verdictText };
}

// ---------------------------------------------------------------------------
// Issue generator
// ---------------------------------------------------------------------------

/**
 * Analyses the custom checks, SEO checks, and PSI metrics to produce a list of
 * actionable issues, ordered by severity.
 */
export function generateIssues(
  checks: CustomChecks,
  metrics: PSIMetrics,
  mobileScore: number | null,
  seoChecks?: SEOChecks
): Issue[] {
  const issues: Issue[] = [];
  const effectiveScore = mobileScore ?? 0;

  // Slow load — triggered when mobile score is below 50 OR LCP > 4 s
  const lcpSeconds = parseLcpSeconds(metrics.lcp);
  if (effectiveScore < 50 || (lcpSeconds !== null && lcpSeconds > 4)) {
    issues.push({
      key: 'slowLoad',
      title: ISSUE_COPY.slowLoad.title,
      body: ISSUE_COPY.slowLoad.body(metrics.lcp),
      impact: ISSUE_COPY.slowLoad.impact,
      icon: ISSUE_COPY.slowLoad.icon,
      fixTime: ISSUE_COPY.slowLoad.fixTime,
      fixCost: ISSUE_COPY.slowLoad.fixCost,
      fixDifficulty: ISSUE_COPY.slowLoad.fixDifficulty,
      fixDescription: ISSUE_COPY.slowLoad.fixDescription,
    });
  }

  // No tap-to-call
  if (checks.hasClickToCall === false) {
    issues.push({
      key: 'noClickToCall',
      title: ISSUE_COPY.noClickToCall.title,
      body: ISSUE_COPY.noClickToCall.body,
      impact: ISSUE_COPY.noClickToCall.impact,
      icon: ISSUE_COPY.noClickToCall.icon,
      fixTime: ISSUE_COPY.noClickToCall.fixTime,
      fixCost: ISSUE_COPY.noClickToCall.fixCost,
      fixDifficulty: ISSUE_COPY.noClickToCall.fixDifficulty,
      fixDescription: ISSUE_COPY.noClickToCall.fixDescription,
    });
  }

  // No HTTPS
  if (checks.hasHttps === false) {
    issues.push({
      key: 'noHttps',
      title: ISSUE_COPY.noHttps.title,
      body: ISSUE_COPY.noHttps.body,
      impact: ISSUE_COPY.noHttps.impact,
      icon: ISSUE_COPY.noHttps.icon,
      fixTime: ISSUE_COPY.noHttps.fixTime,
      fixCost: ISSUE_COPY.noHttps.fixCost,
      fixDifficulty: ISSUE_COPY.noHttps.fixDifficulty,
      fixDescription: ISSUE_COPY.noHttps.fixDescription,
    });
  }

  // No viewport meta tag
  if (checks.hasViewport === false) {
    issues.push({
      key: 'noViewport',
      title: ISSUE_COPY.noViewport.title,
      body: ISSUE_COPY.noViewport.body,
      impact: ISSUE_COPY.noViewport.impact,
      icon: ISSUE_COPY.noViewport.icon,
      fixTime: ISSUE_COPY.noViewport.fixTime,
      fixCost: ISSUE_COPY.noViewport.fixCost,
      fixDifficulty: ISSUE_COPY.noViewport.fixDifficulty,
      fixDescription: ISSUE_COPY.noViewport.fixDescription,
    });
  }

  // No analytics
  if (checks.hasAnalytics === false) {
    issues.push({
      key: 'noAnalytics',
      title: ISSUE_COPY.noAnalytics.title,
      body: ISSUE_COPY.noAnalytics.body,
      impact: ISSUE_COPY.noAnalytics.impact,
      icon: ISSUE_COPY.noAnalytics.icon,
      fixTime: ISSUE_COPY.noAnalytics.fixTime,
      fixCost: ISSUE_COPY.noAnalytics.fixCost,
      fixDifficulty: ISSUE_COPY.noAnalytics.fixDifficulty,
      fixDescription: ISSUE_COPY.noAnalytics.fixDescription,
    });
  }

  // No contact form
  if (checks.hasContactForm === false) {
    issues.push({
      key: 'noContactForm',
      title: ISSUE_COPY.noContactForm.title,
      body: ISSUE_COPY.noContactForm.body,
      impact: ISSUE_COPY.noContactForm.impact,
      icon: ISSUE_COPY.noContactForm.icon,
      fixTime: ISSUE_COPY.noContactForm.fixTime,
      fixCost: ISSUE_COPY.noContactForm.fixCost,
      fixDifficulty: ISSUE_COPY.noContactForm.fixDifficulty,
      fixDescription: ISSUE_COPY.noContactForm.fixDescription,
    });
  }

  // SEO Issues
  if (seoChecks) {
    if (!seoChecks.hasMetaDescription) {
      issues.push({
        key: 'noMetaDescription',
        title: ISSUE_COPY.noMetaDescription.title,
        body: ISSUE_COPY.noMetaDescription.body,
        impact: ISSUE_COPY.noMetaDescription.impact,
        icon: ISSUE_COPY.noMetaDescription.icon,
        fixTime: ISSUE_COPY.noMetaDescription.fixTime,
        fixCost: ISSUE_COPY.noMetaDescription.fixCost,
        fixDifficulty: ISSUE_COPY.noMetaDescription.fixDifficulty,
        fixDescription: ISSUE_COPY.noMetaDescription.fixDescription,
      });
    }

    if (!seoChecks.hasH1) {
      issues.push({
        key: 'noH1',
        title: ISSUE_COPY.noH1.title,
        body: ISSUE_COPY.noH1.body,
        impact: ISSUE_COPY.noH1.impact,
        icon: ISSUE_COPY.noH1.icon,
        fixTime: ISSUE_COPY.noH1.fixTime,
        fixCost: ISSUE_COPY.noH1.fixCost,
        fixDifficulty: ISSUE_COPY.noH1.fixDifficulty,
        fixDescription: ISSUE_COPY.noH1.fixDescription,
      });
    }

    if (seoChecks.titleTooLong) {
      issues.push({
        key: 'titleTooLong',
        title: ISSUE_COPY.titleTooLong.title,
        body: ISSUE_COPY.titleTooLong.body,
        impact: ISSUE_COPY.titleTooLong.impact,
        icon: ISSUE_COPY.titleTooLong.icon,
        fixTime: ISSUE_COPY.titleTooLong.fixTime,
        fixCost: ISSUE_COPY.titleTooLong.fixCost,
        fixDifficulty: ISSUE_COPY.titleTooLong.fixDifficulty,
        fixDescription: ISSUE_COPY.titleTooLong.fixDescription,
      });
    }

    if (!seoChecks.hasStructuredData) {
      issues.push({
        key: 'noStructuredData',
        title: ISSUE_COPY.noStructuredData.title,
        body: ISSUE_COPY.noStructuredData.body,
        impact: ISSUE_COPY.noStructuredData.impact,
        icon: ISSUE_COPY.noStructuredData.icon,
        fixTime: ISSUE_COPY.noStructuredData.fixTime,
        fixCost: ISSUE_COPY.noStructuredData.fixCost,
        fixDifficulty: ISSUE_COPY.noStructuredData.fixDifficulty,
        fixDescription: ISSUE_COPY.noStructuredData.fixDescription,
      });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to parse the LCP display value (e.g. "4.2 s", "3,200 ms") into
 * a number of seconds. Returns null when the value can't be parsed.
 */
function parseLcpSeconds(displayValue: string): number | null {
  if (!displayValue || displayValue === '—') return null;

  const cleaned = displayValue.replace(/,/g, '').trim();

  // Try seconds first — e.g. "4.2 s"
  const secMatch = cleaned.match(/([\d.]+)\s*s$/i);
  if (secMatch) return parseFloat(secMatch[1]);

  // Try milliseconds — e.g. "3200 ms"
  const msMatch = cleaned.match(/([\d.]+)\s*ms$/i);
  if (msMatch) return parseFloat(msMatch[1]) / 1000;

  return null;
}
