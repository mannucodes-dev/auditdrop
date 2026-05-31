'use client';

import type { Report } from '@/lib/types';

// ─── ProposalCTA ────────────────────────────────────────────────────

interface ProposalCTAProps {
  report: Report;
  /** Owner profile from Firestore users collection */
  ownerProfile: {
    displayName: string;
    ctaUrl?: string;
    ctaLabel?: string;
    whatsappNumber?: string;
    useWhatsApp?: boolean;
  } | null;
  /** Total estimated monthly loss from money translations */
  estimatedMonthlyLoss?: string;
  /** Top issues summary (plain text, max 3) */
  topIssues?: string[];
}

/**
 * Enhanced CTA section with pre-filled WhatsApp message builder.
 * Falls back to original simple CTA when no WhatsApp number is set.
 */
export function ProposalCTA({
  report,
  ownerProfile,
  estimatedMonthlyLoss,
  topIssues = [],
}: ProposalCTAProps) {
  if (!ownerProfile) return null;

  const hasWhatsApp = ownerProfile.useWhatsApp !== false && ownerProfile.whatsappNumber;
  const freelancerName = ownerProfile.displayName || 'Your Web Expert';
  const ctaLabel = ownerProfile.ctaLabel || 'Book a Free Call';
  const ctaUrl = ownerProfile.ctaUrl || '';

  // Build the pre-filled WhatsApp message
  const whatsappMessage = buildWhatsAppMessage({
    businessName: report.businessName || 'your website',
    issueCount: (report.issues?.length ?? 0),
    monthlyLoss: estimatedMonthlyLoss || '',
    topIssues,
    freelancerName,
  });

  const whatsappLink = hasWhatsApp
    ? `https://wa.me/${cleanPhoneNumber(ownerProfile.whatsappNumber!)}?text=${encodeURIComponent(whatsappMessage)}`
    : '';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
    } catch {
      // Fallback: select a textarea (for older browsers)
    }
  };

  return (
    <section className="mt-10 mb-6">
      <div className="rounded-2xl border border-brand-teal/20 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-teal-subtle px-6 py-4 border-b border-brand-teal/20">
          <h3 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-display)]">
            Ready to fix these issues?
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {freelancerName} can help improve your website performance
            {estimatedMonthlyLoss ? ` and recover ~₹${estimatedMonthlyLoss}/month` : ''}.
          </p>
        </div>

        {/* CTA body */}
        <div className="bg-bg-card/60 px-6 py-6">
          {/* WhatsApp message preview */}
          {hasWhatsApp && (
            <div className="mb-6">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                Pre-filled message preview
              </p>
              <div className="bg-bg-deep rounded-xl p-4 text-sm text-text-secondary whitespace-pre-line border border-bg-navy-border/30">
                {whatsappMessage}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary: WhatsApp or CTA link */}
            {hasWhatsApp ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-whatsapp-green hover:bg-whatsapp-dark transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            ) : ctaUrl ? (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-brand-teal hover:bg-brand-teal-hover transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-brand-teal/20"
              >
                {ctaLabel}
              </a>
            ) : null}

            {/* Secondary: Copy message */}
            {hasWhatsApp && (
              <button
                onClick={handleCopyMessage}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-text-secondary bg-bg-elevated hover:bg-bg-card border border-bg-navy-border/40 hover:border-brand-teal/30 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy Message
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

function buildWhatsAppMessage({
  businessName,
  issueCount,
  monthlyLoss,
  topIssues,
  freelancerName,
}: {
  businessName: string;
  issueCount: number;
  monthlyLoss: string;
  topIssues: string[];
  freelancerName: string;
}): string {
  const lines: string[] = [];

  lines.push(`Hi! I reviewed ${businessName}'s website and found ${issueCount} issue${issueCount !== 1 ? 's' : ''}.`);

  if (monthlyLoss) {
    lines.push(`These are costing you approximately ₹${monthlyLoss} every month.`);
  }

  if (topIssues.length > 0) {
    lines.push('');
    lines.push('Top issues:');
    topIssues.slice(0, 3).forEach((issue, i) => {
      lines.push(`${i + 1}. ${issue}`);
    });
  }

  lines.push('');
  lines.push(`I can fix these — want me to send a quote?`);
  lines.push('');
  lines.push(`— ${freelancerName}`);

  return lines.join('\n');
}
