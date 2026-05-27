'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { auth } from '@/lib/firebase';

interface AuditFormProps {
  onSuccess: (reportId: string) => void;
}

const STATUS_MESSAGES = [
  'Analyzing mobile performance…',
  'Checking desktop speed…',
  'Running custom checks…',
  'Generating your report…',
] as const;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AuditForm({ onSuccess }: AuditFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  // Cycle loading messages every 3 seconds while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      const normalized = normalizeUrl(url);
      if (!isValidUrl(normalized)) {
        setError('Please enter a valid URL (e.g. https://example.com)');
        return;
      }

      setLoading(true);
      setStatusIdx(0);

      try {
        // Wait for Firebase auth to fully initialise before reading the user.
        // auth.currentUser can be null if the component mounts before the SDK
        // has rehydrated the session — onAuthStateChanged is the safe way to wait.
        const user = await new Promise<import('firebase/auth').User | null>(
          (resolve) => {
            const unsubscribe = auth.onAuthStateChanged((u) => {
              unsubscribe();
              resolve(u);
            });
          }
        );

        if (!user) {
          throw new Error('You must be signed in to run an audit.');
        }

        // Force-refresh=true ensures we never send an expired token
        const token = await user.getIdToken(true);

        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: normalized }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? `Audit failed with status ${res.status}`
          );
        }

        const { reportId } = (await res.json()) as { reportId: string };
        onSuccess(reportId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        );
      } finally {
        setLoading(false);
      }
    },
    [url, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* URL input row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter website URL…"
              disabled={loading}
              aria-label="Website URL"
              className={`
                w-full rounded-xl border bg-slate-900 px-5 py-4
                text-white placeholder:text-slate-500
                text-base font-medium
                outline-none transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  error
                    ? 'border-red-500/60 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                }
              `}
            />
            {/* Pulsing glow when loading */}
            {loading && (
              <div className="absolute inset-0 rounded-xl border-2 border-violet-500/40 animate-pulse pointer-events-none" />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={`
              relative overflow-hidden rounded-xl px-8 py-4
              font-semibold text-white text-base
              bg-linear-to-r from-violet-600 to-violet-500
              transition-all duration-200
              hover:from-violet-500 hover:to-violet-400
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
              disabled:opacity-50 disabled:cursor-not-allowed
              shrink-0 cursor-pointer
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
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
                Auditing…
              </span>
            ) : (
              'Run Audit'
            )}
          </button>
        </div>

        {/* Loading status messages */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <p
              className="text-sm text-violet-300 font-medium animate-pulse"
              aria-live="polite"
            >
              {STATUS_MESSAGES[statusIdx]}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <svg
              className="h-5 w-5 text-red-400 shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm font-medium shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
