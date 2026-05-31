/**
 * Money Translation — converts technical issues into money-first,
 * plain-language cards that non-technical business owners understand.
 *
 * Each issue gets:
 *  - A plain-text summary ("Your site takes 5.2s to load on mobile")
 *  - An emotional consequence ("~7 in 10 customers leave before it loads")
 *  - A monthly ₹ impact estimate based on business category
 *  - The original technical detail for context
 *  - A severity level
 *
 * NEVER throws — returns empty array on any error.
 */

import type { AuditIssue } from '@/lib/types';
import type { BusinessCategory } from '@/lib/scraper';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MoneyIssue {
  key: string;
  plainText: string;
  consequence: string;
  monthlyImpact: string;
  technicalDetail: string;
  severity: 'critical' | 'warning' | 'info';
}

// ---------------------------------------------------------------------------
// Category-based economics
// ---------------------------------------------------------------------------

interface CategoryEconomics {
  leadValue: number;
  monthlyVisitors: number;
}

const CATEGORY_ECONOMICS: Record<BusinessCategory, CategoryEconomics> = {
  dental:           { leadValue: 2500, monthlyVisitors: 100 },
  medical:          { leadValue: 2500, monthlyVisitors: 100 },
  restaurant:       { leadValue: 500,  monthlyVisitors: 300 },
  interior_design:  { leadValue: 3000, monthlyVisitors: 80 },
  photography:      { leadValue: 2000, monthlyVisitors: 80 },
  coaching:         { leadValue: 3000, monthlyVisitors: 80 },
  salon:            { leadValue: 1200, monthlyVisitors: 150 },
  retail:           { leadValue: 1500, monthlyVisitors: 120 },
  real_estate:      { leadValue: 5000, monthlyVisitors: 80 },
  general:          { leadValue: 1500, monthlyVisitors: 120 },
};

// ---------------------------------------------------------------------------
// Issue translation map
// ---------------------------------------------------------------------------

