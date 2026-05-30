'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScoreDialProps {
  score: number | null;
  label: string;
  size?: number;
}

export default function ScoreDial({ score, label, size = 120 }: ScoreDialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = score !== null
    ? circumference - (score / 100) * circumference
    : circumference;

  // Color based on score
  const getColor = (s: number | null) => {
    if (s === null) return { stroke: '#475569', text: 'text-text-muted', glow: '' };
    if (s >= 90) return { stroke: '#10B981', text: 'text-status-good', glow: 'score-glow-green' };
    if (s >= 50) return { stroke: '#F59E0B', text: 'text-status-warning', glow: 'score-glow-amber' };
    return { stroke: '#EF4444', text: 'text-status-critical', glow: 'score-glow-red' };
  };

  const color = getColor(score);

  // Count-up animation
  useEffect(() => {
    if (!inView || score === null) return;
    const duration = 1200;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, score]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 ${color.glow}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(42, 42, 58, 0.5)"
            strokeWidth="8"
          />
          {/* Score arc */}
          {score !== null && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={inView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          )}
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>
            {score === null ? 'N/A' : inView ? displayScore : 0}
          </span>
        </div>
      </div>

      <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}
