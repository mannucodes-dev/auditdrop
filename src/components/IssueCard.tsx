import type { AuditIssue } from '@/lib/types';

const impactStyles = {
  High: {
    border: 'border-l-red-500',
    badge: 'bg-red-500/15 text-red-400 ring-red-500/30',
  },
  Medium: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  },
  Low: {
    border: 'border-l-blue-500',
    badge: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
  },
} as const;

export default function IssueCard({ icon, title, body, impact }: AuditIssue) {
  const styles = impactStyles[impact];

  return (
    <article
      className={`
        group relative rounded-lg border-l-4 ${styles.border}
        bg-slate-800/50 backdrop-blur-sm
        p-4 sm:p-5
        transition-all duration-200
        hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/5
        hover:bg-slate-800/70
      `}
    >
      {/* Impact badge — top right */}
      <span
        className={`
          absolute top-3 right-3
          inline-flex items-center rounded-full px-2.5 py-0.5
          text-xs font-semibold ring-1 ring-inset
          ${styles.badge}
        `}
      >
        {impact}
      </span>

      {/* Icon + content */}
      <div className="flex gap-3 pr-16">
        <span className="mt-0.5 text-xl shrink-0" role="img" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white leading-snug">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </article>
  );
}
