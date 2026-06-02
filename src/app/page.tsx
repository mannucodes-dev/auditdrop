
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.bento-card');
    const seoCard = document.getElementById('seo-card');
    const progressRing = document.querySelector('.progress-ring-circle');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target === seoCard && progressRing) {
                    setTimeout(() => {
                        progressRing.classList.add('animate');
                    }, 300);
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        // Only observe cards that should animate in (from Features Grid)
        if (card.classList.contains('animated-card')) {
             cardObserver.observe(card);
        }
    });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .bento-card {
            background-color: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.06);
            box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.03);
            transition: all 0.3s ease;
        }

        .animated-card {
            opacity: 0;
            transform: translateY(20px);
        }

        .animated-card.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .bento-card:hover {
            border-color: rgba(0, 0, 0, 0.12);
            box-shadow: 0px 12px 32px rgba(0, 0, 0, 0.08);
            transform: translateY(-4px);
        }

        .code-pattern {
            background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
        }

        .micro-card {
            background-color: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
        }

        .micro-card:hover {
            transform: translateY(-2px);
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .shimmer-text {
            background: linear-gradient(90deg, currentColor 25%, rgba(255,255,255,0.8) 50%, currentColor 75%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s infinite linear;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .float-anim {
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float-subtle {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-4px) translateX(2px); }
        }

        .float-subtle-anim {
            animation: float-subtle 6s ease-in-out infinite;
        }

        @keyframes progress-fill {
            from { stroke-dashoffset: 251; }
            to { stroke-dashoffset: var(--target-offset); }
        }

        .progress-ring-circle.animate {
            animation: progress-fill 1.5s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .bento-card, .shimmer-text, .float-anim, .float-subtle-anim, .progress-ring-circle.animate {
                animation: none !important;
                transition: none !important;
                opacity: 1 !important;
                transform: none !important;
            }
            .bento-card:hover {
                transform: none;
            }
        }
      ` }} />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin py-md max-w-7xl mx-auto left-0 right-0 bg-background/80 backdrop-blur-md border-b border-surface-variant transition-all">
        <div className="flex items-center gap-md">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">AuditDrop</span>
        </div>
        <div className="hidden md:flex items-center gap-margin">
          <button onClick={() => scrollTo('how-it-works')} className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors cursor-pointer">How it Works</button>
          <button onClick={() => scrollTo('features')} className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors cursor-pointer">Features</button>
          <button onClick={() => scrollTo('comparison')} className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors cursor-pointer">Comparison</button>
        </div>
        <div className="flex items-center gap-sm">
          <Link href="/login" className="bg-on-surface text-surface-container-lowest px-md py-sm rounded-DEFAULT font-label-md text-label-md hover:bg-on-surface-variant transition-colors">
            Login
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-2xl">
        {/* Section 1: Hero (Asymmetric) */}
        <section className="max-w-7xl mx-auto px-margin mb-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            {/* Left Content (Span 7) */}
            <div className="md:col-span-7 flex flex-col gap-lg pr-lg">
              <div className="flex flex-col gap-xs font-label-sm text-label-sm text-secondary uppercase tracking-widest border-l-2 border-surface-variant pl-md">
                <span>⚡️ 10,000+ AGENCIES SECURED</span>
                <span>📈 +87% REPLY RATE AVERAGE</span>
                <span>💸 PRECISION AUDITING FOR MODERN TEAMS</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                Turn any URL into a <br/>
                <span className="text-primary-container">client-winning</span> <br/>
                audit report
              </h1>
              <div className="flex flex-col sm:flex-row gap-md mt-sm">
                <Link href="/login" className="bg-on-surface text-surface-container-lowest px-lg py-md rounded-DEFAULT font-label-md text-label-md hover:bg-on-surface-variant transition-colors flex items-center justify-center gap-sm">
                  Start Auditing — It's Free
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <button className="bg-transparent border border-outline-variant text-primary-container px-lg py-md rounded-DEFAULT font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center justify-center">
                  See a sample report
                </button>
              </div>
            </div>
            {/* Right Bento Column (Span 5) */}
            <div className="md:col-span-5 flex flex-col gap-gutter mt-xl md:mt-0 relative">
              <div className="bento-card p-margin flex flex-col gap-sm transform transition-transform hover:-translate-y-1 z-10 rounded-xl">
                <label className="font-label-sm text-label-sm text-secondary">TARGET URL</label>
                <div className="flex items-center border border-surface-variant rounded-DEFAULT overflow-hidden focus-within:border-primary-container transition-colors">
                  <span className="material-symbols-outlined text-secondary pl-sm text-[18px]">link</span>
                  <input className="w-full bg-transparent border-none font-body-md text-body-md text-on-surface py-sm px-sm focus:ring-0 outline-none" readOnly type="text" value="https://your-client.com"/>
                  <button className="bg-surface-container text-on-surface px-md py-sm font-label-sm text-label-sm hover:bg-surface-variant transition-colors border-l border-surface-variant">
                    Scan
                  </button>
                </div>
              </div>
              <div className="bento-card p-margin flex flex-col gap-md ml-xl -mt-lg z-20 rounded-xl">
                <div className="flex items-center gap-sm pb-sm border-b border-surface-variant">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">robot_2</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface">AuditBot</span>
                </div>
                <div className="bg-surface-container-low p-sm rounded-DEFAULT rounded-tl-none self-start border border-surface-variant max-w-[85%]">
                  <p className="font-body-md text-body-md text-on-surface">Hi, I've prepared your website growth audit.</p>
                  <span className="font-label-sm text-label-sm text-secondary mt-xs block text-right">10:42 AM</span>
                </div>
              </div>
              <div className="bento-card p-margin flex flex-col gap-md mr-xl -mt-lg z-10 rounded-xl">
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Traffic Health</span>
                  <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-xs py-xs rounded-DEFAULT">Critical</span>
                </div>
                <div className="space-y-sm">
                  <div className="flex justify-between items-end">
                    <span className="font-label-md text-label-md text-secondary">Organic</span>
                    <span className="font-body-md text-body-md text-on-surface">-12%</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-error"></div>
                  </div>
                  <div className="flex justify-between items-end mt-sm">
                    <span className="font-label-md text-label-md text-secondary">Conversion</span>
                    <span className="font-body-md text-body-md text-on-surface">1.2%</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-primary-container"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How It Works & Stats (Brutalist) */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-margin mb-2xl">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Three steps to your next client.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bento-card relative overflow-hidden flex flex-col h-72 justify-between group rounded-xl p-margin">
              <span className="absolute top-sm right-md font-display-lg text-[120px] leading-none text-surface-container-high opacity-50 select-none group-hover:opacity-100 transition-opacity">01</span>
              <div className="z-10 mt-xl">
                <div className="border border-surface-variant rounded p-sm bg-surface mb-md w-3/4">
                  <div className="h-2 bg-surface-container w-1/2 rounded mb-1"></div>
                  <div className="h-2 bg-surface-container w-full rounded"></div>
                </div>
              </div>
              <div className="z-10">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Input URL</h3>
                <p className="font-body-md text-body-md text-secondary">Drop any prospect's domain into the engine. No complex setup required.</p>
              </div>
            </div>
            <div className="bento-card relative overflow-hidden flex flex-col h-72 justify-between group rounded-xl p-margin">
              <span className="absolute top-sm right-md font-display-lg text-[120px] leading-none text-surface-container-high opacity-50 select-none group-hover:opacity-100 transition-opacity">02</span>
              <div className="z-10 mt-xl flex gap-xs flex-col w-1/2">
                <div className="h-1 bg-primary-container w-full rounded-full animate-pulse"></div>
                <div className="h-1 bg-surface-container w-3/4 rounded-full"></div>
                <div className="h-1 bg-surface-container w-5/6 rounded-full"></div>
              </div>
              <div className="z-10">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Engine Scans</h3>
                <p className="font-body-md text-body-md text-secondary">Our systems analyze 50+ data points for SEO, performance, and conversion leaks.</p>
              </div>
            </div>
            <div className="bento-card relative overflow-hidden flex flex-col h-72 justify-between group rounded-xl p-margin">
              <span className="absolute top-sm right-md font-display-lg text-[120px] leading-none text-surface-container-high opacity-50 select-none group-hover:opacity-100 transition-opacity">03</span>
              <div className="z-10 mt-xl flex justify-end">
                <div className="bg-primary-container text-on-primary p-xs rounded-DEFAULT rounded-br-none text-[10px] font-label-sm w-max">
                  Report ready. Send?
                </div>
              </div>
              <div className="z-10">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Close Deal</h3>
                <p className="font-body-md text-body-md text-secondary">Share a stunning, actionable PDF or web link directly via email or WhatsApp.</p>
              </div>
            </div>
          </div>

          {/* Stats Anchor */}
          <div className="mt-gutter bento-card grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-variant text-center rounded-xl p-margin">
            <div className="flex flex-col gap-xs py-sm">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">1,247+</span>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Reports Generated</span>
            </div>
            <div className="flex flex-col gap-xs py-sm">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">342+</span>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Clients Secured</span>
            </div>
            <div className="flex flex-col gap-xs py-sm">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight">87%</span>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">Reply Rate</span>
            </div>
          </div>
        </section>

        {/* Section 3: Paradigm Shift Comparison (From 68be1...) */}
        <section id="comparison" className="max-w-7xl mx-auto px-margin mb-2xl mt-32">
            <div className="text-center max-w-[56rem] mx-auto mb-2xl">
                <h2 className="font-display-lg text-display-lg tracking-tight text-on-surface mb-lg">
                    Stop sending 40-page PDFs nobody reads.
                </h2>
                <p className="font-headline-sm text-headline-sm text-secondary leading-relaxed">
                    Clients don't buy technical metrics. They buy solutions to lost revenue.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <article className="bento-card rounded-3xl p-2xl flex flex-col gap-xl">
                    <div className="h-[280px] bg-surface-container-low rounded-lg border border-outline-variant/30 overflow-hidden relative flex items-center justify-center code-pattern">
                        <div className="absolute inset-0 opacity-40 font-label-sm text-label-sm text-secondary p-md overflow-hidden select-none pointer-events-none">
                            <div className="absolute top-[10%] left-[5%]">{"{\"ttfb\": \"1.2s\", \"fcp\": \"2.4s\"}"}</div>
                            <div className="absolute top-[25%] right-[10%]">Critical Request Chains: 14</div>
                            <div className="absolute top-[40%] left-[15%]">Cumulative Layout Shift: 0.894</div>
                            <div className="absolute top-[60%] right-[20%]">DOM Nodes: 3,421</div>
                            <div className="absolute top-[75%] left-[8%]">Unused JavaScript: 842kb</div>
                            <div className="absolute top-[85%] right-[5%]">Minify CSS: Failed</div>
                            <div className="absolute top-[15%] right-[40%]">LCP: 4.8s (Poor)</div>
                            <div className="absolute top-[50%] left-[40%]">TBT: 850ms</div>
                        </div>
                        <div className="bg-surface-container-lowest border border-error-container/50 text-error font-label-md text-label-md px-lg py-sm rounded shadow-sm z-10 flex items-center gap-sm">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            Error: Trace blocked
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-sm">The Developer's Audit</div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Diagnostic Tools</h3>
                        <p className="font-body-lg text-body-lg text-secondary">
                            Built for engineers. Overwhelms prospects with jargon, leading to analysis paralysis and lost deals.
                        </p>
                    </div>
                </article>
                <article className="bento-card rounded-3xl p-2xl flex flex-col gap-xl">
                    <div className="h-[280px] bg-surface-container-low rounded-lg border border-outline-variant/30 overflow-hidden relative flex items-center justify-center">
                        <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-lg w-[85%] max-w-[340px] overflow-hidden">
                            <div className="h-1 w-full bg-[#10B981]"></div>
                            <div className="p-lg flex flex-col gap-md">
                                <div className="font-label-md text-label-md text-secondary uppercase tracking-wider">Estimated Revenue Leak</div>
                                <div className="font-display-lg text-headline-lg font-bold text-on-surface tracking-tight">
                                    ₹1.2 Lakhs<span className="text-headline-sm text-secondary">/mo</span>
                                </div>
                                <div className="mt-sm pt-sm border-t border-outline-variant/20 flex justify-between items-center">
                                    <span className="font-label-sm text-label-sm text-secondary">Based on checkout drop-off</span>
                                    <button className="bg-on-surface text-on-primary font-label-md text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity">
                                        Fix this issue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="font-label-md text-label-md text-primary uppercase tracking-widest mb-sm">The Sales Asset</div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">AuditDrop Reports</h3>
                        <p className="font-body-lg text-body-lg text-secondary">
                            Built for closers. Translates technical failures into exact monetary losses. When clients see what it costs them, they hire you to fix it.
                        </p>
                    </div>
                </article>
            </div>
        </section>

        {/* Section 4: Animated Features Grid (From 479f4...) */}
        <section id="features" className="max-w-7xl mx-auto px-margin mb-2xl mt-32">
            <div className="text-center mb-16 space-y-4">
                <h2 className="font-display-lg text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] text-on-surface font-bold leading-tight tracking-[-0.04em]">
                    Everything you need<br/>to close deals
                </h2>
                <p className="font-body-lg text-[18px] sm:text-[20px] text-secondary max-w-[42rem] mx-auto font-medium">
                    Professional audit reports that make prospects say 'yes'
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[280px]" id="bento-grid">
                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col justify-between md:col-span-2 row-span-1" style={{ transitionDelay: '100ms' }}>
                    <div className="space-y-2">
                        <h3 className="font-headline-md text-on-surface">Revenue Impact</h3>
                        <p className="font-body-md text-secondary">Quantify the value of your services immediately.</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border border-[rgba(0,0,0,0.04)] group-hover:bg-white transition-colors duration-300">
                        <div className="text-center sm:text-left">
                            <span className="font-label-sm uppercase text-secondary block mb-1">Estimated Lost Revenue</span>
                            <span className="font-label-md text-error text-xl font-bold tracking-tight shimmer-text">₹45,000</span>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-outline-variant/30"></div>
                        <div className="text-center sm:text-left">
                            <span className="font-label-sm uppercase text-secondary block mb-1">Recoverable Value</span>
                            <span className="font-label-md text-[#10B981] text-xl font-bold tracking-tight shimmer-text">₹45,000</span>
                        </div>
                    </div>
                </div>

                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col lg:row-span-2 relative overflow-hidden group" style={{ transitionDelay: '200ms' }}>
                    <div className="space-y-2 relative z-10">
                        <h3 className="font-headline-md text-on-surface">WhatsApp-Ready</h3>
                        <p className="font-body-md text-secondary">Share stylized reports directly where your clients live.</p>
                    </div>
                    <div className="flex-grow flex items-center justify-center mt-6">
                        <div className="bg-[#E7F3ED] w-full h-full min-h-[160px] rounded-2xl flex flex-col justify-end p-4 relative border border-[#25D366]/20 transition-transform duration-500 group-hover:scale-[1.02]">
                            <div className="bg-white p-3 rounded-xl rounded-tr-sm shadow-sm self-end max-w-[85%] border border-[rgba(0,0,0,0.04)] mb-2 relative z-10 float-anim">
                                <div className="h-2 w-16 bg-surface-container rounded-full mb-2"></div>
                                <div className="h-2 w-24 bg-surface-container rounded-full mb-3"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-primary-container/10 flex items-center justify-center text-primary-container">
                                        <span className="material-symbols-outlined text-[14px]">insert_chart</span>
                                    </div>
                                    <span className="font-label-sm text-on-surface font-bold">Audit Report.pdf</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col justify-between" id="seo-card" style={{ transitionDelay: '300ms' }}>
                    <div className="space-y-2">
                        <h3 className="font-headline-md text-on-surface">SEO Health</h3>
                        <p className="font-body-md text-secondary">Instant technical visibility.</p>
                    </div>
                    <div className="flex justify-center items-center mt-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="40" stroke="#f0f1f3" strokeWidth="8"></circle>
                                <circle className="progress-ring-circle" cx="50" cy="50" fill="none" r="40" stroke="#4F46E5" strokeDasharray="251" strokeDashoffset="251" strokeWidth="8" style={{ '--target-offset': 5 } as any}></circle>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="font-label-md text-xl font-bold text-on-surface counter-val">98</span>
                                <span className="font-label-sm text-secondary">/100</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col justify-between md:col-span-2 row-span-1 relative overflow-hidden group" style={{ transitionDelay: '400ms' }}>
                    <div className="space-y-2 relative z-10 w-[60%]">
                        <h3 className="font-headline-md text-on-surface">Omnichannel Views</h3>
                        <p className="font-body-md text-secondary">Flawless presentation across all devices.</p>
                    </div>
                    <div className="absolute right-4 bottom-[-20px] w-[50%] h-[120%] flex items-end justify-end pointer-events-none opacity-80 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute right-10 bottom-10 w-48 h-32 bg-white rounded-lg border border-outline-variant shadow-lg flex flex-col overflow-hidden float-subtle-anim transition-transform duration-500 group-hover:translate-x-[-10px] group-hover:translate-y-[-10px]">
                            <div className="h-4 bg-surface-container-low border-b border-outline-variant flex items-center px-2 gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-error-container"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/40"></div>
                            </div>
                            <div className="p-2 space-y-1.5">
                                <div className="h-2 w-1/3 bg-surface-container rounded-sm"></div>
                                <div className="h-12 w-full bg-surface-container-low rounded-sm"></div>
                            </div>
                        </div>
                        <div className="absolute right-4 bottom-4 w-16 h-32 bg-white rounded-xl border-2 border-outline-variant shadow-xl flex flex-col overflow-hidden z-10 float-subtle-anim transition-transform duration-500 group-hover:translate-x-[-5px] group-hover:translate-y-[-5px]" style={{ animationDelay: '1s' }}>
                            <div className="h-3 bg-surface-container-low flex justify-center items-center">
                                <div className="w-4 h-0.5 bg-outline-variant rounded-full"></div>
                            </div>
                            <div className="p-1.5 space-y-1 mt-1">
                                <div className="h-1.5 w-1/2 bg-surface-container rounded-sm"></div>
                                <div className="h-8 w-full bg-primary/10 rounded-sm"></div>
                                <div className="h-6 w-full bg-surface-container-low rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col justify-between" style={{ transitionDelay: '500ms' }}>
                    <div className="space-y-2">
                        <h3 className="font-headline-md text-on-surface">GBP Ready</h3>
                        <p className="font-body-md text-secondary">Highlight stellar local reputation.</p>
                    </div>
                    <div className="flex justify-center items-center gap-1 mt-6 group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-[32px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[32px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[32px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[32px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[32px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                </div>

                <div className="bento-card animated-card rounded-3xl p-8 flex flex-col justify-between" style={{ transitionDelay: '600ms' }}>
                    <div className="space-y-2">
                        <h3 className="font-headline-md text-on-surface">Prospect CRM</h3>
                        <p className="font-body-md text-secondary">Visual pipeline management.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-6 h-20 group-hover:gap-3 transition-all duration-300">
                        <div className="bg-surface-container-low rounded-lg p-1.5 flex flex-col gap-1.5 group-hover:bg-surface-container transition-colors duration-300">
                            <div className="w-full h-1 bg-outline-variant/30 rounded-full mb-1"></div>
                            <div className="w-full h-4 bg-white rounded-sm shadow-sm border border-[rgba(0,0,0,0.02)]"></div>
                            <div className="w-full h-4 bg-white rounded-sm shadow-sm border border-[rgba(0,0,0,0.02)]"></div>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-1.5 flex flex-col gap-1.5 group-hover:bg-surface-container transition-colors duration-300">
                            <div className="w-full h-1 bg-outline-variant/30 rounded-full mb-1"></div>
                            <div className="w-full h-4 bg-primary-container/20 border border-primary-container/30 rounded-sm shadow-sm float-subtle-anim"></div>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-1.5 flex flex-col gap-1.5 group-hover:bg-surface-container transition-colors duration-300">
                            <div className="w-full h-1 bg-outline-variant/30 rounded-full mb-1"></div>
                            <div className="w-full h-4 bg-[#10B981]/20 border border-[#10B981]/30 rounded-sm shadow-sm float-subtle-anim" style={{ animationDelay: '0.5s' }}></div>
                            <div className="w-full h-4 bg-white rounded-sm shadow-sm border border-[rgba(0,0,0,0.02)]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 5: CTA (From 7f560...) */}
        <section className="mt-32 max-w-7xl mx-auto px-margin mb-32">
            <div className="bento-card rounded-3xl flex flex-col lg:flex-row gap-lg p-8 md:p-16">
                <div className="lg:w-7/12 flex flex-col justify-center pr-xl">
                    <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-md">
                        Stop leaving money on the table.
                    </h2>
                    <p className="font-body-lg text-body-lg text-secondary mb-xl max-w-[36rem]">
                        Generate your first client-winning audit in the next 30 seconds. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-md">
                        <Link href="/login" className="bg-[#0A0A0A] text-[#FFFFFF] font-label-md text-label-md px-lg py-sm rounded hover:opacity-90 transition-opacity w-fit flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                            Get Started — It's Free
                        </Link>
                        <button className="text-on-surface font-label-md text-label-md px-lg py-sm rounded hover:bg-black/5 transition-all w-fit flex items-center justify-center underline-offset-4 hover:underline">View Pricing</button>
                    </div>
                </div>
                <div className="lg:w-5/12 relative h-64 lg:h-auto flex items-center justify-center mt-12 lg:mt-0">
                    <div className="relative w-full max-w-[24rem] h-full pt-12">
                        <div className="micro-card absolute top-0 left-8 right-8 h-20 rounded-xl p-md flex items-center opacity-60 scale-90 -z-20">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-md"></div>
                            <span className="font-label-md text-label-md text-on-surface-variant">Report sent via WhatsApp</span>
                        </div>
                        <div className="micro-card absolute top-6 left-4 right-4 h-20 rounded-xl p-md flex items-center opacity-80 scale-95 -z-10">
                            <span className="material-symbols-outlined text-outline mr-md" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
                            <span className="font-label-md text-label-md text-on-surface-variant">Client viewed report</span>
                        </div>
                        <div className="micro-card absolute top-12 left-0 right-0 h-24 rounded-xl p-md flex items-center border border-outline-variant/30 shadow-lg bg-surface-container-lowest z-10 group cursor-pointer relative">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-md text-green-600">
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-xs">Status Update</span>
                                <span className="font-headline-sm text-headline-sm text-[#0A0A0A]">Invoice Paid: ₹45,000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-surface-container-low w-full pt-32 pb-lg relative overflow-hidden border-t border-outline-variant/20 mt-auto">
        <div className="max-w-7xl mx-auto px-margin relative z-10 flex flex-col md:flex-row justify-between items-start gap-xl">
            <div className="w-full md:w-1/4 flex flex-col gap-md">
                <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    AuditDrop
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Built for freelancers who actually want to close deals.
                </p>
                <div className="font-label-sm text-label-sm text-secondary mt-xl">
                    © 2024 AuditDrop. All rights reserved.
                </div>
            </div>
            <div className="w-full md:w-3/4 flex flex-wrap sm:flex-nowrap justify-between md:justify-end gap-xl md:gap-2xl">
                <div className="flex flex-col gap-sm">
                    <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest font-bold mb-xs">Product</h4>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Features</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Pricing</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">How it Works</Link>
                </div>
                <div className="flex flex-col gap-sm">
                    <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest font-bold mb-xs">Resources</h4>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Blog</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Templates</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Help Center</Link>
                </div>
                <div className="flex flex-col gap-sm">
                    <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest font-bold mb-xs">Company</h4>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">About</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Privacy Policy</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Terms of Service</Link>
                    <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline duration-200 hover:text-on-surface" href="#">Contact</Link>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none select-none flex justify-center translate-y-1/3">
            <span className="font-display-lg text-[15vw] font-bold text-outline-variant/10 tracking-tighter whitespace-nowrap">
                AUDITDROP
            </span>
        </div>
      </footer>
    </>
  );
}
