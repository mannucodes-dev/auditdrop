'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-[3px] border-brand-primary/20 border-t-brand-primary animate-spin" />
            <div className="absolute inset-0 h-14 w-14 rounded-full border-[3px] border-transparent border-b-brand-secondary/40 animate-spin [animation-duration:2s]" />
            <div className="absolute inset-2 rounded-full bg-brand-glow" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-brand-secondary">
              AuditDrop
            </h2>
            <p className="mt-1 text-sm text-text-muted">Loading your workspace…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation bar */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-bg-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary shadow-md shadow-brand-primary/20 group-hover:shadow-brand-primary/40 transition-shadow">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold text-brand-secondary">
                  AuditDrop
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all underline-grow"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all underline-grow"
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Right: Actions + User */}
            <div className="flex items-center gap-3">
              {/* New Audit button */}
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 shimmer-btn"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="hidden sm:inline">New Audit</span>
              </Link>

              {/* User avatar & dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={menuOpen}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User avatar'}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-bg-border hover:ring-brand-primary/50 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-sm font-bold text-white ring-2 ring-bg-border">
                      {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}

                  <svg
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-bg-secondary border border-bg-border shadow-elevated overflow-hidden animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-bg-border">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors md:hidden"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                      >
                        Settings
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-bg-border py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-status-critical hover:bg-status-critical-bg transition-colors cursor-pointer"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid-bg">
        {children}
      </main>
    </div>
  );
}
