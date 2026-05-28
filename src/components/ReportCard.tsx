'use client';

import { useState } from 'react';
import { Report } from '@/hooks/useReports';
import { getScoreColor, generateIssues } from '@/lib/reportUtils';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface ReportCardProps {
  report: Report;
  onDelete: (reportId: string) => void;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getScoreColorClasses(score: number) {
  const color = getScoreColor(score);
  switch (color) {
    case 'red': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' };
    case 'amber': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' };
    case 'green': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
  }
}

function generateWhatsAppMessage(
  report: Report,
  shareUrl: string,
  displayName: string
): string {
  const issues = generateIssues(report.checks, report.metrics, report.mobileScore, report.seoChecks);
  const topIssues = issues.slice(0, 3);

  let msg = `Hi ${report.businessName || 'there'},\n\n`;
  msg += `I ran a quick website audit on ${report.businessUrl} and found some issues that may be costing you customers:\n\n`;
  msg += `📊 Mobile Score: ${report.mobileScore}/100\n`;
  topIssues.forEach((issue) => {
    msg += `⚠️ ${issue.title}\n`;
  });
  msg += `\nI've put together a full report showing exactly what's wrong and how to fix it:\n`;
  msg += `👉 ${shareUrl}\n\n`;
  msg += `Happy to fix these for you. Let me know if you'd like a quick call.\n\n`;
  msg += `— ${displayName || 'Your Web Developer'}`;

  return msg;
}

export default function ReportCard({ report, onDelete }: ReportCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const scoreColors = getScoreColorClasses(report.mobileScore);
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${report.id}`
    : `/r/${report.id}`;

  const lastViewed = report.lastViewedAt
    ? formatRelativeTime(
        report.lastViewedAt instanceof Timestamp
          ? report.lastViewedAt.toDate()
          : new Date(report.lastViewedAt)
      )
    : 'Never';

  const createdDate = report.createdAt
    ? (report.createdAt instanceof Timestamp
        ? report.createdAt.toDate()
        : new Date(report.createdAt)
      ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const whatsAppMessage = generateWhatsAppMessage(
    report,
    shareUrl,
    user?.displayName || ''
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = whatsAppMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { generatePDF } = await import('@/components/PDFReport');
      await generatePDF(report, null);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(report.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const truncatedUrl = report.businessUrl.length > 40
    ? report.businessUrl.substring(0, 40) + '...'
    : report.businessUrl;

  return (
    <div className="group relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">
            {report.businessName || 'Untitled Report'}
          </h3>
          <p className="text-slate-500 text-sm truncate mt-0.5" title={report.businessUrl}>
            {truncatedUrl}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${scoreColors.bg} ${scoreColors.border} border`}>
          <span className={`w-2 h-2 rounded-full ${scoreColors.dot}`} />
          <span className={`text-sm font-bold ${scoreColors.text}`}>{report.mobileScore}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{report.viewCount || 0} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Viewed {lastViewed}</span>
        </div>
      </div>

      {/* Score Details */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <span className="text-slate-500">Mobile: <span className={scoreColors.text}>{report.mobileScore}</span></span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-500">Desktop: <span className="text-slate-300">{report.desktopScore !== null && report.desktopScore !== undefined ? report.desktopScore : 'N/A'}</span></span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-500">{createdDate}</span>
      </div>

      {/* Action Buttons — Row 1: Share */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/20 hover:border-emerald-500/40 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
        <button
          onClick={handleCopyMessage}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-all duration-200 hover:bg-slate-700 hover:border-slate-600 cursor-pointer"
        >
          {msgCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Msg
            </>
          )}
        </button>
      </div>

      {/* Action Buttons — Row 2: Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 text-sm font-medium transition-all duration-200 hover:bg-violet-500/20 hover:border-violet-500/40 cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-all duration-200 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-50 cursor-pointer"
        >
          {isGeneratingPDF ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          PDF
        </button>

        <button
          onClick={handleDelete}
          className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
            showConfirm
              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {showConfirm ? 'Confirm?' : ''}
        </button>
      </div>
    </div>
  );
}
