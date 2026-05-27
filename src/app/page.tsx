import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: '🔗',
    title: 'Paste Any URL',
    description: 'Enter a business website URL — any clinic, salon, agency, or local shop.',
  },
  {
    number: '02',
    icon: '📊',
    title: 'Get Instant Report',
    description: 'AuditDrop checks mobile speed, desktop performance, and 6 custom issues in under 30 seconds.',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Share & Convert',
    description: 'Copy the shareable link. Paste in WhatsApp, email, or DMs. Watch prospects engage.',
  },
];

const features = [
  {
    icon: '⚡',
    title: 'Google PageSpeed Insights',
    description: 'Real performance data from Google — mobile and desktop scores your prospects will trust.',
  },
  {
    icon: '📱',
    title: 'Mobile-First Reports',
    description: 'Reports designed to look stunning on a phone — because that\'s where your prospect reads your message.',
  },
  {
    icon: '🎯',
    title: 'Plain Language',
    description: 'No jargon. "Your site takes 7.4 seconds to load" — not "Eliminate render-blocking resources".',
  },
  {
    icon: '👁️',
    title: 'View Tracking',
    description: 'Know exactly when a prospect opens your report. Follow up at the perfect moment.',
  },
  {
    icon: '💬',
    title: 'WhatsApp CTA',
    description: 'Every report ends with your branded CTA. One tap to contact you directly.',
  },
  {
    icon: '📄',
    title: 'PDF Export',
    description: 'Download any report as a professional PDF for email attachments or offline sharing.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            AuditDrop
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-sm font-medium transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Free to use • No credit card required
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Turn any business URL into a{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 bg-clip-text text-transparent">
              cold outreach weapon
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop sending cold messages that get ignored. Generate a branded website audit report in 30 seconds. Share the link. Let the data do the convincing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-slate-500">
              Takes 30 seconds • No setup required
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Three steps. Thirty seconds. One shareable link that does the selling for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
                  <span className="text-5xl mb-6 block">{step.icon}</span>
                  <div className="text-xs font-bold text-violet-400 tracking-widest mb-2">STEP {step.number}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for freelancers who prospect</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Every feature exists to help you convert cold leads into interested prospects.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 transition-all duration-300 hover:border-slate-700"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-purple-600/20 border border-violet-500/20 rounded-3xl p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to convert more leads?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
              Stop cold messaging without proof. Start sharing audits that make prospects call you back.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            >
              Create Your First Audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} AuditDrop. Built for freelancers, by a freelancer.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-medium">
              AuditDrop
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
