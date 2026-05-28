'use client';

import { useState } from 'react';

interface IssueCardProps {
  icon: string;
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
  fixTime?: string;
  fixCost?: string;
  fixDifficulty?: 'easy' | 'medium' | 'hard';
  fixDescription?: string;
  defaultExpanded?: boolean;
}

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

const difficultyStyles = {
  easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Easy' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Medium' },
  hard: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Hard' },
} as const;

export default function IssueCard({
  icon,
  title,
  body,
  impact,
  fixTime,
  fixCost,
  fixDifficulty,
  fixDescription,
  defaultExpanded = false,
}: IssueCardProps) {
  const styles = impactStyles[impact];
  const hasFix = fixTime || fixCost || fixDifficulty || fixDescription;
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className={`
        group relative rounded-lg border-l-4 ${styles.border}
        bg-slate-800/50 backdrop-blur-sm
        p-4 sm:p-5
        transition-all duration-200
        hover:shadow-lg hover:shadow-violet-500/5
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

      {/* How to Fix section (Feature 4) */}
      {hasFix && (
        <div className="mt-3 ml-8">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {expanded ? 'Hide fix details' : 'How to fix'}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 animate-[fadeIn_0.2s_ease-out]">
              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {fixTime && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/60 text-xs text-slate-300">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fixTime}
                  </span>
                )}
                {fixCost && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/60 text-xs text-slate-300">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fixCost}
                  </span>
                )}
                {fixDifficulty && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${difficultyStyles[fixDifficulty].bg} text-xs ${difficultyStyles[fixDifficulty].text}`}>
                    {difficultyStyles[fixDifficulty].label}
                  </span>
                )}
              </div>
              {/* Fix description */}
              {fixDescription && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  💡 {fixDescription}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
