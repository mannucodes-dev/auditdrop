'use client';

import { useEffect, useRef } from 'react';

interface ScoreDialProps {
  score: number | null;
  label: string;
  size?: number;
}

/**
 * Animated circular score dial.
 *
 * Displays a 0–100 score with color-coded ring.
 * Shows "N/A" with gray styling when score is null (failed audit).
 */
export default function ScoreDial({ score, label, size = 100 }: ScoreDialProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke offset for the score
  const percentage = score !== null ? Math.min(Math.max(score, 0), 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on score
  const getColor = (): string => {
    if (score === null) return 'var(--color-text-muted)';
    if (score >= 90) return 'var(--color-status-excellent)';
    if (score >= 75) return 'var(--color-status-good)';
    if (score >= 50) return 'var(--color-status-warning)';
    return 'var(--color-status-critical)';
  };

  const getTextColorClass = (): string => {
    if (score === null) return 'text-text-muted';
    if (score >= 90) return 'text-status-excellent';
    if (score >= 75) return 'text-status-good';
    if (score >= 50) return 'text-status-warning';
    return 'text-status-critical';
  };

  useEffect(() => {
    if (circleRef.current && score !== null) {
      // Start from full offset (empty) and animate to target
      circleRef.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1.2s ease-out';
          circleRef.current.style.strokeDashoffset = String(offset);
        }
      });
    }
  }, [score, offset, circumference]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-bg-border)"
            strokeWidth="6"
          />
          {/* Score arc */}
          {score !== null && (
            <circle
              ref={circleRef}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
            />
          )}
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getTextColorClass()}`}>
            {score !== null ? score : 'N/A'}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
