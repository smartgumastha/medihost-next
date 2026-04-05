'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  Sparkles,
  Rocket,
  Monitor,
  CalendarCheck,
  Megaphone,
  Building2,
  FlaskConical,
  Menu,
  X,
  Check,
  Minus,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react';
import { DomainSearch } from './domain-search';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'For Labs', href: 'https://hemato.in' },
  { label: 'HMS Software', href: '/signup' },
];

const STEPS = [
  {
    num: '01',
    emoji: '\uD83C\uDF10',
    title: 'Search Your Domain',
    desc: 'Find the perfect .com or .in for your clinic',
  },
  {
    num: '02',
    emoji: '\u2728',
    title: 'AI Creates Your Website',
    desc: 'Professional website generated in 60 seconds',
  },
  {
    num: '03',
    emoji: '\uD83D\uDE80',
    title: 'Go Live & Grow',
    desc: 'Appointments, billing, marketing \u2014 everything works instantly',
  },
];

const FEATURES: {
  icon: typeof Sparkles;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
  borderHover: string;
}[] = [
  {
    icon: Sparkles,
    title: 'AI Website Builder',
    desc: 'Professional website built by AI. Themes, content, photos \u2014 publish in one click.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderHover: 'hover:border-emerald-500/50',
  },
  {
    icon: Globe,
    title: 'Custom Domain',
    desc: 'Your .com or .in domain. Patients find you at your own professional address.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderHover: 'hover:border-blue-500/50',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Appointments',
    desc: 'Online booking, auto-confirmations, WhatsApp reminders, queue management.',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderHover: 'hover:border-violet-500/50',
  },
  {
    icon: Megaphone,
    title: 'Google & Social Marketing',
    desc: 'One-click GBP, AI social posts, review collection, SEO optimization.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    icon: Building2,
    title: 'Hospital Software',
    desc: 'Full EMR, OPD queue, nurse triage, billing, pharmacy \u2014 enterprise-grade.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderHover: 'hover:border-rose-500/50',
  },
  {
    icon: FlaskConical,
    title: 'Hemato Marketplace',
    desc: "India's diagnostic marketplace. Lab tests, home collection, phlebo network.",
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderHover: 'hover:border-red-500/50',
  },
];

const COMPARISON_FEATURES: {
  label: string;
  medihost: string;
  practo: string;
  godaddy: string;
  manual: string;
}[] = [
  { label: 'Custom Domain', medihost: '\u20B9699/yr', practo: '\u2014', godaddy: '\u20B95000+', manual: '\u20B91000+' },
  { label: 'AI Website', medihost: '60 seconds', practo: '\u2014', godaddy: 'Hours', manual: 'Days' },
  { label: 'HMS / EMR', medihost: 'Built-in', practo: '\u2014', godaddy: '\u2014', manual: '\u2014' },
  { label: 'Appointments', medihost: 'Built-in', practo: '\u20B95000/mo', godaddy: '\u2014', manual: '\u2014' },
  { label: 'Google Business', medihost: 'One-click', practo: '\u2014', godaddy: '\u2014', manual: 'Manual' },
  { label: 'Lab Integration', medihost: 'Hemato', practo: '\u2014', godaddy: '\u2014', manual: '\u2014' },
  { label: 'Starting Price', medihost: 'Free', practo: '\u20B95000/mo', godaddy: '\u20B95000+/yr', manual: '\u20B950,000+' },
];

