'use client';

// ─── FixPreview ─────────────────────────────────────────────────────

interface FixPreviewProps {
  /** Issue keys present in the report */
  issueKeys: string[];
}

interface FixTemplate {
  matchKeys: string[];
  label: string;
  description: string;
  before: {
    title: string;
    visual: React.ReactNode;
    caption: string;
  };
  after: {
    title: string;
    visual: React.ReactNode;
    caption: string;
  };
}

/**
 * Shows before/after concept previews for fixable issues.
 * Template-driven — only renders when matching issues exist.
 * Pure React components, no external assets.
 */
export function FixPreview({ issueKeys }: FixPreviewProps) {
  const templates = getMatchingTemplates(issueKeys);

  if (templates.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <h3 className="text-base font-semibold text-text-primary">
          What this could look like after fixes
        </h3>
      </div>

      <div className="space-y-4">
        {templates.slice(0, 2).map((tpl) => (
          <div
            key={tpl.label}
            className="rounded-2xl border border-bg-navy-border/40 overflow-hidden bg-bg-card/40"
          >
            <div className="px-4 py-2 bg-bg-card/60 border-b border-bg-navy-border/30">
              <p className="text-sm font-medium text-text-secondary">{tpl.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{tpl.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Before */}
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-bg-navy-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-status-critical" />
                  <span className="text-xs font-medium text-status-critical uppercase tracking-wider">
                    {tpl.before.title}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden">
                  {tpl.before.visual}
                </div>
                <p className="text-xs text-text-muted mt-2">{tpl.before.caption}</p>
              </div>

              {/* After */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-status-good" />
                  <span className="text-xs font-medium text-status-good uppercase tracking-wider">
                    {tpl.after.title}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden">
                  {tpl.after.visual}
                </div>
                <p className="text-xs text-text-muted mt-2">{tpl.after.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Template Definitions ───────────────────────────────────────────

function getMatchingTemplates(issueKeys: string[]): FixTemplate[] {
  const keySet = new Set(issueKeys.map(k => k.toLowerCase()));
  return ALL_TEMPLATES.filter(tpl =>
    tpl.matchKeys.some(mk => keySet.has(mk.toLowerCase()))
  );
}

const ALL_TEMPLATES: FixTemplate[] = [
  // ── Speed Fix Template ──
  {
    matchKeys: ['slow_mobile', 'slow_lcp', 'high_lcp', 'poor_lcp'],
    label: 'Speed Improvement',
    description: 'Optimizing images, code, and server response dramatically reduces load time.',
    before: {
      title: 'Before',
      visual: <SpeedBarMockup speed={5.2} color="bg-status-critical" />,
      caption: '5.2 seconds — most visitors leave after 3s',
    },
    after: {
      title: 'After',
      visual: <SpeedBarMockup speed={1.8} color="bg-status-good" />,
      caption: '1.8 seconds — fast enough to keep visitors engaged',
    },
  },

  // ── Click-to-Call Template ──
  {
    matchKeys: ['no_click_to_call', 'missing_click_to_call', 'no_cta'],
    label: 'Click-to-Call Button',
    description: 'Adding a prominent tap-to-call button makes it effortless for customers to reach you.',
    before: {
      title: 'Before',
      visual: <PhoneNumberMockup hasButton={false} />,
      caption: 'Phone number as plain text — hard to tap on mobile',
    },
    after: {
      title: 'After',
      visual: <PhoneNumberMockup hasButton={true} />,
      caption: 'One-tap call button — instant connection',
    },
  },
];

// ─── Mockup Sub-components ──────────────────────────────────────────

function SpeedBarMockup({ speed, color }: { speed: number; color: string }) {
  const maxSpeed = 8;
  const pct = Math.min((speed / maxSpeed) * 100, 100);

  return (
    <div className="bg-bg-deep rounded-xl p-4">
      {/* Phone frame */}
      <div className="border border-bg-navy-border/50 rounded-2xl p-3 bg-bg-card/40 max-w-[180px] mx-auto">
        {/* Screen */}
        <div className="bg-bg-elevated rounded-lg p-3 space-y-3">
          {/* Loading bar */}
          <div className="h-2 rounded-full bg-bg-deep overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Speed label */}
          <p className="text-center text-lg font-bold font-[family-name:var(--font-display)]">
            <span className={color === 'bg-status-critical' ? 'text-status-critical' : 'text-status-good'}>
              {speed}s
            </span>
          </p>
          {/* Fake content lines */}
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-bg-navy-border/30 w-full" />
            <div className="h-2 rounded bg-bg-navy-border/30 w-3/4" />
            <div className="h-2 rounded bg-bg-navy-border/20 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneNumberMockup({ hasButton }: { hasButton: boolean }) {
  return (
    <div className="bg-bg-deep rounded-xl p-4">
      <div className="border border-bg-navy-border/50 rounded-2xl p-3 bg-bg-card/40 max-w-[180px] mx-auto">
        <div className="bg-bg-elevated rounded-lg p-3 space-y-3">
          {/* Header */}
          <div className="h-3 rounded bg-bg-navy-border/40 w-2/3" />

          {/* Phone number area */}
          {hasButton ? (
            <button className="w-full flex items-center justify-center gap-2 bg-brand-teal text-white rounded-lg py-2.5 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call Now
            </button>
          ) : (
            <p className="text-text-muted text-sm text-center py-2">
              +91 98765 43210
            </p>
          )}

          {/* Fake content */}
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-bg-navy-border/30 w-full" />
            <div className="h-2 rounded bg-bg-navy-border/20 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
