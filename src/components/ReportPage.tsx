'use client';

import { useState, useEffect } from 'react';
import ScoreDial from '@/components/ScoreDial';
import IssueCard from '@/components/IssueCard';
import { Badge } from '@/components/ui/Badge';
import { CompetitorHero } from '@/components/CompetitorHero';
import { LanguageToggle } from '@/components/LanguageToggle';
import { FixPreview } from '@/components/FixPreview';
import { ProposalCTA } from '@/components/ProposalCTA';
import { calculateRevenueImpact, generateIssues } from '@/lib/reportUtils';
import { generateCompetitorVerdicts } from '@/lib/competitorFraming';
import { translateToMoneyIssues } from '@/lib/moneyTranslation';
import { t, type ReportLanguage } from '@/lib/translations';
import { decodeHtmlEntities } from '@/lib/scraper';
import type { BusinessCategory } from '@/lib/scraper';
import type { Report, AuditIssue } from '@/lib/types';

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
// Screenshot Placeholder (CSS-only fallback — no broken img)
// ---------------------------------------------------------------------------

function ScreenshotPlaceholder({ businessUrl, businessName }: { businessUrl: string; businessName: string }) {
  let domain = businessUrl;
  try { domain = new URL(businessUrl).hostname; } catch { /* use raw */ }

  return (
    <div className="max-w-[700px] mx-auto rounded-lg overflow-hidden shadow-elevated border border-bg-border">
      <div className="bg-bg-tertiary px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-status-critical/60" />
          <div className="w-3 h-3 rounded-full bg-status-warning/60" />
          <div className="w-3 h-3 rounded-full bg-status-good/60" />
        </div>
        <div className="flex-1 ml-2">
          <div className="bg-bg-secondary rounded-md px-3 py-1 text-xs text-text-muted truncate max-w-md mx-auto">
            {businessUrl}
          </div>
        </div>
      </div>
      <div className="bg-bg-secondary flex flex-col items-center justify-center py-16 px-6">
        <svg className="w-12 h-12 text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <p className="text-lg font-bold text-text-primary mb-1">{businessName}</p>
        <p className="text-sm text-text-muted">{domain}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screenshot with 3-layer fallback
// ---------------------------------------------------------------------------

function ScreenshotWithFallback({ screenshotUrl, businessUrl, businessName }: {
  screenshotUrl: string;
  businessUrl: string;
  businessName: string;
}) {
  const [src, setSrc] = useState(screenshotUrl);
  const [failed, setFailed] = useState(false);
  const [triedMicrolink, setTriedMicrolink] = useState(false);

  if (failed) {
    return <ScreenshotPlaceholder businessUrl={businessUrl} businessName={businessName} />;
  }

  const handleError = () => {
    if (!triedMicrolink) {
      // Layer 2: Try Microlink free API
      const encoded = encodeURIComponent(businessUrl);
      setSrc(`https://api.microlink.io/?url=${encoded}&screenshot=true&meta=false&embed=screenshot.url`);
      setTriedMicrolink(true);
    } else {
      // Layer 3: CSS placeholder
      setFailed(true);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto rounded-lg overflow-hidden shadow-elevated border border-bg-border">
      <div className="bg-bg-tertiary px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-status-critical/60" />
          <div className="w-3 h-3 rounded-full bg-status-warning/60" />
          <div className="w-3 h-3 rounded-full bg-status-good/60" />
        </div>
        <div className="flex-1 ml-2">
          <div className="bg-bg-secondary rounded-md px-3 py-1 text-xs text-text-muted truncate max-w-md mx-auto">
            {businessUrl}
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Screenshot of ${businessName}`}
        onError={handleError}
        className="w-full h-auto"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportPage({ report, ownerProfile }: ReportPageProps) {
  // Fix 1: Decode HTML entities in business name
  const businessName = decodeHtmlEntities(report.businessName);

  // Fix 2: Treat score 0 as null (PSI failure sentinel)
  const displayMobileScore = (report.mobileScore === null || report.mobileScore === 0) ? null : report.mobileScore;
  const displayDesktopScore = (report.desktopScore === null || report.desktopScore === 0) ? null : report.desktopScore;

  // Revenue impact
  const revenueImpact = calculateRevenueImpact(
    displayMobileScore,
    displayDesktopScore,
    report.checks,
    report.seoChecks,
    (report.businessCategory as BusinessCategory) || 'general'
  );

  // Issues
  const issues = generateIssues(
    report.checks,
    report.metrics,
    displayMobileScore,
    report.seoChecks
  );

  // ── Phase 3: Moat features ──────────────────────────────────────

  // Language toggle state
  const [language, setLanguage] = useState<ReportLanguage>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('auditdrop-lang');
      if (saved === 'hi-simple') setLanguage('hi-simple');
    } catch { /* ignore */ }
  }, []);

  // Competitor verdicts
  const competitorVerdicts = generateCompetitorVerdicts(
    { ...buildReportForFraming(report, issues, displayMobileScore, displayDesktopScore) }
  );

  // Money-first issue translations
  const category = (report.businessCategory as BusinessCategory) || 'general';
  const auditIssues: AuditIssue[] = issues.map((i) => ({
    icon: i.icon,
    title: i.title,
    body: i.body,
    impact: i.impact,
  }));
  const moneyIssues = translateToMoneyIssues(auditIssues, category);

  // "For the techies" toggle
  const [showTechnical, setShowTechnical] = useState(false);

  // Issue keys for FixPreview matching
  const issueKeys = issues.map((i) => i.key ?? i.title.toLowerCase().replace(/\s+/g, '_'));

  // Estimated monthly loss for ProposalCTA
  const estimatedMonthlyLoss = revenueImpact.hasIssues
    ? `${revenueImpact.lostRevenueMin.toLocaleString('en-IN')}–${revenueImpact.lostRevenueMax.toLocaleString('en-IN')}`
    : '';

  // Top 3 issues summary for WhatsApp message
  const topIssues = moneyIssues.slice(0, 3).map((mi) => mi.plainText);

  // ── End moat setup ──────────────────────────────────────────────

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
    good: 'border-l-status-good bg-status-good-bg/50',
  };

  // Fix 5: CTA fallback values
  const ctaDisplayName = ownerProfile?.displayName || 'A web developer';
  const ctaLabel = ownerProfile?.ctaLabel || 'Book a Free Call';
  const ctaUrl = ownerProfile?.ctaUrl || null;

  return (
    <div className="min-h-screen bg-bg-primary hero-gradient grid-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ── 1. Top Badge + Language Toggle ── */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted bg-bg-tertiary border border-bg-border rounded-full px-4 py-1.5 text-xs">
            Website Audit Report • Powered by AuditDrop
          </span>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>

        {/* ── 2. Business Header ── */}
        <section className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {businessName}
          </h1>
          <p className="text-text-muted text-sm truncate">{report.businessUrl}</p>

          {report.screenshotUrl && (
            <ScreenshotWithFallback
              screenshotUrl={report.screenshotUrl}
              businessUrl={report.businessUrl}
              businessName={businessName}
            />
          )}
          {!report.screenshotUrl && (
            <ScreenshotPlaceholder businessUrl={report.businessUrl} businessName={businessName} />
          )}
        </section>

        {/* ── 2b. Competitor Hero (Phase 3: Feature 1) ── */}
        <CompetitorHero verdicts={competitorVerdicts} />

        {/* ── 3. Revenue Impact Banner ── */}
        <section>
          {revenueImpact.hasIssues === false ? (
            <div className="rounded-lg border-l-4 border border-bg-border p-5 sm:p-6 border-l-status-good bg-status-good-bg/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-status-good">
                    {revenueImpact.headline}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    {revenueImpact.subtext}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg border-l-4 border border-bg-border p-5 sm:p-6 ${bannerStyles[revenueImpact.severity]}`}
            >
              <p className="text-lg sm:text-xl font-bold text-text-primary">
                {revenueImpact.headline}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {revenueImpact.subtext}
              </p>
              {revenueImpact.disclaimer && (
                <p className="text-xs text-text-muted italic mt-2">
                  {revenueImpact.disclaimer}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── 4. Performance Scores ── */}
        <section>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <ScoreDial score={displayMobileScore} label="Mobile" />
            <ScoreDial score={displayDesktopScore} label="Desktop" />
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
                className="glass-card rounded-xl p-4 text-center"
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
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-status-good font-medium">
                🎉 {t('report.verdict.good', language)}
              </p>
            </div>
          ) : (
            <>
              {/* Money-first view (Phase 3: Feature 2) */}
              <div className="space-y-3">
                {moneyIssues.map((mi) => (
                  <div key={mi.key} className="glass-card rounded-xl p-4 border-l-4 border-l-transparent" style={{
                    borderLeftColor: mi.severity === 'critical' ? 'var(--color-status-critical)' : mi.severity === 'warning' ? 'var(--color-brand-amber)' : 'var(--color-bg-navy-border)',
                  }}>
                    <p className="text-sm font-semibold text-text-primary">
                      {mi.plainText}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {mi.consequence}
                    </p>
                    <p className="text-xs font-medium text-brand-amber mt-2">
                      {mi.monthlyImpact}
                    </p>
                  </div>
                ))}
              </div>

              {/* "For the techies" toggle */}
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{showTechnical ? '▼' : '▶'}</span>
                For the techies 🔧
              </button>

              {showTechnical && (
                <div className="space-y-4 mt-3">
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
            </>
          )}
        </section>

        {/* ── 6b. Fix Preview (Phase 3: Feature 4) ── */}
        <FixPreview issueKeys={issueKeys} />

        {/* ── 7. SEO Health ── */}
        {seoChecks && seoEntries.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              SEO Health
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* What's Working */}
              <div className="glass-card rounded-xl p-4">
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
              <div className="glass-card rounded-xl p-4">
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
            <div className="glass-card rounded-xl p-5 sm:p-6 space-y-4">
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
                      className="flex items-start gap-3 bg-bg-primary border border-bg-border rounded-lg p-3"
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

        {/* ── 9. Enhanced CTA (Phase 3: Feature 5) ── */}
        <ProposalCTA
          report={{
            id: report.id,
            uid: report.userId,
            url: report.businessUrl,
            businessName: businessName,
            screenshotUrl: report.screenshotUrl,
            mobileScore: displayMobileScore,
            desktopScore: displayDesktopScore,
            metrics: report.metrics,
            issues: auditIssues,
            ownerProfile: {
              displayName: ownerProfile?.displayName || '',
              ctaUrl: ownerProfile?.ctaUrl || '',
              ctaLabel: ownerProfile?.ctaLabel || 'Book a Free Call',
            },
            views: report.viewCount,
            lastViewedAt: null,
            createdAt: '',
          }}
          ownerProfile={ownerProfile ? {
            displayName: ownerProfile.displayName,
            ctaUrl: ownerProfile.ctaUrl,
            ctaLabel: ownerProfile.ctaLabel,
            whatsappNumber: (ownerProfile as Record<string, unknown>).whatsappNumber as string | undefined,
            useWhatsApp: (ownerProfile as Record<string, unknown>).useWhatsApp as boolean | undefined,
          } : null}
          estimatedMonthlyLoss={estimatedMonthlyLoss}
          topIssues={topIssues}
        />

        {/* Fallback: simple CTA when ProposalCTA has no data */}
        {!ownerProfile && (
          <section>
            <div className="bg-bg-secondary border-2 border-brand-primary/30 rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-text-primary">
                These issues are fixable.
              </h3>
              <p className="text-text-secondary mt-2">
                Contact a web developer to improve your website.
              </p>
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

// ---------------------------------------------------------------------------
// Helpers for Phase 3 wiring
// ---------------------------------------------------------------------------

import type { Issue } from '@/lib/reportUtils';
import type { CompetitorData } from '@/lib/competitorFraming';

/**
 * Adapts ReportPage props into the shape needed by generateCompetitorVerdicts.
 * This bridges the component's flat prop type to the Report & { competitors } union.
 */
function buildReportForFraming(
  report: ReportPageProps['report'],
  issues: Issue[],
  mobileScore: number | null,
  desktopScore: number | null,
): Report & { competitors?: CompetitorData[] } {
  const auditIssues: AuditIssue[] = issues.map((i) => ({
    icon: i.icon,
    title: i.title,
    body: i.body,
    impact: i.impact,
  }));

  return {
    id: report.id,
    uid: report.userId,
    url: report.businessUrl,
    businessName: report.businessName,
    screenshotUrl: report.screenshotUrl,
    mobileScore,
    desktopScore,
    metrics: report.metrics,
    issues: auditIssues,
    ownerProfile: {
      displayName: '',
      ctaUrl: '',
      ctaLabel: '',
    },
    views: report.viewCount,
    lastViewedAt: null,
    createdAt: '',
    businessCategory: report.businessCategory as BusinessCategory | undefined,
    gbpAudit: report.gbpAudit ? {
      ...report.gbpAudit,
      issues: report.gbpAudit.issues.map((i) => ({
        ...i,
        impact: i.impact as 'High' | 'Medium' | 'Low',
      })),
    } : undefined,
    competitors: report.competitors as CompetitorData[] | undefined,
  };
}
