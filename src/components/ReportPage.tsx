'use client';

import Image from 'next/image';
import ScoreDial from '@/components/ScoreDial';
import IssueCard from '@/components/IssueCard';
import { Badge } from '@/components/ui/Badge';
import { calculateRevenueImpact, generateIssues } from '@/lib/reportUtils';
import type { BusinessCategory } from '@/lib/scraper';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportPageProps {
  report: {
    id: string;
    businessName: string;
    businessUrl: string;
    screenshotUrl: string;
    mobileScore: number | null;
    desktopScore: number | null;
    metrics: { fcp: string; lcp: string; tbt: string; cls: string };
    checks: {
      hasPhone: boolean | null;
      hasClickToCall: boolean | null;
      hasHttps: boolean | null;
      hasAnalytics: boolean | null;
      hasViewport: boolean | null;
      hasContactForm: boolean | null;
    };
    seoChecks?: {
      hasMetaTitle: boolean;
      hasMetaDescription: boolean;
      hasH1: boolean;
      hasCanonical: boolean;
      hasStructuredData: boolean;
      hasOpenGraph: boolean;
      titleLength: number;
      titleTooLong: boolean;
      titleTooShort: boolean;
    };
    competitors?: Array<{
      url: string;
      businessName: string;
      mobileScore: number | null;
      desktopScore: number | null;
      checks: Record<string, boolean | null>;
      seoChecks?: Record<string, boolean | number>;
    }>;
    viewCount: number;
    userId: string;
    businessCategory?: string;
    gbpAudit?: {
      found: boolean;
      rating: number | null;
      reviewCount: number | null;
      hasPhotos: boolean;
      photoCount: number;
      hasHours: boolean;
      hasPhone: boolean;
      hasWebsite: boolean;
      hasDescription: boolean;
      profileCompleteness: number;
      reputationScore: number;
      issues: Array<{ title: string; body: string; impact: string }>;
    };
  };
  ownerProfile: {
    displayName: string;
    ctaUrl: string;
    ctaLabel: string;
  } | null;
}

// ---------------------------------------------------------------------------
// SEO check labels
// ---------------------------------------------------------------------------

const SEO_CHECK_LABELS: Record<string, string> = {
  hasMetaTitle: 'Meta Title',
  hasMetaDescription: 'Meta Description',
  hasH1: 'H1 Tag',
  hasCanonical: 'Canonical URL',
  hasStructuredData: 'Structured Data',
  hasOpenGraph: 'Open Graph',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderStars(rating: number | null) {
  const filled = rating != null ? Math.round(rating) : 0;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating ?? 0} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-status-warning' : 'text-text-muted'}>
          ★
        </span>
      ))}
    </span>
  );
}

function getCompletenessColor(pct: number): string {
  if (pct >= 80) return 'bg-status-good';
  if (pct >= 50) return 'bg-status-warning';
  return 'bg-status-critical';
}

