/**
 * AuditDrop Brand v2 Tokens — EXTENDS existing tokens.ts
 *
 * This file adds the new brand identity (teal/amber growth-tool palette)
 * without removing or modifying any existing tokens. Components can
 * progressively adopt brandV2 tokens while old references keep working.
 *
 * Usage:
 *   import { brandV2, typeScale } from '@/styles/brand-tokens';
 *   import { tokens } from '@/styles/tokens'; // still works
 */

// Re-export original tokens for convenience
export { tokens, getStatusColorKey } from './tokens';

// ─── Brand v2 Color Palette ─────────────────────────────────────────

export const brandV2 = {
  colors: {
    brand: {
      teal: '#0F766E',
      tealHover: '#0D9488',
      tealLight: '#14B8A6',
      tealGlow: 'rgba(15, 118, 110, 0.15)',
      tealSubtle: 'rgba(15, 118, 110, 0.08)',
      amber: '#F59E0B',
      amberHover: '#D97706',
      amberLight: '#FCD34D',
      amberGlow: 'rgba(245, 158, 11, 0.15)',
      amberSubtle: 'rgba(245, 158, 11, 0.08)',
    },
    bg: {
      deep: '#0C1222',
      card: '#111827',
      elevated: '#1E293B',
      border: '#1E3A5F',
      borderHover: 'rgba(37, 99, 235, 0.2)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      muted: '#475569',
    },
    whatsapp: {
      green: '#25D366',
      dark: '#075E54',
      chat: '#0B141A',
      sent: '#005C4B',
      received: '#1F2C33',
    },
  },

  gradients: {
    /** Hero background gradient — teal radial glow */
    hero: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(15, 118, 110, 0.15), transparent 70%),
           radial-gradient(ellipse 60% 40% at 80% 50%, rgba(20, 184, 166, 0.08), transparent 60%)`,
    /** CTA button gradient */
    cta: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
    /** Revenue impact gradient (green → amber → red) */
    revenue: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)',
    /** Glass border gradient */
    glassBorder: 'linear-gradient(135deg, rgba(15, 118, 110, 0.3), rgba(245, 158, 11, 0.1))',
    /** Text highlight gradient */
    textHighlight: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },

  shadow: {
    card: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    elevated: '0 4px 24px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(15, 118, 110, 0.3)',
    glowStrong: '0 0 30px rgba(15, 118, 110, 0.4), 0 0 60px rgba(15, 118, 110, 0.1)',
    amberGlow: '0 0 20px rgba(245, 158, 11, 0.3)',
  },
} as const;

// ─── Type Scale ──────────────────────────────────────────────────────

export const typeScale = {
  'display-xl': { size: '3.75rem', lineHeight: '1.1', weight: '700', tracking: '-0.02em' },
  'display-lg': { size: '3rem', lineHeight: '1.15', weight: '700', tracking: '-0.02em' },
  'display-md': { size: '2.25rem', lineHeight: '1.2', weight: '700', tracking: '-0.015em' },
  'display-sm': { size: '1.875rem', lineHeight: '1.25', weight: '600', tracking: '-0.01em' },
  'heading-lg': { size: '1.5rem', lineHeight: '1.3', weight: '600', tracking: '-0.01em' },
  'heading-md': { size: '1.25rem', lineHeight: '1.4', weight: '600', tracking: '0' },
  'heading-sm': { size: '1.125rem', lineHeight: '1.4', weight: '600', tracking: '0' },
  'body-lg': { size: '1.125rem', lineHeight: '1.6', weight: '400', tracking: '0' },
  'body': { size: '1rem', lineHeight: '1.6', weight: '400', tracking: '0' },
  'body-sm': { size: '0.875rem', lineHeight: '1.5', weight: '400', tracking: '0' },
  'caption': { size: '0.75rem', lineHeight: '1.5', weight: '500', tracking: '0.02em' },
} as const;

// ─── Revenue Counter Colors ──────────────────────────────────────────

/**
 * Returns the interpolated color for the revenue counter animation.
 * Maps a 0-1 progress value to green → amber → red.
 *
 * @param progress 0 = start (green), 1 = end (red)
 */
export function getRevenueCounterColor(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));

  if (clamped < 0.5) {
    // Green (#10B981) → Amber (#F59E0B)
    const t = clamped * 2;
    const r = Math.round(16 + (245 - 16) * t);
    const g = Math.round(185 + (158 - 185) * t);
    const b = Math.round(129 + (11 - 129) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Amber (#F59E0B) → Red (#EF4444)
    const t = (clamped - 0.5) * 2;
    const r = Math.round(245 + (239 - 245) * t);
    const g = Math.round(158 + (68 - 158) * t);
    const b = Math.round(11 + (68 - 11) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Returns brand teal status color for a 0-100 score.
 * Uses brand v2 colors instead of the original violet-based palette.
 */
export function getBrandAccent(variant: 'primary' | 'hover' | 'light' | 'glow' = 'primary'): string {
  return brandV2.colors.brand[
    variant === 'primary' ? 'teal' :
    variant === 'hover' ? 'tealHover' :
    variant === 'light' ? 'tealLight' :
    'tealGlow'
  ];
}
