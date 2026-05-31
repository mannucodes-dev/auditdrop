/**
 * Deal Heat — pure computation function for lead scoring.
 *
 * Analyses a Report to produce a 0-100 "heat" score that indicates
 * how likely a prospect is to convert. Higher heat = more pain points
 * = more likely to pay for fixes.
 *
 * Scoring factors:
 *  - Poor mobile score → high heat
 *  - High view count → prospect is engaged
 *  - Missing click-to-call / HTTPS → more pain
 *  - Low GBP completeness → needs help
 *  - Recent report view → actively looking
 *
 * NEVER throws — returns cold baseline on any error.
 */

import type { Report } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DealHeat {
  score: number;
  label: 'cold' | 'warm' | 'hot' | 'fire';
  emoji: string;
  factors: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LABEL_THRESHOLDS: Array<{ max: number; label: DealHeat['label']; emoji: string }> = [
  { max: 25, label: 'cold', emoji: '❄️' },
  { max: 50, label: 'warm', emoji: '🌡️' },
  { max: 75, label: 'hot',  emoji: '🔥' },
  { max: 100, label: 'fire', emoji: '💥' },
];

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculates the deal-heat score for a report.
 *
 * @param report – The full Report object
 * @returns DealHeat with score (0-100), label, emoji, and human-readable factors
 */
export function calculateDealHeat(report: Report): DealHeat {
  try {
    let score = 0;
    const factors: string[] = [];

    // ── Mobile score ──────────────────────────────────────────────
    if (report.mobileScore !== null && report.mobileScore < 50) {
      score += 25;
      factors.push(`Mobile score is ${report.mobileScore} (below 50)`);

      // Bonus for very low scores
      if (report.mobileScore < 30) {
        score += 15;
        factors.push(`Mobile score critically low (below 30)`);
      }
    }

    // ── View count ────────────────────────────────────────────────
    if (report.views > 3) {
      score += 20;
      factors.push(`Report viewed ${report.views} times (high engagement)`);

      // Bonus for very engaged prospects
      if (report.views > 10) {
        score += 10;
        factors.push(`Report viewed ${report.views}+ times (very high engagement)`);
      }
    }

    // ── Missing click-to-call ─────────────────────────────────────
    const hasNoClickToCall = report.issues.some(
      (i) => i.title === 'No Tap-to-Call Button'
    );
    if (hasNoClickToCall) {
      score += 10;
      factors.push('No tap-to-call button (losing phone enquiries)');
    }

    // ── No HTTPS ──────────────────────────────────────────────────
    const hasNoHttps = report.issues.some(
      (i) => i.title === 'Site Not Secure (No HTTPS)'
    );
    if (hasNoHttps) {
      score += 5;
      factors.push('Site not secure (no HTTPS)');
    }

    // ── GBP completeness ──────────────────────────────────────────
    if (report.gbpAudit && report.gbpAudit.found) {
      if (report.gbpAudit.profileCompleteness < 50) {
        score += 15;
        factors.push(
          `Google Business Profile only ${report.gbpAudit.profileCompleteness}% complete`
        );
      }
    }

    // ── Recency — report viewed in last 24 hours ──────────────────
    if (report.lastViewedAt) {
      const lastViewed = new Date(report.lastViewedAt).getTime();
      const now = Date.now();
      if (now - lastViewed < TWENTY_FOUR_HOURS_MS) {
        score += 10;
        factors.push('Report viewed within the last 24 hours');
      }
    }

    // ── Cap at 100 ────────────────────────────────────────────────
    score = Math.min(score, 100);

    // ── Determine label and emoji ─────────────────────────────────
    const tier = LABEL_THRESHOLDS.find((t) => score <= t.max) ?? LABEL_THRESHOLDS[3];

    return {
      score,
      label: tier.label,
      emoji: tier.emoji,
      factors,
    };
  } catch {
    // NEVER throw — return cold baseline
    return {
      score: 0,
      label: 'cold',
      emoji: '❄️',
      factors: ['Unable to calculate — insufficient data'],
    };
  }
}
