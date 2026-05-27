'use client';

import AuditForm from '@/components/AuditForm';
import { useRouter } from 'next/navigation';

export default function NewAuditPage() {
  const router = useRouter();

  const handleSuccess = (reportId: string) => {
    router.push(`/r/${reportId}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">New Audit</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Paste any business URL to generate a shareable website audit report. The audit checks mobile performance, desktop speed, and 6 custom checks.
        </p>
      </div>

      {/* Audit Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <AuditForm onSuccess={handleSuccess} />
      </div>

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 text-center">
          <span className="text-2xl mb-2 block">🔗</span>
          <p className="text-sm text-slate-400">Paste the full website URL including https://</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 text-center">
          <span className="text-2xl mb-2 block">⏱️</span>
          <p className="text-sm text-slate-400">Audit takes 10-20 seconds to complete</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 text-center">
          <span className="text-2xl mb-2 block">📱</span>
          <p className="text-sm text-slate-400">Both mobile and desktop scores are checked</p>
        </div>
      </div>
    </div>
  );
}
