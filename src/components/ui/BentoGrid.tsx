'use client';

import { type ReactNode } from 'react';

// ─── BentoGrid ──────────────────────────────────────────────────────

interface BentoGridProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Number of columns on desktop (default: 4) */
  columns?: 2 | 3 | 4 | 6;
}

const GRID_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
};

/**
 * Responsive bento grid layout.
 * 1-col mobile → 2-col tablet → N-col desktop.
 */
export function BentoGrid({ children, className = '', columns = 4 }: BentoGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${GRID_COLS[columns]} gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── BentoCard ──────────────────────────────────────────────────────

interface BentoCardProps {
  children: ReactNode;
  /** Column span on desktop */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span on desktop */
  rowSpan?: 1 | 2;
  /** Additional CSS classes */
  className?: string;
  /** Enable hover lift effect */
  hover?: boolean;
}

const COL_SPANS: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
};

const ROW_SPANS: Record<number, string> = {
  1: '',
  2: 'md:row-span-2',
};

/**
 * A cell within a BentoGrid with configurable span.
 * Uses brand v2 glass styling with subtle border.
 */
export function BentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
  hover = true,
}: BentoCardProps) {
  return (
    <div
      className={`
        ${COL_SPANS[colSpan]} ${ROW_SPANS[rowSpan]}
        rounded-2xl p-6
        bg-bg-card/80 border border-bg-navy-border/40
        transition-all duration-300
        ${hover ? 'hover:border-brand-teal/30 hover:-translate-y-1 hover:shadow-teal-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
