import type { CustomChecks } from './scraper';
import type { PSIMetrics } from './psi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Issue {
  key: string;
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
  icon: string;
}

type ScoreColor = 'red' | 'amber' | 'green';
type ScoreLabel = 'Poor' | 'Needs Work' | 'Good';

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
  },

  noClickToCall: {
    title: 'No Tap-to-Call Button',
    body: 'Visitors on their phone can\'t tap a button to call you directly. Adding a tap-to-call link is the single easiest way to turn a website visit into an enquiry.',
    impact: 'High' as const,
    icon: '📞',
  },

  noHttps: {
    title: 'Site Not Secure (No HTTPS)',
    body: 'Your site doesn\'t use a secure connection. Browsers show a "Not Secure" warning which scares visitors away, and Google ranks insecure sites lower in search results.',
    impact: 'Medium' as const,
    icon: '🔓',
  },

  noAnalytics: {
    title: 'No Visitor Tracking',
    body: 'There\'s no analytics tool installed, so you have no idea how many people visit your site, where they come from, or what pages they look at. You\'re flying blind.',
    impact: 'Medium' as const,
    icon: '📊',
  },

  noViewport: {
    title: 'Poor Mobile Layout',
    body: 'Your site isn\'t set up to display properly on phones and tablets. Visitors have to pinch and zoom just to read your content, and most will give up and leave.',
    impact: 'High' as const,
    icon: '📱',
  },

  noContactForm: {
    title: 'No Contact Form',
    body: 'There\'s no easy way for visitors to send you a message from the website. A simple contact form captures enquiries even when you\'re too busy to answer the phone.',
    impact: 'Medium' as const,
    icon: '✉️',
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
export function getScoreColor(score: number): ScoreColor {
  if (score >= 90) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

/**
 * Human-readable label for a 0-100 performance score.
 */
export function getScoreLabel(score: number): ScoreLabel {
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

// ---------------------------------------------------------------------------
// Issue generator
// ---------------------------------------------------------------------------

/**
 * Analyses the custom checks and PSI metrics to produce a list of
 * actionable issues, ordered by severity.
 */
export function generateIssues(
  checks: CustomChecks,
  metrics: PSIMetrics,
  mobileScore: number
): Issue[] {
  const issues: Issue[] = [];

  // Slow load — triggered when mobile score is below 50 OR LCP > 4 s
  const lcpSeconds = parseLcpSeconds(metrics.lcp);
  if (mobileScore < 50 || (lcpSeconds !== null && lcpSeconds > 4)) {
    issues.push({
      key: 'slowLoad',
      title: ISSUE_COPY.slowLoad.title,
      body: ISSUE_COPY.slowLoad.body(metrics.lcp),
      impact: ISSUE_COPY.slowLoad.impact,
      icon: ISSUE_COPY.slowLoad.icon,
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
    });
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
