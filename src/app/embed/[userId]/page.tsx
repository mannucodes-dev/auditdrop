'use client';

import { useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EmbedAuditPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/audit/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, userId: params.userId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? `Request failed (${res.status})`,
        );
      }

      const data = (await res.json()) as { reportId: string };
      router.push(`/r/${data.reportId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-bg-secondary border border-bg-border rounded-[var(--radius-xl)] p-6 sm:p-8">
        {/* Logo */}
        <p className="text-text-muted text-xs font-medium tracking-wide uppercase mb-6">
          AuditDrop
        </p>

        {/* Heading */}
        <h1 className="text-text-primary text-xl font-bold">
          Get a Free Website Audit
        </h1>
        <p className="text-text-secondary text-sm mt-1 mb-6">
          Paste your website URL to see your performance score
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] border border-bg-border bg-bg-primary
                       px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted
                       outline-none focus:ring-2 focus:ring-brand-primary/40 transition-shadow
                       disabled:opacity-60"
          />

          {error && (
            <p className="text-status-critical text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-md)]
                       bg-brand-primary text-white font-semibold text-sm px-4 py-2.5
                       hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-text-muted text-xs text-center mt-8">
          Powered by AuditDrop
        </p>
      </div>
    </div>
  );
}
