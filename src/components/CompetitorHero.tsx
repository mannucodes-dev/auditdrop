'use client';

import { type CompetitorVerdict } from '@/lib/competitorFraming';

// ─── CompetitorHero ─────────────────────────────────────────────────

interface CompetitorHeroProps {
  verdicts: CompetitorVerdict[];
}

/**
 * Hero section for reports with competitor data.
 * Shows side-by-side score comparison with emotional verdict.
 * Only renders when competitor data exists.
 */
export function CompetitorHero({ verdicts }: CompetitorHeroProps) {
  if (!verdicts.length) return null;

  // Show the most impactful verdict (losing > tied > winning)
  const sorted = [...verdicts].sort((a, b) => {
    const order = { losing: 0, tied: 1, winning: 2 };
    return order[a.verdict] - order[b.verdict];
  });
  const primary = sorted[0];

  return (
    <section className="mb-8">
      <div className="rounded-2xl overflow-hidden border border-bg-navy-border/40">
        {/* Header banner */}
        <div className={`px-6 py-3 text-sm font-semibold ${
          primary.verdict === 'losing'
            ? 'bg-status-critical/10 text-status-critical border-b border-status-critical/20'
            : primary.verdict === 'tied'
            ? 'bg-brand-amber/10 text-brand-amber border-b border-brand-amber/20'
            : 'bg-status-good/10 text-status-good border-b border-status-good/20'
        }`}>
          {primary.verdict === 'losing' ? '⚠️ Competitor Alert' :
           primary.verdict === 'tied' ? '🤝 Close Race' :
           '✅ You\'re Ahead'}
        </div>

        {/* Score comparison */}
        <div className="bg-bg-card/60 px-6 py-8">
          <div className="flex items-center justify-center gap-8 sm:gap-16 mb-6">
            {/* Your score */}
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Your Site</p>
              <div className={`text-5xl font-bold font-[family-name:var(--font-display)] ${
                (primary.yourMobileScore ?? 0) < 50 ? 'text-status-critical' :
                (primary.yourMobileScore ?? 0) < 75 ? 'text-brand-amber' :
                'text-status-good'
              }`}>
                {primary.yourMobileScore ?? '—'}
              </div>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-text-muted text-sm font-medium">VS</span>
              <div className="w-px h-8 bg-bg-navy-border" />
            </div>

            {/* Competitor score */}
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 truncate max-w-[120px]">
                {primary.competitorName}
              </p>
              <div className={`text-5xl font-bold font-[family-name:var(--font-display)] ${
                (primary.competitorMobileScore ?? 0) < 50 ? 'text-status-critical' :
                (primary.competitorMobileScore ?? 0) < 75 ? 'text-brand-amber' :
                'text-status-good'
              }`}>
                {primary.competitorMobileScore ?? '—'}
              </div>
            </div>
          </div>

          {/* Verdict headline */}
          <p className="text-center text-lg font-semibold text-text-primary font-[family-name:var(--font-display)]">
            {primary.headline}
          </p>
          <p className="text-center text-sm text-text-secondary mt-2 max-w-md mx-auto">
            {primary.subtext}
          </p>
        </div>
      </div>

      {/* Additional competitors (if any) */}
      {sorted.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {sorted.slice(1).map((v) => (
            <div
              key={v.competitorUrl}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card/40 border border-bg-navy-border/30 text-sm"
            >
              <span className={
                v.verdict === 'losing' ? 'text-status-critical' :
                v.verdict === 'tied' ? 'text-brand-amber' :
                'text-status-good'
              }>
                {v.verdict === 'losing' ? '↓' : v.verdict === 'tied' ? '↔' : '↑'}
              </span>
              <span className="text-text-secondary truncate max-w-[150px]">{v.competitorName}</span>
              <span className="text-text-muted">
                {v.competitorMobileScore ?? '—'} vs {v.yourMobileScore ?? '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
