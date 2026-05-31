'use client';

import { type ReportLanguage } from '@/lib/translations';

interface LanguageToggleProps {
  language: ReportLanguage;
  onChange: (lang: ReportLanguage) => void;
}

/**
 * Pill toggle for switching between English and Hinglish.
 * Persists choice to localStorage.
 */
export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  const handleChange = (lang: ReportLanguage) => {
    onChange(lang);
    try {
      localStorage.setItem('auditdrop-lang', lang);
    } catch {
      // localStorage may not be available (SSR, private browsing)
    }
  };

  return (
    <div className="inline-flex items-center rounded-full bg-bg-card/80 border border-bg-navy-border/40 p-1 text-sm">
      <button
        onClick={() => handleChange('en')}
        className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? 'bg-brand-teal text-white font-medium shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleChange('hi-simple')}
        className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          language === 'hi-simple'
            ? 'bg-brand-teal text-white font-medium shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-pressed={language === 'hi-simple'}
      >
        हिंदी
      </button>
    </div>
  );
}
