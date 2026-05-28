'use client';

import ScoreDial from './ScoreDial';
import IssueCard from './IssueCard';
import { generateIssues, generateVerdict } from '@/lib/reportUtils';
import type { SEOChecks } from '@/lib/scraper';

interface CompetitorData {
  url: string;
  businessName: string;
  mobileScore: number;
  desktopScore: number | null;
  checks: {
    hasPhone: boolean | null;
    hasClickToCall: boolean | null;
    hasHttps: boolean | null;
    hasAnalytics: boolean | null;
    hasViewport: boolean | null;
    hasContactForm: boolean | null;
  };
  seoChecks?: SEOChecks;
}

interface ReportData {
  id: string;
  businessName: string;
  businessUrl: string;
  screenshotUrl?: string;
  mobileScore: number;
  desktopScore: number | null;
  metrics: {
    fcp: string;
    lcp: string;
    tbt: string;
    cls: string;
  };
  checks: {
    hasPhone: boolean | null;
    hasClickToCall: boolean | null;
    hasHttps: boolean | null;
    hasAnalytics: boolean | null;
    hasViewport: boolean | null;
    hasContactForm: boolean | null;
  };
  seoChecks?: SEOChecks;
  competitors?: CompetitorData[];
}

interface OwnerProfile {
  displayName: string;
  ctaUrl: string;
  ctaLabel: string;
}

interface ReportPageProps {
  report: ReportData;
  ownerProfile: OwnerProfile | null;
}

const METRIC_CONTEXT: Record<string, { label: string; description: string; icon: string }> = {
  fcp: {
    label: 'First Contentful Paint',
    description: 'Time until the first text or image is visible to visitors.',
    icon: '🎨',
  },
  lcp: {
    label: 'Largest Contentful Paint',
    description: 'Time until the main content of the page is fully loaded.',
    icon: '⚡',
  },
  tbt: {
    label: 'Total Blocking Time',
    description: 'Total time the page was unresponsive to user input.',
    icon: '🧊',
  },
  cls: {
    label: 'Cumulative Layout Shift',
    description: 'How much the page layout shifts unexpectedly while loading.',
    icon: '📐',
  },
};

// SEO checks labels for the scorecard
const SEO_CHECK_LABELS: Record<string, string> = {
  hasMetaTitle: 'Page Title',
  hasMetaDescription: 'Meta Description',
  hasH1: 'Main Heading (H1)',
  hasCanonical: 'Canonical URL',
  hasStructuredData: 'Structured Data (Schema)',
  hasOpenGraph: 'Open Graph Tags',
};

const VERDICT_COLORS = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    textLarge: 'text-red-400',
    icon: '🚨',
  },
  poor: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    textLarge: 'text-amber-400',
    icon: '⚠️',
  },
  fair: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-500/5',
    textLarge: 'text-yellow-400',
    icon: '💡',
  },
};

function CheckIcon({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="text-emerald-400 text-lg">✅</span>
  ) : (
    <span className="text-red-400 text-lg">❌</span>
  );
}