function getImpactVariant(impact: string): 'critical' | 'warning' | 'good' {
  if (impact === 'High') return 'critical';
  if (impact === 'Medium') return 'warning';
  return 'good';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportPage({ report, ownerProfile }: ReportPageProps) {
  // Decoded business name
  const businessName = decodeURIComponent(report.businessName);

  // Revenue impact
  const revenueImpact = calculateRevenueImpact(
    report.mobileScore,
    report.desktopScore,
    report.checks,
    report.seoChecks,
    (report.businessCategory as BusinessCategory) || 'general'
  );

  // Issues
  const issues = generateIssues(
    report.checks,
    report.metrics,
    report.mobileScore,
    report.seoChecks
  );

  // SEO entries
  const seoChecks = report.seoChecks;
  const seoEntries = seoChecks
    ? Object.entries(SEO_CHECK_LABELS).map(([key, label]) => ({
        key,
        label,
        pass: !!(seoChecks as Record<string, unknown>)[key],
      }))
    : [];
  const seoPass = seoEntries.filter((e) => e.pass);
  const seoFail = seoEntries.filter((e) => !e.pass);

  // Issue count badge variant
  const issueBadgeVariant: 'critical' | 'warning' | 'good' =
    issues.length > 5 ? 'critical' : issues.length > 2 ? 'warning' : 'good';

  // Revenue banner styles by severity
  const bannerStyles: Record<string, string> = {
    critical: 'border-l-status-critical bg-status-critical-bg/50',
    poor: 'border-l-status-warning bg-status-warning-bg/50',
    fair: 'border-l-brand-primary bg-brand-glow',
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ── 1. Top Badge ── */}
        <div className="flex justify-center">
          <span className="text-text-muted bg-bg-tertiary border border-bg-border rounded-full px-4 py-1.5 text-xs">
            Website Audit Report • Powered by AuditDrop
          </span>
        </div>

        {/* ── 2. Business Header ── */}
        <section className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {businessName}
          </h1>
          <p className="text-text-muted text-sm truncate">{report.businessUrl}</p>

          {report.screenshotUrl && (
            <div className="max-w-[700px] mx-auto rounded-lg overflow-hidden shadow-elevated border border-bg-border">
              {/* Browser chrome bar */}
              <div className="bg-bg-tertiary px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-status-critical/60" />
                  <div className="w-3 h-3 rounded-full bg-status-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-status-good/60" />
                </div>
                <div className="flex-1 ml-2">
                  <div className="bg-bg-secondary rounded-md px-3 py-1 text-xs text-text-muted truncate max-w-md mx-auto">
                    {report.businessUrl}
                  </div>
                </div>
              </div>
              <Image
                src={report.screenshotUrl}
                alt={`Screenshot of ${businessName}`}
                width={700}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}
        </section>

        {/* ── 3. Revenue Impact Banner ── */}
        <section>
          <div
            className={`rounded-[var(--radius-lg)] border-l-4 border border-bg-border p-5 sm:p-6 ${bannerStyles[revenueImpact.severity]}`}
          >
            <p className="text-lg sm:text-xl font-bold text-text-primary">
              {revenueImpact.headline}
            </p>
            <p className="text-text-muted text-sm mt-1">
              Based on ~{revenueImpact.monthlyVisitorsEstimate} estimated monthly
              visitors
            </p>
            <p className="text-xs text-text-muted italic mt-2">
              {revenueImpact.disclaimer}
            </p>
          </div>
        </section>

        {/* ── 4. Performance Scores ── */}
        <section>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <ScoreDial score={report.mobileScore} label="Mobile" />
            <ScoreDial score={report.desktopScore} label="Desktop" />
          </div>
        </section>

        {/* ── 5. Key Metrics Grid ── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {(
              [
                { key: 'lcp', label: 'LCP' },
                { key: 'fcp', label: 'FCP' },
                { key: 'tbt', label: 'TBT' },
                { key: 'cls', label: 'CLS' },
              ] as const
            ).map(({ key, label }) => (
              <div
                key={key}
                className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4 text-center"
              >
                <p className="text-lg font-bold text-text-primary">
                  {report.metrics[key] || '—'}
                </p>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Issues Found ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Issues Found</h2>
            <Badge variant={issueBadgeVariant}>{issues.length}</Badge>
          </div>

          {issues.length === 0 ? (
            <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-6 text-center">
              <p className="text-status-good font-medium">
                🎉 No critical issues found!
              </p>
            </div>
          ) : (
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
          )}
        </section>

        {/* ── 7. SEO Health ── */}
        {seoChecks && seoEntries.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              SEO Health
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* What's Working */}
              <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4">
                <h3 className="text-status-good font-semibold text-sm mb-3">
                  What&apos;s Working ✓
                </h3>
                {seoPass.length === 0 ? (
                  <p className="text-text-muted text-sm">None yet</p>
                ) : (
                  <ul className="space-y-2">
                    {seoPass.map((entry) => (
                      <li
                        key={entry.key}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="text-status-good">✓</span>
                        {entry.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Needs Fixing */}
              <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4">
                <h3 className="text-status-critical font-semibold text-sm mb-3">
                  Needs Fixing ✗
                </h3>
                {seoFail.length === 0 ? (
                  <p className="text-text-muted text-sm">All clear!</p>
                ) : (
                  <ul className="space-y-2">
                    {seoFail.map((entry) => (
                      <li
                        key={entry.key}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="text-status-critical">✗</span>
                        {entry.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 8. Google Business Profile ── */}
        {report.gbpAudit?.found && (
          <section>
            <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-5 sm:p-6 space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Google Business Presence
              </h2>

              {/* Rating + Reviews */}
              <div className="flex items-center gap-3 flex-wrap">
                {renderStars(report.gbpAudit.rating)}
                {report.gbpAudit.rating != null && (
                  <span className="text-text-primary font-bold text-lg">
                    {report.gbpAudit.rating}
                  </span>
                )}
                {report.gbpAudit.reviewCount != null && (
                  <span className="text-text-muted text-sm">
                    ({report.gbpAudit.reviewCount} reviews)
                  </span>
                )}
              </div>

              {/* Profile completeness bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">
                    Profile completeness
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {report.gbpAudit.profileCompleteness}%
                  </span>
                </div>
                <div className="bg-bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getCompletenessColor(report.gbpAudit.profileCompleteness)}`}
                    style={{
                      width: `${Math.min(report.gbpAudit.profileCompleteness, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* GBP Issues */}
              {report.gbpAudit.issues.length > 0 && (
                <div className="space-y-2 pt-2">
                  {report.gbpAudit.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-bg-primary border border-bg-border rounded-[var(--radius-md)] p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {issue.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {issue.body}
                        </p>
                      </div>
                      <Badge variant={getImpactVariant(issue.impact)}>
                        {issue.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 9. CTA Box ── */}
        {ownerProfile && (
          <section>
            <div className="bg-bg-secondary border-2 border-brand-primary/30 rounded-[var(--radius-xl)] p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-text-primary">
                These issues are fixable.
              </h3>
              <p className="text-text-secondary mt-2">
                {ownerProfile.displayName} can help improve your website.
              </p>

              {ownerProfile.ctaUrl && (
                <a
                  href={ownerProfile.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-[var(--radius-lg)] px-8 py-3 text-lg font-semibold transition-colors"
                >
                  {ownerProfile.ctaLabel || 'Get in Touch'}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── 10. Footer ── */}
        <footer className="text-center text-text-muted text-xs py-8">
          Powered by AuditDrop
        </footer>
      </div>
    </div>
  );
}
