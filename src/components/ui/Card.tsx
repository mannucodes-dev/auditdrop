'use client';

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'highlighted';
  children: ReactNode;
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default:
    'bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] shadow-card',
  elevated:
    'bg-bg-tertiary border border-bg-border rounded-[var(--radius-lg)] shadow-elevated',
  highlighted:
    'bg-bg-secondary border border-brand-primary/30 rounded-[var(--radius-lg)] shadow-glow',
};

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'p-5',
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
