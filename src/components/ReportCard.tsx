'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Report } from '@/hooks/useReports';
import { decodeHtmlEntities } from '@/lib/scraper';
import type { ProspectStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ReportCardProps {
  report: Report;
  onDelete: (reportId: string) => Promise<void>;
  onStatusChange: (reportId: string, status: ProspectStatus) => Promise<void>;
  onNotesChange: (reportId: string, notes: string) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Status → Badge mapping                                             */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<
  ProspectStatus,
  { variant: 'neutral' | 'brand' | 'warning' | 'good' | 'critical'; label: string }
> = {
  new: { variant: 'neutral', label: 'New' },
  contacted: { variant: 'brand', label: 'Contacted' },
  interested: { variant: 'warning', label: 'Interested' },
  won: { variant: 'good', label: 'Won' },
  lost: { variant: 'critical', label: 'Lost' },
};

const STATUS_OPTIONS: { value: ProspectStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const NOTES_MAX = 200;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number | null): string {
  if (score === null) return 'text-text-muted';
  if (score >= 90) return 'text-status-good';
  if (score >= 50) return 'text-status-warning';
  return 'text-status-critical';
}

function scoreLabel(score: number | null): string {
  return score !== null ? String(score) : 'N/A';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReportCard({
  report,
  onDelete,
  onStatusChange,
  onNotesChange,
}: ReportCardProps) {
  // Fix 1: Decode HTML entities in business name
  const decodedName = useMemo(() => decodeHtmlEntities(report.businessName), [report.businessName]);

  // Fix 2: Treat score 0 as null (PSI failure sentinel)
  const displayMobileScore = (report.mobileScore === null || report.mobileScore === 0) ? null : report.mobileScore;
  const displayDesktopScore = (report.desktopScore === null || report.desktopScore === 0) ? null : report.desktopScore;
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(report.prospectNotes ?? '');
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareRef = useRef<HTMLDivElement>(null);

  // Keep local notes in sync with prop changes (e.g. real-time updates)
  useEffect(() => {
    setNotes(report.prospectNotes ?? '');
  }, [report.prospectNotes]);

  // Close share dropdown on outside click
  useEffect(() => {
    if (!shareOpen) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpen]);

  /* -- handlers -- */

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onStatusChange(report.id, e.target.value as ProspectStatus);
    },
    [report.id, onStatusChange],
  );

  const handleNotesBlur = useCallback(() => {
    const trimmed = notes.trim();
    if (trimmed !== (report.prospectNotes ?? '')) {
      onNotesChange(report.id, trimmed);
    }
  }, [notes, report.id, report.prospectNotes, onNotesChange]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete report for "${decodedName}"? This cannot be undone.`)) {
      return;
    }
    await onDelete(report.id);
  }, [report.id, decodedName, onDelete]);

  const reportUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/r/${report.id}`
      : `/r/${report.id}`;

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [reportUrl]);

  const handleWhatsApp = useCallback(() => {
    const mobileLabel = displayMobileScore !== null ? `${displayMobileScore}/100` : 'N/A';
    const desktopLabel = displayDesktopScore !== null ? `${displayDesktopScore}/100` : 'N/A';
    const message = `Hey! I ran a quick website audit for ${decodedName}.\n\nMobile Score: ${mobileLabel}\nDesktop Score: ${desktopLabel}\n\nSee the full report: ${typeof window !== 'undefined' ? window.location.origin : ''}/r/${report.id}`;
    const encoded = encodeURIComponent(message);
    const phone = report.prospectPhone?.replace(/[^0-9]/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
    setShareOpen(false);
  }, [report, decodedName, displayMobileScore, displayDesktopScore]);

  /* -- derived -- */

  const badge = STATUS_BADGE[report.prospectStatus ?? 'new'];
  const viewHighlight =
    report.viewCount > 0 && (report.prospectStatus ?? 'new') === 'new';

  // Status-specific border accent
  const statusBorder = report.prospectStatus === 'won'
    ? 'border-l-4 border-l-status-good'
    : report.prospectStatus === 'contacted'
      ? 'border-l-4 border-l-brand-primary'
      : viewHighlight
        ? 'border-l-4 border-l-status-warning'
        : '';

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className={`glass-card rounded-xl p-5 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-0.5 ${statusBorder}`}>
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-text-primary font-semibold text-base truncate max-w-[200px]">
            {decodedName}
          </p>
          <p className="text-text-muted text-xs truncate max-w-[200px]">
            {report.businessUrl}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* ---- Scores row ---- */}
      <div className="flex items-center gap-4 mt-3">
        {/* Mobile score */}
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-bg-border text-sm font-semibold ${scoreColor(displayMobileScore)}`}
          >
            {scoreLabel(displayMobileScore)}
          </span>
          <span className="text-xs text-text-muted">Mobile</span>
        </div>

        {/* Desktop score */}
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full border border-bg-border text-sm font-semibold ${scoreColor(displayDesktopScore)}`}
          >
            {scoreLabel(displayDesktopScore)}
          </span>
          <span className="text-xs text-text-muted">Desktop</span>
        </div>

        {/* View count */}
        <div
          className={`flex items-center gap-1 ml-auto rounded-full px-2 py-0.5 ${
            viewHighlight
              ? 'bg-status-warning-bg text-status-warning text-xs'
              : 'text-text-muted text-xs'
          }`}
        >
          {/* Eye icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path
              fillRule="evenodd"
              d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{report.viewCount}</span>
        </div>
      </div>

      {/* ---- Status dropdown ---- */}
      <div className="mt-3">
        <select
          value={report.prospectStatus ?? 'new'}
          onChange={handleStatusChange}
          className="bg-bg-tertiary border border-bg-border rounded-[var(--radius-md)] text-text-secondary text-xs px-2 py-1 outline-none focus:border-brand-primary transition-colors"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Notes section ---- */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setNotesOpen((p) => !p)}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-3.5 h-3.5 transition-transform ${notesOpen ? 'rotate-90' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
              clipRule="evenodd"
            />
          </svg>
          Notes
        </button>

        {notesOpen && (
          <div className="mt-2">
            <textarea
              value={notes}
              onChange={(e) => {
                if (e.target.value.length <= NOTES_MAX) {
                  setNotes(e.target.value);
                }
              }}
              onBlur={handleNotesBlur}
              rows={3}
              placeholder="Add prospect notes…"
              className="bg-bg-tertiary border border-bg-border rounded-[var(--radius-md)] text-text-primary text-sm p-3 w-full resize-none outline-none focus:border-brand-primary transition-colors"
            />
            <p className="text-xs text-text-muted text-right mt-1">
              {notes.length}/{NOTES_MAX}
            </p>
          </div>
        )}
      </div>

      {/* ---- Action buttons ---- */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-bg-border">
        {/* View */}
        <a
          href={`/r/${report.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-primary/10 text-brand-secondary hover:bg-brand-primary/20 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-colors"
        >
          View
        </a>

        {/* Share dropdown */}
        <div ref={shareRef} className="relative">
          <button
            type="button"
            onClick={() => setShareOpen((p) => !p)}
            className="bg-brand-primary/10 text-brand-secondary hover:bg-brand-primary/20 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Share
          </button>

          {shareOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 min-w-[160px] bg-bg-secondary border border-bg-border rounded-[var(--radius-md)] shadow-lg py-1">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                📱 WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                {copied ? '✅ Copied!' : '🔗 Copy link'}
              </button>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          className="ml-auto text-status-critical/50 hover:text-status-critical text-xs transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
