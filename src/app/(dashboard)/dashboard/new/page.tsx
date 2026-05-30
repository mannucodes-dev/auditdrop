'use client';

import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-glow border border-brand-primary/20 mb-5">
          <svg className="w-8 h-8 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">New Audit</h1>
        <p className="text-text-secondary max-w-md mx-auto">
          Paste any business URL to generate a shareable website audit report. The audit checks mobile performance, desktop speed, and 6 custom checks.
        </p>
      </motion.div>

      {/* Audit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-2xl p-6 sm:p-8"
      >
        <AuditForm onSuccess={handleSuccess} />
      </motion.div>

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '🔗', text: 'Paste the full website URL including https://' },
          { icon: '⏱️', text: 'Audit takes 10-20 seconds to complete' },
          { icon: '📱', text: 'Both mobile and desktop scores are checked' },
        ].map((tip, i) => (
          <motion.div
            key={tip.icon}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            className="glass-card rounded-xl p-4 text-center hover:border-brand-primary/20 transition-all duration-300"
          >
            <span className="text-2xl mb-2 block">{tip.icon}</span>
            <p className="text-sm text-text-secondary">{tip.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
