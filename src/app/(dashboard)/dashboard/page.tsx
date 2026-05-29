'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import ReportCard from '@/components/ReportCard';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProspectStatus } from '@/lib/types';

const STATUS_TABS: { label: string; value: ProspectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Interested', value: 'interested' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { reports, loading, updateProspectStatus, updateProspectNotes } = useReports(user?.uid || '');
  const [activeFilter, setActiveFilter] = useState<ProspectStatus | 'all'>('all');

  // Compute stats
  const stats = useMemo(() => {
    const total = reports.length;
    const viewed = reports.filter((r) => r.viewCount > 0).length;
    const interested = reports.filter((r) => r.prospectStatus === 'interested').length;
    const won = reports.filter((r) => r.prospectStatus === 'won').length;
    return { total, viewed, interested, won };
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') return reports;
    return reports.filter((r) => r.prospectStatus === activeFilter);
  }, [reports, activeFilter]);

  const handleDelete = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Your Reports</h1>
          {!loading && reports.length > 0 && (
            <p className="text-text-secondary mt-1">{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
          )}
        </div>
        <Link
          href="/dashboard/new"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover rounded-[var(--radius-lg)] text-white font-medium transition-all duration-200 shadow-glow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Audit
        </Link>
      </div>

      {/* Stats Bar */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4 text-center">
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Total Audits</div>
          </div>
          <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4 text-center">
            <div className="text-2xl font-bold text-brand-secondary">{stats.viewed}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Viewed</div>
          </div>
          <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4 text-center">
            <div className="text-2xl font-bold text-status-warning">{stats.interested}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Interested</div>
          </div>
          <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-lg)] p-4 text-center">
            <div className="text-2xl font-bold text-status-good">{stats.won}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Won</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && reports.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-1 px-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`shrink-0 px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeFilter === tab.value
                  ? 'bg-brand-primary text-white shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {reports.filter((r) =>
                    tab.value === 'all' ? true : r.prospectStatus === tab.value
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-brand-glow rounded-full flex items-center justify-center border border-brand-primary/20">
              <svg className="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">No reports yet</h2>
          <p className="text-text-secondary max-w-md mb-8">
            Paste any business URL to generate a shareable website audit report. Use it in your cold outreach to convert prospects faster.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover rounded-[var(--radius-lg)] text-white font-semibold text-lg transition-all duration-300 shadow-glow hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Your First Audit
          </Link>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDelete}
              onStatusChange={updateProspectStatus}
              onNotesChange={updateProspectNotes}
            />
          ))}
        </div>
      )}

      {/* No results for filter */}
      {!loading && reports.length > 0 && filteredReports.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No reports with status &ldquo;{activeFilter}&rdquo;</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-4 text-brand-secondary hover:text-brand-primary text-sm font-medium cursor-pointer"
          >
            Show all reports
          </button>
        </div>
      )}
    </div>
  );
}
