'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserSettings {
  displayName: string;
  whatsappNumber: string;
  ctaUrl: string;
  ctaLabel: string;
  useWhatsApp: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    whatsappNumber: '',
    ctaUrl: '',
    ctaLabel: 'Book a Free Call',
    useWhatsApp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSettings({
            displayName: data.displayName || user.displayName || '',
            whatsappNumber: data.whatsappNumber || '',
            ctaUrl: data.ctaUrl || '',
            ctaLabel: data.ctaLabel || 'Book a Free Call',
            useWhatsApp: data.useWhatsApp !== false,
          });
        } else {
          setSettings((prev) => ({
            ...prev,
            displayName: user.displayName || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    try {
      const ctaUrl = settings.useWhatsApp && settings.whatsappNumber
        ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, I saw the audit report you shared about my website.')}`
        : settings.ctaUrl;

      await setDoc(doc(db, 'users', user.uid), {
        displayName: settings.displayName,
        whatsappNumber: settings.whatsappNumber,
        ctaUrl,
        ctaLabel: settings.ctaLabel,
        useWhatsApp: settings.useWhatsApp,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const previewCtaUrl = settings.useWhatsApp && settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=...`
    : settings.ctaUrl;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded-lg w-48" />
          <div className="bg-slate-900/60 rounded-2xl p-6 space-y-4">
            <div className="h-10 bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Configure how your name and contact info appear on report pages.</p>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={settings.displayName}
            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
            placeholder="e.g., Mannu | Web Dev Bangalore"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">This appears on your report pages and CTA section.</p>
        </div>

        {/* CTA Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Contact Method
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setSettings({ ...settings, useWhatsApp: true })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                settings.useWhatsApp
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={() => setSettings({ ...settings, useWhatsApp: false })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                !settings.useWhatsApp
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span>🔗</span> Custom URL
            </button>
          </div>
        </div>

        {/* WhatsApp Number */}
        {settings.useWhatsApp && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              WhatsApp Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+91</span>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="9876543210"
                className="w-full pl-14 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Include country code. E.g., 919876543210</p>
          </div>
        )}

        {/* Custom CTA URL */}
        {!settings.useWhatsApp && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              CTA Link URL
            </label>
            <input
              type="url"
              value={settings.ctaUrl}
              onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value })}
              placeholder="https://calendly.com/your-name"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Calendly, Linktree, or any booking URL.</p>
          </div>
        )}

        {/* CTA Button Label */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            CTA Button Label
          </label>
          <input
            type="text"
            value={settings.ctaLabel}
            onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
            placeholder="Book a Free Call"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20"
        >
          {saving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : saved ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">CTA Preview</h2>
        <div className="bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-purple-600/20 border border-violet-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">These issues are fixable.</h3>
          <p className="text-slate-300 text-sm mb-4">
            {settings.displayName
              ? `${settings.displayName} can help improve your website.`
              : 'Get these issues fixed and improve your website.'}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 rounded-xl text-white font-semibold">
            {settings.ctaLabel || 'Book a Free Call'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          {previewCtaUrl && (
            <p className="text-xs text-slate-500 mt-3 break-all">Links to: {previewCtaUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
