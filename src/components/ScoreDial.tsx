'use client';

import { useEffect, useState } from 'react';

interface ScoreDialProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: { width: 100, stroke: 6, fontSize: 24, labelSize: 11 },
  md: { width: 160, stroke: 8, fontSize: 40, labelSize: 14 },
  lg: { width: 220, stroke: 10, fontSize: 56, labelSize: 16 },
} as const;

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  glow: string;
} {
  if (score >= 90) {
    return {
      stroke: '#10B981', // emerald-500
      text: 'text-emerald-500',
      glow: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))',
    };
  }
  if (score >= 50) {
    return {
      stroke: '#F59E0B', // amber-500
      text: 'text-amber-500',
      glow: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))',
    };
  }
  return {
    stroke: '#EF4444', // red-500
    text: 'text-red-500',
    glow: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))',
  };
}

export default function ScoreDial({
  score,
  size = 'md',
  label,
}: ScoreDialProps) {
  const [mounted, setMounted] = useState(false);
  const dims = sizeMap[size];
  const radius = (dims.width - dims.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isNull = score === null || score === undefined;
  const clampedScore = isNull ? 0 : Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = isNull
    ? { stroke: '#475569', text: 'text-slate-500', glow: 'none' }
    : getScoreColor(clampedScore);
  const center = dims.width / 2;

  useEffect(() => {
    // Small delay so the CSS transition animates from 0
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5" role="figure" aria-label={`${label ? label + ' ' : ''}score: ${isNull ? 'N/A' : clampedScore + ' out of 100'}`}>
      <svg
        width={dims.width}
        height={dims.width}
        viewBox={`0 0 ${dims.width} ${dims.width}`}
        className="transform -rotate-90"
        style={{ filter: mounted && !isNull ? color.glow : 'none' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e293b" // slate-800
          strokeWidth={dims.stroke}
        />
        {/* Score arc */}
        {!isNull && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
      </svg>

      {/* Score number overlaid in the center */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: dims.width,
          height: dims.width,
          marginTop: 0,
        }}
      >
        <span
          className={`font-bold tabular-nums ${color.text}`}
          style={{ fontSize: isNull ? dims.fontSize * 0.5 : dims.fontSize }}
        >
          {isNull ? 'N/A' : clampedScore}
        </span>
      </div>

      {label && (
        <span
          className="text-slate-400 font-medium tracking-wide uppercase"
          style={{ fontSize: dims.labelSize }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