const PLANS = [
  {
    name: 'Starter',
    price: '\u20B90',
    period: '/forever',
    badge: null,
    features: [
      'Subdomain (yourname.medihost.in)',
      'Basic AI website',
      '1 doctor profile',
      '50 appointments/month',
      'Basic analytics',
      'Email support',
      'SSL certificate',
      'Mobile responsive',
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '\u20B9999',
    period: '/month',
    badge: null,
    features: [
      'Custom .com / .in domain',
      'Full AI website + themes',
      'Up to 5 doctors',
      '500 appointments/month',
      'EMR + billing',
      'Google Business setup',
      'WhatsApp notifications',
      'Priority email support',
    ],
    cta: 'Start 14-Day Trial',
    highlight: false,
  },
  {
    name: 'Business',
    price: '\u20B92,999',
    period: '/month',
    badge: 'Most Popular',
    features: [
      'Everything in Professional',
      'LIS + pharmacy module',
      'AI marketing suite',
      'Unlimited doctors',
      'Unlimited appointments',
      'Priority support',
      'Custom integrations',
      'Hemato marketplace listing',
    ],
    cta: 'Start 14-Day Trial',
    highlight: true,
  },
];

const TESTIMONIALS = [
  {
    quote: 'MediHost got my clinic online in literally 60 seconds. The AI website is better than what my web designer made.',
    name: 'Dr. Sharma',
    role: 'General Physician',
    rating: 5,
  },
  {
    quote: "The domain + website + appointment booking \u2014 all for free? I thought there was a catch. There wasn't.",
    name: 'Dr. Priya',
    role: 'Dental Clinic',
    rating: 5,
  },
  {
    quote: 'Hemato marketplace brought us 200+ patients in the first month. The LIS integration is seamless.',
    name: 'LifeCare Diagnostics',
    role: 'Diagnostic Lab',
    rating: 5,
  },
];

const FOOTER_COLS = [
  {
    title: 'Product',
    links: ['AI Website Builder', 'Custom Domains', 'Appointments', 'Billing & EMR', 'Marketing Suite', 'Hemato Marketplace'],
  },
  {
    title: 'For Clinics',
    links: ['General Practice', 'Dental Clinics', 'Eye Clinics', 'Skin Clinics', 'Multi-Specialty', 'Hospitals'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Contact', 'Partners', 'Press', 'Blog'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'HIPAA Compliance', 'Refund Policy'],
  },
];

/* ------------------------------------------------------------------ */
/*  Scroll animation hook                                              */
/* ------------------------------------------------------------------ */

function useScrollAnimate() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function AnimateOnScroll({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollAnimate();
  return (
    <div
      ref={ref}
      className={`animate-section ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const PRACTICE_TYPES = ['Clinic', 'Laboratory', 'Pharmacy', 'Dental Practice', 'Physio Center', 'Ayurvedic Clinic', 'Hospital', 'Nursing Home', 'Eye Clinic'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPracticeIndex((prev) => (prev + 1) % PRACTICE_TYPES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white scroll-smooth" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ===== Global CSS for animations ===== */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }
        .animate-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .animate-section.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .gradient-text {
          background: linear-gradient(135deg, #10B981, #3B82F6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-mesh {
          background: radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 40% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
      `}</style>

      {/* ===== Sticky Nav ===== */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0F172A]/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 text-xl font-extrabold" style={{ letterSpacing: '-0.03em' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>
              Medi<span className="text-emerald-400">Host</span> <span className="text-emerald-400 text-xs align-super font-bold">AI</span><sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-5 py-2 text-sm font-medium text-slate-300 border border-white/10 rounded-full hover:border-white/30 hover:text-white transition-all"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Start Free &rarr;
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/5 px-4 pb-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-medium text-slate-300 hover:text-white border-b border-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-3">
              <a
                href="/login"
                className="px-4 py-2.5 text-sm font-medium text-center text-slate-300 border border-white/10 rounded-full"
              >
                Login
              </a>
              <a
                href="/signup"
                className="px-4 py-2.5 text-sm font-bold text-center text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
              >
                Start Free &rarr;
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#131C31] to-[#1E293B]" />
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Floating orbs */}
        <div
          className="orb w-[500px] h-[500px] bg-emerald-500/20 top-[10%] left-[10%]"
          style={{ animation: 'floatSlow 8s ease-in-out infinite' }}
        />
        <div
          className="orb w-[400px] h-[400px] bg-blue-500/15 top-[30%] right-[5%]"
          style={{ animation: 'float 6s ease-in-out infinite 1s' }}
        />
        <div
          className="orb w-[300px] h-[300px] bg-violet-500/10 bottom-[10%] left-[30%]"
          style={{ animation: 'floatSlow 10s ease-in-out infinite 2s' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 bg-white/5 backdrop-blur-xl text-slate-300 rounded-full text-sm font-medium border border-white/10"
            style={{ animation: 'fadeInUp 0.6s ease-out' }}
          >
            <span className="text-base">{'\uD83D\uDE80'}</span>
            AI-Powered SaaS for the Medical Fraternity
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05]"
            style={{ letterSpacing: '-0.03em', animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Your{' '}
            <span className="inline-block min-w-[280px] sm:min-w-[360px] text-left">
              <span key={practiceIndex} className="inline-block" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                {PRACTICE_TYPES[practiceIndex]}
              </span>
            </span>
            <br />
            Deserves a <span className="gradient-text">Digital Identity</span>
          </h1>

          {/* Subtext */}
          <p
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            AI-powered website, custom domain, appointments, billing, EMR, and one-click marketing &mdash; for clinics, labs, pharmacies, and every medical practice. Go live in 60 seconds.
          </p>

          {/* Domain Search */}
          <div className="mt-10" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
            <DomainSearch />
          </div>

          {/* See it in action */}
          <div
            className="mt-12 text-sm text-slate-500 font-medium"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            See it in action &darr;
          </div>
        </div>
      </section>

      {/* ===== Social Proof Bar ===== */}
      <section className="relative bg-gradient-to-r from-[#1E293B] via-[#1a2438] to-[#1E293B] border-y border-white/5">
        <AnimateOnScroll>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
              {[
                { value: '500+', label: 'Clinics' },
                { value: '50+', label: 'Labs' },
                { value: '10,000+', label: 'Patients' },
                { value: '4.8\u2605', label: 'Rating' },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  {i > 0 && <span className="hidden sm:block w-px h-8 bg-white/10 -ml-8 sm:-ml-8" />}
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-24 sm:py-32 bg-[#0F172A]" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll className="text-center">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Three Steps to Go Live
            </h2>
          </AnimateOnScroll>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Dotted connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px border-t-2 border-dashed border-white/10" />

            {STEPS.map((s, i) => (
              <AnimateOnScroll key={s.title} delay={i * 150}>
                <div className="relative text-center">
                  {/* Number circle */}
                  <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-6 relative z-10">
                    <span className="text-3xl">{s.emoji}</span>
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] mb-3">
                    <span className="gradient-text">{s.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== No Domain Option ===== */}
      <AnimateOnScroll>
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-8 sm:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold mb-4">
                    ⚡ NO DOMAIN NEEDED
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                    Just want clinic software?<br />Start without a domain.
                  </h3>
                  <p className="text-slate-400 text-base mb-6 max-w-lg">
                    Get the full HMS — appointments, billing, EMR, queue management, pharmacy, LIS — without buying a domain. Go online later when you&apos;re ready.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">✅ AI Marketing</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">✅ One-Click GBP</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">✅ Facebook Setup</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">✅ WhatsApp Automation</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">✅ Full EMR & Billing</span>
                  </div>
                  <a href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-full text-sm hover:shadow-lg hover:shadow-white/20 transition-all">
                    Start Free — No Domain Required <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="w-full lg:w-72 flex-shrink-0">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">🏥</div>
                    <div className="text-lg font-bold text-white mb-1">Free Starter Plan</div>
                    <div className="text-2xl font-extrabold text-emerald-400 mb-2">₹0</div>
                    <div className="text-xs text-slate-500">forever &bull; no credit card</div>
                    <div className="mt-4 space-y-2 text-left text-xs text-slate-400">
                      <div>✓ Appointments & Queue</div>
                      <div>✓ Billing & Invoicing</div>
                      <div>✓ EMR & Prescriptions</div>
                      <div>✓ AI Patient Summaries</div>
                      <div>✓ Google Business Setup</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ===== Features Grid ===== */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-[#0F172A] to-[#131C31]" id="features">
        <div className="max-w-6xl mx-auto px-4">
          <AnimateOnScroll className="text-center">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Everything Your Clinic Needs
            </h2>
            <p className="text-slate-400 mt-4 text-lg">One platform, zero headaches</p>
          </AnimateOnScroll>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <AnimateOnScroll key={f.title} delay={i * 100}>
                <div
                  className={`group bg-white/[0.04] backdrop-blur-sm rounded-2xl p-7 border border-white/[0.08] ${f.borderHover} hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${f.bgColor} ${f.color} mb-5`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Comparison Table ===== */}
      <section className="py-24 sm:py-32 bg-[#0F172A]" id="comparison">
        <div className="max-w-5xl mx-auto px-4">
          <AnimateOnScroll className="text-center">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Compare</p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Why Clinics Choose MediHost
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="mt-12 overflow-x-auto rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 text-left font-semibold text-slate-400">Feature</th>
                    <th className="px-5 py-4 text-left font-bold text-emerald-400 border-x border-emerald-500/20 bg-emerald-500/5">
                      MediHost
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-400">Practo</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-400">GoDaddy+Wix</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-400">Doing Nothing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {COMPARISON_FEATURES.map((row) => (
                    <tr key={row.label} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{row.label}</td>
                      <td className="px-5 py-3.5 border-x border-emerald-500/20 bg-emerald-500/5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-4 h-4" />
                          {row.medihost}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {row.practo === '\u2014' ? (
                          <span className="inline-flex items-center gap-1 text-red-400/50">
                            <X className="w-3.5 h-3.5" /> No
                          </span>
                        ) : (
                          row.practo
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {row.godaddy === '\u2014' ? (
                          <span className="inline-flex items-center gap-1 text-red-400/50">
                            <X className="w-3.5 h-3.5" /> No
                          </span>
                        ) : (
                          row.godaddy
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {row.manual === '\u2014' ? (
                          <span className="inline-flex items-center gap-1 text-red-400/50">
                            <X className="w-3.5 h-3.5" /> No
                          </span>
                        ) : (
                          row.manual
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-[#0F172A] to-[#131C31]" id="pricing">
        <div className="max-w-6xl mx-auto px-4">
          <AnimateOnScroll className="text-center">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 mt-4 text-lg">Start free, upgrade when you&apos;re ready</p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setBillingYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  !billingYearly ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingYearly ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1.5 text-xs text-emerald-400 font-bold">-20%</span>
              </button>
            </div>
          </AnimateOnScroll>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <AnimateOnScroll key={plan.name} delay={i * 150}>
                <div
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-2xl shadow-emerald-500/20 scale-[1.03] border-2 border-emerald-400/50'
                      : plan.name === 'Professional'
                        ? 'bg-white/[0.04] border-2 border-emerald-500/30 hover:border-emerald-500/50 backdrop-blur-sm'
                        : 'bg-white/[0.04] border border-white/[0.08] hover:border-white/20 backdrop-blur-sm'
                  }`}
                  style={plan.highlight ? { animation: 'pulse-glow 3s ease-in-out infinite' } : {}}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`text-lg font-bold ${plan.highlight ? 'text-emerald-50' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-white'}`} style={{ letterSpacing: '-0.03em' }}>
                      {billingYearly && plan.price !== '\u20B90'
                        ? plan.price === '\u20B9999'
                          ? '\u20B9799'
                          : '\u20B92,399'
                        : plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-7 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? 'text-emerald-50' : 'text-slate-400'}`}>
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-white' : 'text-emerald-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/signup"
                    className={`mt-8 w-full py-3.5 rounded-full font-bold text-sm transition-all block text-center ${
                      plan.highlight
                        ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="py-24 sm:py-32 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimateOnScroll className="text-center">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Testimonials</p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Loved by Doctors
            </h2>
          </AnimateOnScroll>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <AnimateOnScroll key={t.name} delay={i * 150}>
                <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-7 border border-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-emerald-500/30 mb-4" />
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-slate-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#131C31] via-[#0F172A] to-[#0F172A]" />
        <div className="absolute inset-0 gradient-mesh" />

        {/* Floating orbs */}
        <div
          className="orb w-[400px] h-[400px] bg-emerald-500/15 top-[20%] right-[10%]"
          style={{ animation: 'float 7s ease-in-out infinite' }}
        />
        <div
          className="orb w-[300px] h-[300px] bg-blue-500/10 bottom-[10%] left-[15%]"
          style={{ animation: 'floatSlow 9s ease-in-out infinite 1s' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <AnimateOnScroll>
            <h2
              className="text-4xl sm:text-5xl font-extrabold text-white"
              style={{ letterSpacing: '-0.03em' }}
            >
              Ready to go live?
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Join 500+ clinics already growing with MediHost
            </p>
            <div className="mt-10">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full text-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              No credit card required &bull; Free forever starter plan
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#0a1120] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 text-center sm:text-left">
              &copy; 2026 SmartGumastha Technologies &bull; MediHost AI&trade; &mdash; We Deliver Health
            </p>
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Instagram</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
