'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

interface IssueCardProps {
  icon: string;
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
  fixTime?: string;
  fixCost?: string;
  fixDifficulty?: string;
  fixDescription?: string;
}

export default function IssueCard({
  icon,
  title,
  body,
  impact,
  fixTime,
  fixCost,
  fixDifficulty,
  fixDescription,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasFixInfo = fixDescription || fixTime || fixCost || fixDifficulty;

  const impactVariant: 'critical' | 'warning' | 'good' =
    impact === 'High' ? 'critical' : impact === 'Medium' ? 'warning' : 'good';

  return (
    <div className="glass-card rounded-xl overflow-hidden hover:border-brand-primary/20 transition-all duration-300 group">
      {/* Header */}
      <button
        type="button"
        onClick={() => hasFixInfo && setExpanded(!expanded)}
        className={`w-full text-left p-4 sm:p-5 flex items-start gap-3 ${hasFixInfo ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <Badge variant={impactVariant}>{impact}</Badge>
          </div>
          <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{body}</p>
        </div>

        {hasFixInfo && (
          <svg
            className={`w-5 h-5 shrink-0 text-text-muted transition-transform duration-300 mt-0.5 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Expandable fix details */}
      <AnimatePresence>
        {expanded && hasFixInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-bg-border/50 pt-4">
              {fixDescription && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-brand-secondary uppercase tracking-wider mb-1.5">
                    How to Fix
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{fixDescription}</p>
                </div>
              )}

              {(fixTime || fixCost || fixDifficulty) && (
                <div className="flex gap-4 flex-wrap">
                  {fixTime && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fixTime}
                    </div>
                  )}
                  {fixCost && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span>₹</span>
                      {fixCost}
                    </div>
                  )}
                  {fixDifficulty && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {fixDifficulty}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
