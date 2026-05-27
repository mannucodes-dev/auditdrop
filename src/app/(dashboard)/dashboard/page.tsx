'use client';

import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import ReportCard from '@/components/ReportCard';
import Link from 'next/link';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const { user } = useAuth();
  const { reports, loading } = useReports(user?.uid || '');

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Reports</h1>
          {!loading && reports.length > 0 && (
            <p className="text-slate-400 mt-1">{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
          )}
        </div>
        <Link
          href="/dashboard/new"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Audit
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-5 bg-slate-800 rounded-lg w-3/4 mb-2" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
                <div className="h-8 w-16 bg-slate-800 rounded-full" />
              </div>
              <div className="flex gap-3 mb-4">
                <div className="h-3 bg-slate-800 rounded w-20" />
                <div className="h-3 bg-slate-800 rounded w-24" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-slate-800 rounded-lg flex-1" />
                <div className="h-9 bg-slate-800 rounded-lg w-16" />
                <div className="h-9 bg-slate-800 rounded-lg w-10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
              <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No reports yet</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Paste any business URL to generate a shareable website audit report. Use it in your cold outreach to convert prospects faster.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Your First Audit
          </Link>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
