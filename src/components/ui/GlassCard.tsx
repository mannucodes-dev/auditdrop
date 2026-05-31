'use client';

import { type ReactNode } from 'react';

// ─── Variant Styles ─────────────────────────────────────────────────

type GlassVariant = 'default' | 'elevated' | 'hero';

const VARIANT_STYLES: Record<GlassVariant, string> = {
  default: `
    bg-bg-card/60
    border border-bg-navy-border/30
    shadow-card
  `,
  elevated: `
    bg-bg-elevated/60
    border border-bg-navy-border/50
    shadow-elevated
  `,
  hero: `
    bg-bg-card/40
    border border-brand-teal/20
    shadow-teal-glow
  `,
};

// ─── GlassCard ──────────────────────────────────────────────────────

interface GlassCardProps {
  children: ReactNode;
  /** Visual depth variant */
  variant?: GlassVariant;
  /** Additional CSS classes */
  className?: string;
  /** Enable hover lift effect */
  hover?: boolean;
  /** HTML element to render as */
  as?: 'div' | 'section' | 'article';
}

/**
 * Refined glassmorphism card using brand v2 tokens.
 *
 * Uses `backdrop-filter: blur(16px)` with `@supports` fallback
 * (CSS classes from globals.css). Restrained, not over-blurred.
 */
export function GlassCard({
  children,
  variant = 'default',
  className = '',
  hover = false,
  as: Component = 'div',
}: GlassCardProps) {
  return (
    <Component
      className={`
        rounded-2xl
        backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]
        ${VARIANT_STYLES[variant]}
        transition-all duration-300
        ${hover ? 'hover:-translate-y-1 hover:border-brand-teal/40 hover:shadow-teal-glow' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
