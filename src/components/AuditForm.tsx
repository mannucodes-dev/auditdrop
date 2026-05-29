'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { auth } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';

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
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [competitor1, setCompetitor1] = useState('');
  const [competitor2, setCompetitor2] = useState('');
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
        // Wait for Firebase auth to fully initialise
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

        // Use authFetch for automatic token refresh
        const res = await authFetch(
          '/api/audit',
          {
            method: 'POST',
            body: JSON.stringify({
              url: normalized,
              businessName: businessName.trim() || undefined,
              city: city.trim() || undefined,
              competitors: [competitor1, competitor2]
                .map((c) => c.trim())
                .filter(Boolean)
                .map((c) => normalizeUrl(c)),
            }),
          },
          user
        );

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
    [url, businessName, city, competitor1, competitor2, onSuccess]
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
                w-full rounded-[var(--radius-lg)] border bg-bg-tertiary px-5 py-4
                text-text-primary placeholder:text-text-muted
                text-base font-medium
                outline-none transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  error
                    ? 'border-status-critical/60 focus:ring-status-critical/30'
                    : 'border-bg-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                }
              `}
            />
            {loading && (
              <div className="absolute inset-0 rounded-[var(--radius-lg)] border-2 border-brand-primary/40 animate-pulse pointer-events-none" />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={`
              relative overflow-hidden rounded-[var(--radius-lg)] px-8 py-4
              font-semibold text-white text-base
              bg-brand-primary hover:bg-brand-primary-hover
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              shrink-0 cursor-pointer
              shadow-glow
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

        {/* Advanced Options (Business Name + City for GBP) */}
        <div className="border border-bg-border rounded-[var(--radius-lg)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Google Business Profile lookup (optional)
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAdvanced && (
            <div className="px-4 pb-4 space-y-3 border-t border-bg-border">
              <p className="text-xs text-text-muted mt-3">Enter business name and city to check their Google Business Profile.</p>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name (auto-detected if empty)"
                disabled={loading}
                aria-label="Business name"
                className="w-full rounded-[var(--radius-md)] border border-bg-border bg-bg-tertiary px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (default: Bangalore)"
                disabled={loading}
                aria-label="City"
                className="w-full rounded-[var(--radius-md)] border border-bg-border bg-bg-tertiary px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        {/* Competitor Comparison (optional) */}
        <div className="border border-bg-border rounded-[var(--radius-lg)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCompetitors(!showCompetitors)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare with competitors (optional)
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showCompetitors ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCompetitors && (
            <div className="px-4 pb-4 space-y-3 border-t border-bg-border">
              <p className="text-xs text-text-muted mt-3">Add up to 2 competitor URLs to see how you stack up.</p>
              <input
                type="text"
                value={competitor1}
                onChange={(e) => setCompetitor1(e.target.value)}
                placeholder="Competitor 1 URL…"
                disabled={loading}
                aria-label="Competitor 1 URL"
                className="w-full rounded-[var(--radius-md)] border border-bg-border bg-bg-tertiary px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={competitor2}
                onChange={(e) => setCompetitor2(e.target.value)}
                placeholder="Competitor 2 URL…"
                disabled={loading}
                aria-label="Competitor 2 URL"
                className="w-full rounded-[var(--radius-md)] border border-bg-border bg-bg-tertiary px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        {/* Loading status messages */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:300ms]" />
            </div>
            <p
              className="text-sm text-brand-secondary font-medium animate-pulse"
              aria-live="polite"
            >
              {STATUS_MESSAGES[statusIdx]}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-status-critical-bg border border-status-critical/20 px-4 py-3">
            <svg
              className="h-5 w-5 text-status-critical shrink-0 mt-0.5"
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
              <p className="text-sm text-status-critical">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-status-critical hover:text-status-critical/80 text-sm font-medium shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
