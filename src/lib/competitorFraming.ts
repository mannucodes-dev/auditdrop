/**
 * Competitor Framing — emotional, plain-language competitor comparison verdicts.
 *
 * Compares the audited site against each competitor on mobile score, SEO checks,
 * and custom checks. Produces verdicts that are written for non-technical
 * business owners ("they're capturing your customers").
 *
 * NEVER throws — returns empty array on any error or missing data.
 */

import type { Report } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of competitor data as stored in the Firestore report document. */
export interface CompetitorData {
  url: string;
  businessName: string;
  mobileScore: number | null;
  desktopScore: number | null;
  checks: Record<string, boolean | null>;
  seoChecks?: Record<string, boolean | number>;
}

export interface CompetitorVerdict {
  competitorName: string;
  competitorUrl: string;
  competitorMobileScore: number | null;
  yourMobileScore: number | null;
  verdict: 'losing' | 'tied' | 'winning';
  headline: string;
  subtext: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Count how many boolean-true values exist in a checks record. */
function countPassing(checks: Record<string, boolean | number | null> | undefined): number {
  if (!checks) return 0;
  return Object.values(checks).filter((v) => v === true).length;
}

/** Count total boolean fields in a checks record. */
function countTotal(checks: Record<string, boolean | number | null> | undefined): number {
  if (!checks) return 0;
  return Object.values(checks).filter((v) => typeof v === 'boolean').length;
}

/**
 * Calculates a composite advantage score.
 * Positive = you're winning, negative = you're losing.
 */
function calculateAdvantage(
  yourMobile: number | null,
  compMobile: number | null,
  yourChecks: Record<string, boolean | null>,
  compChecks: Record<string, boolean | null | number>,
  yourSeo: number,
  compSeo: number
): number {
  let advantage = 0;

  // Mobile score comparison (weighted heavily)
  const yourScore = yourMobile ?? 0;
  const compScore = compMobile ?? 0;
  advantage += (yourScore - compScore) * 0.5;

  // Custom checks comparison
  const yourPassCount = countPassing(yourChecks);
  const compPassCount = countPassing(compChecks);
  advantage += (yourPassCount - compPassCount) * 5;

  // SEO checks comparison
  advantage += (yourSeo - compSeo) * 3;

  return advantage;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates emotional competitor comparison verdicts for a report.
 *
 * @param report – The full Report object from Firestore. The function looks
 *   for `competitors` data on the report (cast from the Firestore doc shape).
 * @returns An array of CompetitorVerdict objects, one per competitor.
 *   Returns `[]` when there are no competitors or on any error.
 */
export function generateCompetitorVerdicts(
  report: Report & { competitors?: CompetitorData[] }
): CompetitorVerdict[] {
  try {
    const competitors = report.competitors;
    if (!competitors || competitors.length === 0) {
      return [];
    }

    const yourMobile = report.mobileScore;

    // Build your checks as a record for comparison
    const yourIssues = report.issues ?? [];
    const yourChecksRecord: Record<string, boolean | null> = {};

    // Derive check state from issue keys (inverse: if issue exists, check failed)
    const issueKeys = new Set(yourIssues.map((i) => i.title));
    yourChecksRecord.clickToCall = !issueKeys.has('No Tap-to-Call Button');
    yourChecksRecord.https = !issueKeys.has('Site Not Secure (No HTTPS)');
    yourChecksRecord.analytics = !issueKeys.has('No Visitor Tracking');
    yourChecksRecord.viewport = !issueKeys.has('Poor Mobile Layout');
    yourChecksRecord.contactForm = !issueKeys.has('No Contact Form');

    // Count your SEO passing checks from issues
    const seoIssueKeys = new Set(['No Meta Description', 'No Main Heading (H1)', 'No Business Schema']);
    const yourSeoFails = yourIssues.filter((i) => seoIssueKeys.has(i.title)).length;
    const yourSeoPassing = 6 - yourSeoFails; // 6 total SEO checks

    const verdicts: CompetitorVerdict[] = [];

    for (const comp of competitors) {
      const compMobile = comp.mobileScore;
      const compSeoPassing = countPassing(comp.seoChecks);

      const advantage = calculateAdvantage(
        yourMobile,
        compMobile,
        yourChecksRecord,
        comp.checks,
        yourSeoPassing,
        compSeoPassing
      );

      let verdict: 'losing' | 'tied' | 'winning';
      let headline: string;
      let subtext: string;

      const compName = comp.businessName || comp.url;
      const yourScoreDisplay = yourMobile !== null ? String(yourMobile) : '??';
      const compScoreDisplay = compMobile !== null ? String(compMobile) : '??';

      if (advantage < -5) {
        verdict = 'losing';
        headline = `${compName} scores ${compScoreDisplay}. You score ${yourScoreDisplay}. They're capturing your customers.`;
        subtext = `Their website makes a better first impression. Every day this gap stays open, potential customers choose them over you.`;
      } else if (advantage > 5) {
        verdict = 'winning';
        headline = `You're outperforming ${compName}! But there's still money on the table.`;
        subtext = `Your site is ahead, but fixing the remaining issues could widen the gap and lock in even more customers.`;
      } else {
        verdict = 'tied';
        headline = `You're neck-and-neck with ${compName}. Small improvements will pull you ahead.`;
        subtext = `The competition is tight — fixing even one issue could be the tiebreaker that wins you the next customer.`;
      }

      verdicts.push({
        competitorName: compName,
        competitorUrl: comp.url,
        competitorMobileScore: compMobile,
        yourMobileScore: yourMobile,
        verdict,
        headline,
        subtext,
      });
    }

    return verdicts;
  } catch {
    // NEVER throw — return empty on any error
    return [];
  }
}
