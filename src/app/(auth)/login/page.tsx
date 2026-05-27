'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(message);
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className={`${inter.className} min-h-screen bg-slate-950 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-b-violet-400/50 animate-spin [animation-duration:1.5s]" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            AuditDrop
          </span>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden`}>
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Login card */}
      <div className="relative w-full max-w-md animate-[fadeInUp_0.6s_ease-out]">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-violet-500/20 via-violet-500/5 to-transparent rounded-2xl" />

        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 sm:p-10 shadow-2xl shadow-violet-500/5">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-5 shadow-lg shadow-violet-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]">
                AuditDrop
              </span>
            </h1>

            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              Turn any business URL into a cold outreach weapon in 30&nbsp;seconds.
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-slate-900/80 text-slate-500 tracking-wider">
                Get started
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Sign-In button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-sm transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {signingIn ? (
              <div className="h-5 w-5 rounded-full border-2 border-slate-400 border-t-slate-700 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{signingIn ? 'Signing in…' : 'Continue with Google'}</span>
          </button>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to our{' '}
            <span className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-slate-400 hover:text-violet-400 cursor-pointer transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>

      {/* Keyframe animations via style tag */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }
      `}</style>
    </div>
  );
}
