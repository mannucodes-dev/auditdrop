/**
 * AuditDrop Design Tokens — Single Source of Truth
 *
 * Every component in the app uses ONLY these values.
 * The Tailwind v4 @theme block in globals.css mirrors these tokens
 * as CSS custom properties so utility classes map 1:1.
 *
 * To add a new token:
 *   1. Add it here.
 *   2. Add the matching CSS custom property in globals.css @theme.
 *   3. Use the Tailwind utility class (e.g., `bg-brand-primary`).
 */

export const tokens = {
  colors: {
    bg: {
      primary: '#0A0A0F',       // near-black background
      secondary: '#111118',     // card background
      tertiary: '#1A1A24',      // elevated card
      border: '#2A2A3A',        // borders
      borderHover: '#3A3A4F',   // hover borders
    },
    brand: {
      primary: '#7C3AED',       // violet — primary CTA
      primaryHover: '#6D28D9',
      secondary: '#A855F7',     // lighter violet
      glow: 'rgba(124, 58, 237, 0.15)',
    },
    status: {
      critical: '#EF4444',      // score 0-49
      criticalBg: 'rgba(239, 68, 68, 0.1)',
      warning: '#F59E0B',       // score 50-74
      warningBg: 'rgba(245, 158, 11, 0.1)',
      good: '#10B981',          // score 75-89
      goodBg: 'rgba(16, 185, 129, 0.1)',
      excellent: '#06B6D4',     // score 90-100
      excellentBg: 'rgba(6, 182, 212, 0.1)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      muted: '#475569',
    },
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
    elevated: '0 4px 24px rgba(0,0,0,0.5)',
    glow: '0 0 20px rgba(124, 58, 237, 0.3)',
  },
} as const;

/** Helper to get status color for a 0-100 score */
export function getStatusColorKey(score: number | null): 'critical' | 'warning' | 'good' | 'excellent' {
  if (score === null || score === undefined) return 'critical';
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}
