import React, { useEffect, useRef, useState } from 'react';

const JOBCLAW_URL = import.meta.env.VITE_JOBCLAW_URL || 'http://localhost:3001';
const HIREMATE_URL = import.meta.env.VITE_HIREMATE_URL || 'http://localhost:3002';

/* ───────────────────────── Helpers ───────────────────────── */

const Arrow = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const Bolt = ({ size = 18, stroke = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Reveals children with a fade/slide when scrolled into view.
function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ───────────────────────── Navbar ───────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl transition-all duration-300 ${scrolled ? 'top-3' : 'top-6'}`}>
      <div
        className={`glass rounded-2xl px-5 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'shadow-[0_8px_40px_rgba(0,0,0,0.45)] bg-[rgba(12,12,18,0.7)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
        }`}
      >
        <a href="#top" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[1.5px]">
            <div className="w-full h-full rounded-[10px] bg-[#0A0A0F] flex items-center justify-center">
              <Bolt size={17} stroke="url(#navGrad)" />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight outfit-font text-white">Hiremate</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Home', href: '#top' },
            { label: 'Features', href: '#features' },
            { label: 'Platform', href: '#platform' },
            { label: 'Analytics', href: '#stats' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-[#9A9AB0] hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={HIREMATE_URL}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_24px_rgba(255,255,255,0.18)]"
        >
          Start Interview
          <Arrow className="w-3.5 h-3.5" />
        </a>
      </div>
    </nav>
  );
}

/* ───────────────────────── Hero visual (product mockup) ───────────────────────── */

function HeroVisual() {
  return (
    <div className="relative w-full max-w-md lg:max-w-lg animate-float">
      {/* glow behind */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-blue-600/30 blur-3xl rounded-[2.5rem]" />

      {/* main panel */}
      <div className="relative glass rounded-3xl p-5 border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 mb-4 px-1">
          <span className="w-3 h-3 rounded-full bg-red-400/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <span className="w-3 h-3 rounded-full bg-green-400/70" />
          <span className="ml-3 text-[11px] text-[#6B6B82] font-mono">live-interview · session</span>
        </div>

        {/* AI question bubble */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px]">
            <div className="w-full h-full rounded-[7px] bg-[#0A0A0F] flex items-center justify-center">
              <Bolt size={13} stroke="#c084fc" />
            </div>
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-[#D4D4E0] leading-relaxed">
            Explain how you'd design a rate limiter for a public API.
          </div>
        </div>

        {/* candidate answer bubble */}
        <div className="flex items-start gap-3 justify-end mb-4">
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-purple-600/30 to-cyan-600/20 border border-purple-400/20 px-4 py-2.5 text-sm text-[#E8E8F0] leading-relaxed max-w-[80%]">
            I'd use a token-bucket per client key in Redis with a sliding window…
          </div>
        </div>

        {/* score card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-[#6B6B82] font-semibold">Live Feedback</span>
            <span className="text-xs font-bold text-cyan-300">92 / 100</span>
          </div>
          {[
            { label: 'Technical depth', val: 94, c: 'from-purple-400 to-purple-500' },
            { label: 'Communication', val: 88, c: 'from-cyan-400 to-blue-500' },
            { label: 'Structure', val: 90, c: 'from-blue-400 to-purple-400' },
          ].map((b) => (
            <div key={b.label} className="mb-2.5 last:mb-0">
              <div className="flex justify-between text-[11px] text-[#9A9AB0] mb-1">
                <span>{b.label}</span>
                <span>{b.val}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${b.c}`} style={{ width: `${b.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating job-match chip */}
      <div className="absolute -bottom-5 -left-4 sm:-left-8 glass rounded-2xl px-4 py-3 border border-white/10 shadow-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
          ✓
        </div>
        <div>
          <p className="text-xs text-[#9A9AB0]">New job match</p>
          <p className="text-sm font-semibold text-white leading-tight">Senior Backend · 96%</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Logo marquee ───────────────────────── */

function LogoStrip() {
  const logos = ['Google', 'Amazon', 'Microsoft', 'Stripe', 'Netflix', 'Meta', 'Airbnb', 'Uber'];
  const row = [...logos, ...logos];
  return (
    <section className="relative z-10 py-12 border-y border-white/5">
      <p className="text-center text-xs uppercase tracking-[0.25em] text-[#6B6B82] mb-8">
        Trusted by engineers hired at top companies
      </p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track gap-16">
          {row.map((name, i) => (
            <span key={i} className="text-2xl font-bold text-white/25 hover:text-white/45 transition-colors outfit-font whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── App ───────────────────────── */

function App() {
  return (
    <div id="top" className="min-h-screen bg-[#08080B] text-[#F4F4F8] overflow-hidden relative">
      {/* clean backdrop: one restrained top glow + fine grid */}
      <div className="pointer-events-none absolute inset-0 bg-glow z-0" />
      <div className="pointer-events-none absolute inset-0 bg-grid z-0" />

      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-40 lg:pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 lg:gap-10">
          {/* copy */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-7 max-w-2xl">
            <div className="px-4 py-1.5 rounded-full glass text-xs font-semibold uppercase tracking-[0.18em] text-purple-200 border border-purple-500/20 inline-flex items-center gap-2 opacity-0 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              Your career, supercharged
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight outfit-font opacity-0 animate-fade-in-up animate-delay-100 text-white">
              Find jobs globally.{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Ace every interview.</span>
            </h1>

            <p className="text-[#9A9AB0] text-lg md:text-xl max-w-xl opacity-0 animate-fade-in-up animate-delay-200 leading-relaxed">
              One unified platform to explore worldwide tech opportunities and master your technical
              interviews with state-of-the-art AI assistance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2 opacity-0 animate-fade-in-up animate-delay-300 w-full sm:w-auto">
              <a
                href={JOBCLAW_URL}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-base transition-all hover:-translate-y-0.5 shadow-[0_10px_40px_rgba(168,85,247,0.4)] overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">Explore Jobs</span>
                <Arrow className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={HIREMATE_URL}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass text-white font-semibold text-base hover:bg-white/10 transition-all hover:-translate-y-0.5 border border-white/15"
              >
                Try AI Interview
              </a>
            </div>

            <div className="flex items-center gap-6 mt-3 opacity-0 animate-fade-in-up animate-delay-400 text-sm text-[#6B6B82]">
              <span className="flex items-center gap-2">
                <span className="text-green-400">✓</span> No credit card required
              </span>
              <span className="hidden sm:flex items-center gap-2">
                <span className="text-green-400">✓</span> Free to get started
              </span>
            </div>
          </div>

          {/* visual */}
          <div className="flex-1 flex justify-center lg:justify-end opacity-0 animate-fade-in-up animate-delay-300 w-full">
            <HeroVisual />
          </div>
        </div>
      </section>

      <LogoStrip />

      {/* ─── STATS ─── */}
      <section id="stats" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden glass border border-white/10">
            {[
              { num: '10K+', label: 'Global job listings', c: 'from-purple-400 to-cyan-400' },
              { num: '50+', label: 'Countries covered', c: 'from-cyan-400 to-blue-400' },
              { num: '98%', label: 'AI accuracy rate', c: 'from-blue-400 to-purple-400' },
              { num: '4.9★', label: 'Average user rating', c: 'from-purple-400 to-pink-400' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="bg-white/[0.015] py-10 px-6 text-center">
                <h2 className={`text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${s.c} mb-2 outfit-font`}>
                  {s.num}
                </h2>
                <p className="text-[#9A9AB0] font-medium tracking-wide uppercase text-xs">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM (two products) ─── */}
      <section id="platform" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-purple-400 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">The Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-bold outfit-font text-white leading-tight">
              Two products.{' '}
              <span className="text-[#9A9AB0]">One career platform.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal>
              <a
                href={JOBCLAW_URL}
                className="feature-card glass p-9 lg:p-10 rounded-3xl group relative overflow-hidden block border border-white/10 text-left h-full"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[1px] mb-7">
                  <div className="w-full h-full rounded-[15px] bg-[#0A0A0F] flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-white outfit-font">JobClaw</h3>
                <p className="text-[#9A9AB0] text-base lg:text-lg leading-relaxed mb-7">
                  Break geographic barriers. Explore global tech opportunities on an interactive 3D globe
                  powered by automated intelligence.
                </p>
                <div className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:text-cyan-300">
                  Launch JobClaw <Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </Reveal>

            <Reveal delay={120}>
              <a
                href={HIREMATE_URL}
                className="feature-card glass p-9 lg:p-10 rounded-3xl group relative overflow-hidden block border border-white/10 text-left h-full"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 p-[1px] mb-7">
                  <div className="w-full h-full rounded-[15px] bg-[#0A0A0F] flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-white outfit-font">HireMate</h3>
                <p className="text-[#9A9AB0] text-base lg:text-lg leading-relaxed mb-7">
                  Ace the technical screen. Practice with conversational AI avatars, get instant ATS
                  scoring, and receive tailored job matches.
                </p>
                <div className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:text-purple-300">
                  Launch HireMate <Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (capabilities grid) ─── */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold outfit-font text-white leading-tight">
              Everything you need,{' '}
              <span className="text-[#9A9AB0]">nothing you don't.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🌍', title: 'Global job search', text: 'Browse thousands of verified roles from companies worldwide on an interactive map.' },
              { icon: '🤖', title: 'AI mock interviews', text: 'Practice with conversational AI avatars that adapt to your role and seniority.' },
              { icon: '📊', title: 'Instant ATS scoring', text: 'Get detailed feedback on technical depth, communication, and structure in seconds.' },
              { icon: '🎯', title: 'Smart job matching', text: 'See how well your profile fits each role with a precise compatibility score.' },
              { icon: '📝', title: 'Tailored prep plans', text: 'Custom question sets built around the exact jobs you want to land.' },
              { icon: '⚡', title: 'One-click apply', text: 'Apply to multiple roles fast with a saved profile and tailored applications.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="feature-card glass rounded-2xl p-7 border border-white/10 h-full text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/12 border border-purple-500/25 flex items-center justify-center text-xl mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 outfit-font">{f.title}</h3>
                  <p className="text-[#9A9AB0] text-sm leading-relaxed">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-12 md:p-20 text-center overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-5 outfit-font text-white tracking-tight">
                  Ready to land your dream job?
                </h2>
                <p className="text-[#9A9AB0] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Join thousands of software engineers and tech professionals using our unified AI
                  platform to dominate the job market.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={JOBCLAW_URL}
                    className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:-translate-y-0.5 transition-transform shadow-[0_10px_30px_rgba(255,255,255,0.18)]"
                  >
                    Start Your Journey <Arrow className="w-4 h-4" />
                  </a>
                  <a
                    href={HIREMATE_URL}
                    className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/15 text-white font-semibold hover:bg-white/10 transition-all hover:-translate-y-0.5"
                  >
                    Try AI Interview
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 bg-[#07070B] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px]">
              <div className="w-full h-full rounded-[7px] bg-[#0A0A0F] flex items-center justify-center">
                <Bolt size={14} stroke="white" />
              </div>
            </div>
            <span className="text-lg font-bold outfit-font text-white tracking-wide">Hiremate</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#features" className="text-[#9A9AB0] hover:text-white transition-colors">Features</a>
            <a href={JOBCLAW_URL} className="text-[#9A9AB0] hover:text-white transition-colors">Jobs</a>
            <a href={HIREMATE_URL} className="text-[#9A9AB0] hover:text-white transition-colors">Interview</a>
            <a href="#stats" className="text-[#9A9AB0] hover:text-white transition-colors">Analytics</a>
          </div>

          <p className="text-[#6B6B82] text-sm">© 2026 Lavanya Bhoyar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