interface IssueTemplate {
  plainText: string | ((body: string) => string);
  consequence: string;
  /** Fraction of visitors lost due to this issue (0-1). */
  lossRate: number;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Static map from issue title → plain-language translation.
 * Keys match titles from `ISSUE_COPY` in reportUtils.ts and GBP issues.
 */
const ISSUE_MAP: Record<string, IssueTemplate> = {
  // ── Core performance & conversion issues ──
  'Site Loads Too Slowly on Mobile': {
    plainText: (body: string) => {
      const match = body.match(/takes (.+?) to fully load/);
      return match
        ? `Your site takes ${match[1]} to load on mobile`
        : 'Your site loads too slowly on mobile phones';
    },
    consequence: '~7 in 10 customers leave before it loads',
    lossRate: 0.35,
    severity: 'critical',
  },
  'No Tap-to-Call Button': {
    plainText: 'No tap-to-call button on your website',
    consequence: 'Mobile visitors can\'t call you with one tap — they leave instead',
    lossRate: 0.15,
    severity: 'critical',
  },
  'Site Not Secure (No HTTPS)': {
    plainText: 'Your website is not secure (no HTTPS)',
    consequence: 'Browsers show a scary "Not Secure" warning — visitors bounce immediately',
    lossRate: 0.20,
    severity: 'critical',
  },
  'No Meta Description': {
    plainText: 'Missing meta description for Google',
    consequence: 'Google shows a random snippet — fewer people click your link in search results',
    lossRate: 0.10,
    severity: 'warning',
  },
  'No Visitor Tracking': {
    plainText: 'No Google Analytics or visitor tracking installed',
    consequence: 'You have zero visibility into who visits your site and what they do',
    lossRate: 0.05,
    severity: 'warning',
  },
  'No Business Schema': {
    plainText: 'No structured data (business schema) on your site',
    consequence: 'You\'re missing star ratings, hours, and location in Google Search results',
    lossRate: 0.08,
    severity: 'info',
  },
  'Poor Mobile Layout': {
    plainText: 'Your website doesn\'t display properly on phones',
    consequence: 'Visitors have to pinch and zoom — most give up and leave',
    lossRate: 0.30,
    severity: 'critical',
  },
  'No Main Heading (H1)': {
    plainText: 'No main heading (H1) on your page',
    consequence: 'Google can\'t tell what your business does — hurts your search ranking',
    lossRate: 0.08,
    severity: 'warning',
  },
  'No Contact Form': {
    plainText: 'No contact form on your website',
    consequence: 'Visitors who can\'t call have no way to reach you — you lose after-hours enquiries',
    lossRate: 0.10,
    severity: 'warning',
  },
  'Page Title Too Long': {
    plainText: 'Your page title is too long for Google',
    consequence: 'Google cuts off your title in search results — looks broken and unprofessional',
    lossRate: 0.03,
    severity: 'info',
  },

  // ── GBP issues ──
  'No Business Hours Listed': {
    plainText: 'Your Google Business Profile doesn\'t show opening hours',
    consequence: 'Customers can\'t tell when you\'re open — they choose a competitor instead',
    lossRate: 0.10,
    severity: 'warning',
  },
  'Low Google Rating': {
    plainText: 'Your Google rating is below 4 stars',
    consequence: 'Customers skip businesses with low ratings — trust is everything',
    lossRate: 0.15,
    severity: 'critical',
  },
  'Too Few Reviews': {
    plainText: 'You have very few Google reviews',
    consequence: 'Businesses with more reviews get 3x more clicks in Google Maps',
    lossRate: 0.12,
    severity: 'warning',
  },
  'No Photos on Google Profile': {
    plainText: 'No photos on your Google Business Profile',
    consequence: 'Profiles with photos get 42% more direction requests and 35% more website clicks',
    lossRate: 0.10,
    severity: 'warning',
  },
  'No Phone Number on Google Profile': {
    plainText: 'No phone number on your Google Business Profile',
    consequence: 'Customers searching on Google Maps can\'t call you directly',
    lossRate: 0.10,
    severity: 'warning',
  },
  'No Business Description': {
    plainText: 'Your Google Business Profile has no description',
    consequence: 'Customers can\'t tell what makes you different from competitors',
    lossRate: 0.05,
    severity: 'info',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number in ₹ with Indian grouping. */
function formatINR(num: number): string {
  const rounded = Math.round(num);
  if (rounded >= 10000000) {
    return (rounded / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (rounded >= 100000) {
    return (rounded / 100000).toFixed(1).replace(/\.0$/, '') + ' L';
  }
  const str = rounded.toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return grouped + ',' + last3;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Translates an array of AuditIssue objects into money-first MoneyIssue cards.
 *
 * @param issues – AuditIssue[] from the report
 * @param businessCategory – detected business category for ₹ estimates
 * @returns MoneyIssue[] in the same order as input, skipping unmapped issues
 */
export function translateToMoneyIssues(
  issues: AuditIssue[],
  businessCategory: BusinessCategory
): MoneyIssue[] {
  try {
    const economics = CATEGORY_ECONOMICS[businessCategory] ?? CATEGORY_ECONOMICS.general;
    const result: MoneyIssue[] = [];

    for (const issue of issues) {
      const template = ISSUE_MAP[issue.title];
      if (!template) {
        // Unmapped issue — include with generic translation
        result.push({
          key: issue.title.toLowerCase().replace(/\s+/g, '_'),
          plainText: issue.title,
          consequence: 'This issue may be affecting your online presence',
          monthlyImpact: 'est. impact varies',
          technicalDetail: issue.body,
          severity: issue.impact === 'High' ? 'critical' : issue.impact === 'Medium' ? 'warning' : 'info',
        });
        continue;
      }

      const plainText =
        typeof template.plainText === 'function'
          ? template.plainText(issue.body)
          : template.plainText;

      // Calculate monthly ₹ impact
      const lostVisitors = Math.round(economics.monthlyVisitors * template.lossRate);
      const conversionRate = 0.03; // 3% baseline
      const lostLeads = Math.max(1, Math.round(lostVisitors * conversionRate));
      const monthlyLoss = lostLeads * economics.leadValue;
      const monthlyImpact =
        monthlyLoss > 0
          ? `est. ₹${formatINR(monthlyLoss)}/month lost`
          : 'minimal direct impact';

      result.push({
        key: issue.title.toLowerCase().replace(/\s+/g, '_'),
        plainText,
        consequence: template.consequence,
        monthlyImpact,
        technicalDetail: issue.body,
        severity: template.severity,
      });
    }

    return result;
  } catch {
    // NEVER throw
    return [];
  }
}
