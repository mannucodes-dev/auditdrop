'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-bg-tertiary animate-skeleton rounded-[var(--radius-md)] ${className}`}
    />
  );
}

interface SkeletonLineProps {
  width?: string;
  className?: string;
}

export function SkeletonLine({
  width = 'w-full',
  className = '',
}: SkeletonLineProps) {
  return (
    <div
      className={`bg-bg-tertiary animate-skeleton rounded-[var(--radius-md)] h-4 ${width} ${className}`}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-5 h-48 ${className}`}
    >
      <div className="space-y-3">
        <SkeletonLine width="w-2/3" />
        <SkeletonLine width="w-full" />
        <SkeletonLine width="w-full" />
        <SkeletonLine width="w-1/2" />
      </div>
    </div>
  );
}
