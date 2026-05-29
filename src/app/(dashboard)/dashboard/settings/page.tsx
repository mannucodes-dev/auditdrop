'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/Toast';

interface UserSettings {
  displayName: string;
  whatsappNumber: string;
  ctaUrl: string;
  ctaLabel: string;
  useWhatsApp: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    whatsappNumber: '',
    ctaUrl: '',
    ctaLabel: 'Book a Free Call',
    useWhatsApp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

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

      addToast('success', 'Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      addToast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const embedCode = user
    ? `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${user.uid}" width="100%" height="500" frameborder="0" style="border:none;border-radius:16px;"></iframe>`
    : '';

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    addToast('success', 'Embed code copied to clipboard');
    setTimeout(() => setEmbedCopied(false), 2000);
  }, [embedCode, addToast]);

  const previewCtaUrl = settings.useWhatsApp && settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=...`
    : settings.ctaUrl;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="animate-skeleton space-y-6">
          <div className="h-8 bg-bg-tertiary rounded-[var(--radius-lg)] w-48" />
          <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-6 space-y-4">
            <div className="h-10 bg-bg-tertiary rounded-[var(--radius-lg)]" />
            <div className="h-10 bg-bg-tertiary rounded-[var(--radius-lg)]" />
            <div className="h-10 bg-bg-tertiary rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8">
      {/* ── Contact Settings ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary mb-8">Configure how your name and contact info appear on report pages.</p>

        <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-xl)] p-6 sm:p-8 space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
              placeholder="e.g., Mannu | Web Dev Bangalore"
              className="w-full px-4 py-3 bg-bg-tertiary border border-bg-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            />
            <p className="text-xs text-text-muted mt-1">This appears on your report pages and CTA section.</p>
          </div>

          {/* CTA Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Contact Method
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSettings({ ...settings, useWhatsApp: true })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-lg)] border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  settings.useWhatsApp
                    ? 'bg-status-good-bg border-status-good/30 text-status-good'
                    : 'bg-bg-tertiary border-bg-border text-text-secondary hover:border-bg-border-hover'
                }`}
              >
                <span>💬</span> WhatsApp
              </button>
              <button
                onClick={() => setSettings({ ...settings, useWhatsApp: false })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-lg)] border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  !settings.useWhatsApp
                    ? 'bg-brand-glow border-brand-primary/30 text-brand-secondary'
                    : 'bg-bg-tertiary border-bg-border text-text-secondary hover:border-bg-border-hover'
                }`}
              >
                <span>🔗</span> Custom URL
              </button>
            </div>
          </div>

          {/* WhatsApp Number */}
          {settings.useWhatsApp && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">+91</span>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-14 pr-4 py-3 bg-bg-tertiary border border-bg-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">Include country code. E.g., 919876543210</p>
            </div>
          )}

          {/* Custom CTA URL */}
          {!settings.useWhatsApp && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                CTA Link URL
              </label>
              <input
                type="url"
                value={settings.ctaUrl}
                onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value })}
                placeholder="https://calendly.com/your-name"
                className="w-full px-4 py-3 bg-bg-tertiary border border-bg-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              />
              <p className="text-xs text-text-muted mt-1">Calendly, Linktree, or any booking URL.</p>
            </div>
          )}

          {/* CTA Button Label */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              CTA Button Label
            </label>
            <input
              type="text"
              value={settings.ctaLabel}
              onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
              placeholder="Book a Free Call"
              className="w-full px-4 py-3 bg-bg-tertiary border border-bg-border rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 rounded-[var(--radius-lg)] text-white font-semibold transition-all duration-200 shadow-glow cursor-pointer"
          >
            {saving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>

        {/* CTA Preview */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">CTA Preview</h2>
          <div className="bg-brand-glow border border-brand-primary/20 rounded-[var(--radius-xl)] p-6 text-center">
            <h3 className="text-xl font-bold text-text-primary mb-2">These issues are fixable.</h3>
            <p className="text-text-secondary text-sm mb-4">
              {settings.displayName
                ? `${settings.displayName} can help improve your website.`
                : 'Get these issues fixed and improve your website.'}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary rounded-[var(--radius-lg)] text-white font-semibold">
              {settings.ctaLabel || 'Book a Free Call'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            {previewCtaUrl && (
              <p className="text-xs text-text-muted mt-3 break-all">Links to: {previewCtaUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Embed Widget ────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Embed Widget</h2>
        <p className="text-text-secondary text-sm mb-4">
          Add a free audit widget to your website or portfolio. Leads from this widget will appear in your dashboard automatically.
        </p>

        <div className="bg-bg-secondary border border-bg-border rounded-[var(--radius-xl)] p-6 space-y-4">
          {/* Widget Preview */}
          <div className="bg-bg-tertiary rounded-[var(--radius-lg)] p-4 border border-bg-border">
            <div className="text-center py-4">
              <div className="text-xs text-text-muted mb-3">⚡ Preview</div>
              <div className="text-lg font-bold text-text-primary mb-1">Get a Free Website Audit</div>
              <div className="text-sm text-text-secondary mb-4">Paste your website URL to see your score</div>
              <div className="max-w-sm mx-auto">
                <div className="h-10 bg-bg-border rounded-[var(--radius-md)] mb-3" />
                <div className="h-10 bg-brand-primary/40 rounded-[var(--radius-md)]" />
              </div>
              <div className="text-xs text-text-muted mt-4">Powered by AuditDrop</div>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Embed Code
            </label>
            <div className="relative">
              <pre className="bg-bg-primary border border-bg-border rounded-[var(--radius-lg)] p-4 text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium bg-bg-tertiary hover:bg-bg-border text-text-secondary rounded-[var(--radius-md)] transition-colors cursor-pointer"
              >
                {embedCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Paste this in any HTML page. Reports from this widget count against your daily embed quota (50/day).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