function ScoreBadge({ score, isNull }: { score: number | null; isNull?: boolean }) {
  if (isNull || score === null || score === undefined) {
    return <span className="px-2 py-0.5 rounded-md bg-slate-700/60 text-xs text-slate-400">N/A</span>;
  }
  const color =
    score >= 90
      ? 'bg-emerald-500/20 text-emerald-400'
      : score >= 50
        ? 'bg-amber-500/20 text-amber-400'
        : 'bg-red-500/20 text-red-400';
  return <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${color}`}>{score}</span>;
}

export default function ReportPage({ report, ownerProfile }: ReportPageProps) {
  const issues = generateIssues(report.checks, report.metrics, report.mobileScore, report.seoChecks);
  const verdict = generateVerdict(report.mobileScore, report.checks);
  const verdictStyle = VERDICT_COLORS[verdict.severity];

  // SEO scorecard data
  const seoChecks = report.seoChecks;
  const seoEntries = seoChecks
    ? Object.entries(SEO_CHECK_LABELS).map(([key, label]) => ({
        key,
        label,
        pass: seoChecks[key as keyof SEOChecks] as boolean,
      }))
    : [];
  const seoPassList = seoEntries.filter((e) => e.pass);
  const seoFailList = seoEntries.filter((e) => !e.pass);

  // Competitor data
  const competitors = report.competitors || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Website Audit Report
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {report.businessName || 'Website Audit'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base break-all">
            {report.businessUrl}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-20">
        {/* Screenshot */}
        {report.screenshotUrl && (
          <section className="mb-10">
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50">
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 ml-4">
                  <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 truncate max-w-md mx-auto">
                    {report.businessUrl}
                  </div>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.screenshotUrl}
                alt={`Screenshot of ${report.businessName}`}
                className="w-full"
                loading="lazy"
              />
            </div>
          </section>
        )}

        {/* ── Verdict Banner (Feature 1) ── */}
        <section className="mb-10">
          <div
            className={`
              rounded-xl border-l-4 ${verdictStyle.border} ${verdictStyle.bg}
              border border-slate-800 p-6 sm:p-8
              transition-all duration-300
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{verdictStyle.icon}</span>
              <div>
                <p className={`text-xl sm:text-2xl font-bold ${verdictStyle.textLarge}`}>
                  Estimated Lost Leads: ~{verdict.lostLeadsMin}–{verdict.lostLeadsMax} per month
                </p>
                <p className="text-slate-300 mt-2 text-sm sm:text-base">
                  {verdict.verdictText}
                </p>
                <p className="text-slate-500 mt-3 text-xs leading-relaxed">
                  Based on industry averages for businesses in this category.
                  Actual impact depends on your traffic volume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Score Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">Performance Scores</h2>
          <div className="flex items-center justify-center gap-8 sm:gap-16">
            <ScoreDial score={report.mobileScore} size="lg" label="Mobile" />
            <ScoreDial score={report.desktopScore} size="lg" label="Desktop" />
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(report.metrics).map(([key, value]) => {
              const context = METRIC_CONTEXT[key];
              if (!context) return null;
              return (
                <div
                  key={key}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 transition-all duration-300 hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{context.icon}</span>
                    <span className="text-sm font-medium text-slate-400">{context.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{value || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{context.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Issues Section */}
        {issues.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-slate-200">Issues Found</h2>
              <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium">
                {issues.length}
              </span>
            </div>
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <IssueCard
                  key={index}
                  icon={issue.icon}
                  title={issue.title}
                  body={issue.body}
                  impact={issue.impact as 'High' | 'Medium' | 'Low'}
                  fixTime={issue.fixTime}
                  fixCost={issue.fixCost}
                  fixDifficulty={issue.fixDifficulty}
                  fixDescription={issue.fixDescription}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── SEO Health Section (Feature 2) ── */}
        {seoChecks && seoEntries.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-slate-200">SEO Health</h2>
              <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium">
                {seoPassList.length}/{seoEntries.length} passing
              </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              {/* Failing checks */}
              {seoFailList.length > 0 && (
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span>❌</span> What needs fixing
                  </h3>
                  <div className="space-y-2">
                    {seoFailList.map((entry) => (
                      <div
                        key={entry.key}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/10"
                      >
                        <CheckIcon pass={false} />
                        <span className="text-sm text-slate-300">{entry.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passing checks */}
              {seoPassList.length > 0 && (
                <div className={`p-4 sm:p-5 ${seoFailList.length > 0 ? 'border-t border-slate-800' : ''}`}>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <span>✅</span> What&apos;s working
                  </h3>
                  <div className="space-y-2">
                    {seoPassList.map((entry) => (
                      <div
                        key={entry.key}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <CheckIcon pass={true} />
                        <span className="text-sm text-slate-300">{entry.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Title length info */}
              {seoChecks.hasMetaTitle && (
                <div className="px-4 sm:px-5 pb-4">
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-800/50 text-xs text-slate-400">
                    <span>📏</span>
                    Title length: {seoChecks.titleLength} characters
                    {seoChecks.titleTooLong && <span className="text-amber-400 ml-1">(too long — aim for under 60)</span>}
                    {seoChecks.titleTooShort && <span className="text-amber-400 ml-1">(too short — aim for 30–60)</span>}
                    {!seoChecks.titleTooLong && !seoChecks.titleTooShort && <span className="text-emerald-400 ml-1">(good length)</span>}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Competitor Comparison (Feature 3) ── */}
        {competitors.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-slate-200">Competitor Comparison</h2>
              <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium">
                vs {competitors.length} competitor{competitors.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Comparison Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-slate-400 font-medium px-4 py-3 min-w-[140px]">Metric</th>
                    <th className="text-center text-violet-400 font-semibold px-4 py-3">
                      Your Site
                    </th>
                    {competitors.map((comp, i) => (
                      <th key={i} className="text-center text-slate-400 font-medium px-4 py-3 max-w-[140px] truncate">
                        {comp.businessName || `Competitor ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {/* Mobile Score */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">📱 Mobile Score</td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge score={report.mobileScore} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <ScoreBadge score={comp.mobileScore} />
                      </td>
                    ))}
                  </tr>
                  {/* Desktop Score */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">🖥️ Desktop Score</td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge score={report.desktopScore} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <ScoreBadge score={comp.desktopScore} />
                      </td>
                    ))}
                  </tr>
                  {/* HTTPS */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">🔒 Has HTTPS</td>
                    <td className="px-4 py-3 text-center">
                      <CheckIcon pass={report.checks.hasHttps === true} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <CheckIcon pass={comp.checks.hasHttps === true} />
                      </td>
                    ))}
                  </tr>
                  {/* Click-to-Call */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">📞 Click-to-Call</td>
                    <td className="px-4 py-3 text-center">
                      <CheckIcon pass={report.checks.hasClickToCall === true} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <CheckIcon pass={comp.checks.hasClickToCall === true} />
                      </td>
                    ))}
                  </tr>
                  {/* Meta Description */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">🔍 Meta Description</td>
                    <td className="px-4 py-3 text-center">
                      <CheckIcon pass={report.seoChecks?.hasMetaDescription === true} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <CheckIcon pass={comp.seoChecks?.hasMetaDescription === true} />
                      </td>
                    ))}
                  </tr>
                  {/* H1 */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">🏷️ Main Heading (H1)</td>
                    <td className="px-4 py-3 text-center">
                      <CheckIcon pass={report.seoChecks?.hasH1 === true} />
                    </td>
                    {competitors.map((comp, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <CheckIcon pass={comp.seoChecks?.hasH1 === true} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Insight line */}
            {competitors[0] && (
              <div className="mt-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="text-violet-400 font-medium">💡 Insight: </span>
                  Your site scores <span className="font-bold text-white">{report.mobileScore}</span> on mobile.{' '}
                  <span className="font-medium text-white">{competitors[0].businessName || 'Your competitor'}</span>{' '}
                  scores <span className="font-bold text-white">{competitors[0].mobileScore}</span>.{' '}
                  {report.mobileScore < competitors[0].mobileScore
                    ? 'Customers are more likely to find and trust the faster site.'
                    : report.mobileScore > competitors[0].mobileScore
                      ? 'You\'re ahead on speed, but there may be other areas to improve.'
                      : 'You\'re neck and neck — small improvements can give you the edge.'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* CTA Section */}
        {ownerProfile && ownerProfile.ctaUrl && (
          <section className="mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-purple-600/20 border border-violet-500/20 p-8 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/30 mb-5">
                  <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  These issues are fixable.
                </h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  {ownerProfile.displayName
                    ? `${ownerProfile.displayName} can help improve your website's performance, fix these issues, and help you get more customers.`
                    : 'Get these issues fixed and improve your website\'s performance to attract more customers.'}
                </p>
                <a
                  href={ownerProfile.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
                >
                  {ownerProfile.ctaLabel || 'Book a Free Call'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-600 text-sm">
            Powered by{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              AuditDrop
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}
