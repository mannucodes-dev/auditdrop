'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

// ─── Animated Counter ────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {inView ? count.toLocaleString('en-IN') : '0'}{suffix}
    </span>
  );
}

// ─── WhatsApp Phone Mockup ───────────────────────────────────
const chatMessages = [
  { from: 'sent', text: 'Hi! I found some issues on your website that are costing you leads 📊', delay: 0.6 },
  { from: 'sent', text: 'I made a quick audit report – check it out 👇', delay: 1.2 },
  { from: 'sent', text: 'auditdrop.com/r/demo-report', delay: 1.8, isLink: true },
  { from: 'received', text: 'Wow, this is very detailed! 🔥', delay: 3.0 },
  { from: 'received', text: 'Can you fix these issues for us?', delay: 3.8 },
];

function PhoneMockup() {
  return (
    <div className="relative w-[280px] sm:w-[300px]">
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-2 border-bg-border-hover bg-bg-secondary p-3 shadow-elevated">
        {/* Notch */}
        <div className="mx-auto w-24 h-5 bg-bg-primary rounded-full mb-3" />

        {/* WhatsApp header */}
        <div className="bg-[#075E54] rounded-t-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold">
            B
          </div>
          <div>
            <p className="text-white text-sm font-medium">Business Owner</p>
            <p className="text-green-200 text-xs">online</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-[#0B141A] px-3 py-4 space-y-2 min-h-[280px] rounded-b-xl overflow-hidden">
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: msg.delay, duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.from === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-snug ${
                  msg.from === 'sent'
                    ? 'bg-[#005C4B] text-white rounded-tr-none'
                    : 'bg-[#1F2C33] text-gray-100 rounded-tl-none'
                }`}
              >
                {msg.isLink ? (
                  <span className="text-blue-300 underline">{msg.text}</span>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5 }}
            className="flex justify-start"
          >
            <div className="bg-[#1F2C33] rounded-lg px-4 py-3 rounded-tl-none flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary hero-gradient grid-bg">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-bg-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary shadow-md shadow-brand-primary/20 group-hover:shadow-brand-primary/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-brand-secondary">AuditDrop</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors underline-grow px-3 py-1.5">
              Log in
            </Link>
            <Link
              href="/login"
              className="shimmer-btn bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-glow"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative pt-20 sm:pt-28 pb-20 overflow-hidden">
          {/* Animated blobs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-secondary/8 rounded-full blur-3xl animate-blob-delay" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-brand-glow border border-brand-primary/20 rounded-full px-4 py-1.5 text-xs text-brand-secondary mb-6"
              >
                <span>⚡</span>
                <span>Built for Indian freelancers & agencies</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-text-primary">Turn any URL into a</span>{' '}
                <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-status-excellent bg-clip-text text-transparent">
                  client-winning
                </span>{' '}
                <span className="text-text-primary">audit report</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-5 text-lg text-text-secondary max-w-lg mx-auto lg:mx-0"
              >
                Generate professional website audits in 30 seconds. Share on WhatsApp. Convert cold prospects into paying clients.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/login"
                  className="shimmer-btn bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-glow"
                >
                  Start Auditing — It&apos;s Free
                </Link>
                <Link
                  href="/r/demo"
                  className="text-text-secondary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center gap-1"
                >
                  See a sample report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Right: Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="flex-shrink-0"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <Section className="py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Three steps to your next client
            </h2>
            <p className="mt-3 text-text-secondary">From URL to signed deal in under 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-status-excellent" />

            {[
              { step: '01', icon: '🔗', title: 'Paste a URL', desc: 'Enter any business website. We run mobile, desktop, SEO, and Google Business checks automatically.' },
              { step: '02', icon: '📊', title: 'Get the report', desc: 'In 30 seconds, get a branded audit with scores, revenue impact, and a clear issue list.' },
              { step: '03', icon: '💬', title: 'Share & convert', desc: 'Share via WhatsApp with one click. The prospect sees issues + your contact CTA. You close the deal.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Step circle */}
                <div className="w-24 h-24 mx-auto rounded-2xl glass-card flex items-center justify-center text-4xl mb-5 relative z-10">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  <span className="text-brand-secondary mr-1">{item.step}.</span>
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════ STATS ═══════════════════ */}
        <Section className="py-16">
          <div className="glass-card rounded-2xl p-8 sm:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { value: 1247, suffix: '+', label: 'Reports generated' },
                { value: 342, suffix: '+', label: 'Prospects contacted' },
                { value: 87, suffix: '%', label: 'WhatsApp open rate' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-text-secondary text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══════════════════ FEATURE BENTO ═══════════════════ */}
        <Section className="py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Everything you need to close deals
            </h2>
            <p className="mt-3 text-text-secondary">Professional audit reports that make prospects say &quot;yes&quot;.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { title: 'Revenue Impact', desc: 'Show prospects exactly how much money their broken website costs them.', icon: '₹', span: 'md:col-span-4', accent: 'from-status-critical/10 to-status-warning/10' },
              { title: 'Mobile + Desktop', desc: 'Google Lighthouse scores for both strategies.', icon: '📱', span: 'md:col-span-2', accent: 'from-brand-primary/10 to-brand-secondary/10' },
              { title: 'SEO Health', desc: 'Meta tags, headings, structured data — all checked.', icon: '🔍', span: 'md:col-span-2', accent: 'from-status-good/10 to-status-excellent/10' },
              { title: 'Google Business Profile', desc: 'Rating, reviews, and profile completeness audited automatically.', icon: '⭐', span: 'md:col-span-4', accent: 'from-status-warning/10 to-status-good/10' },
              { title: 'WhatsApp-Ready', desc: 'One-click share with pre-written conversion message.', icon: '💬', span: 'md:col-span-3', accent: 'from-[#25D366]/10 to-brand-primary/10' },
              { title: 'Prospect CRM', desc: 'Track status: New → Viewed → Contacted → Won.', icon: '📋', span: 'md:col-span-3', accent: 'from-brand-secondary/10 to-status-excellent/10' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`${feature.span} glass-card rounded-2xl p-6 hover:border-brand-primary/30 transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════ COMPETITOR CALLOUT ═══════════════════ */}
        <Section className="py-16">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              &quot;Why not just use GTmetrix?&quot;
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">
              GTmetrix is great for developers. AuditDrop is built for <span className="text-brand-secondary font-medium">sales</span>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full max-w-xl mx-auto text-left text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="pb-3 text-text-muted font-medium">Feature</th>
                    <th className="pb-3 text-text-muted font-medium text-center">GTmetrix</th>
                    <th className="pb-3 text-brand-secondary font-medium text-center">AuditDrop</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  {[
                    ['Revenue impact in ₹', '✗', '✓'],
                    ['WhatsApp sharing', '✗', '✓'],
                    ['Prospect CRM', '✗', '✓'],
                    ['Branded reports', '✗', '✓'],
                    ['GBP audit', '✗', '✓'],
                    ['Your CTA on report', '✗', '✓'],
                  ].map(([feature, gtm, ad]) => (
                    <tr key={feature as string} className="border-b border-bg-border/50">
                      <td className="py-3">{feature}</td>
                      <td className="py-3 text-center text-status-critical">{gtm}</td>
                      <td className="py-3 text-center text-status-good font-bold">{ad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ FINAL CTA ═══════════════════ */}
        <Section className="py-20 pb-32">
          <div className="relative gradient-border rounded-2xl">
            <div className="bg-bg-secondary rounded-2xl p-8 sm:p-14 text-center noise-bg relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary relative z-10">
                Ready to close more clients?
              </h2>
              <p className="mt-4 text-text-secondary max-w-md mx-auto relative z-10">
                Start generating professional audit reports today. No credit card required.
              </p>
              <div className="mt-8 relative z-10">
                <Link
                  href="/login"
                  className="shimmer-btn inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-glow"
                >
                  Get Started — It&apos;s Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-bg-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} AuditDrop. Built for freelancers who hustle.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-text-secondary transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
