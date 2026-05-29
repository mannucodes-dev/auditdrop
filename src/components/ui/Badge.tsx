'use client';

import type { ReactNode } from 'react';

interface BadgeProps {
  variant: 'critical' | 'warning' | 'good' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  critical:
    'bg-status-critical-bg text-status-critical border-status-critical/20',
  warning:
    'bg-status-warning-bg text-status-warning border-status-warning/20',
  good:
    'bg-status-good-bg text-status-good border-status-good/20',
  neutral:
    'bg-bg-tertiary text-text-secondary border-bg-border',
  brand:
    'bg-brand-glow text-brand-secondary border-brand-primary/20',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ variant, size = 'sm', children }: BadgeProps) {
  const classes = [
    'inline-flex items-center border rounded-full font-medium',
    variantStyles[variant],
    sizeStyles[size],
  ].join(' ');

  return <span className={classes}>{children}</span>;
}
