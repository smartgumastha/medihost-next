"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const packages = [
  { name: "CBC", price: 299, mrp: 500, params: 24, emoji: "🩸", discount: 40, bg: "#FEF2F2", color: "#DC2626" },
  { name: "Full Body Checkup", price: 999, mrp: 2500, params: 72, emoji: "🫀", discount: 60, bg: "#EFF6FF", color: "#2563EB" },
  { name: "Thyroid Profile", price: 399, mrp: 800, params: 3, emoji: "🦋", discount: 50, bg: "#F5F3FF", color: "#7C3AED" },
  { name: "Cardiac Risk", price: 1499, mrp: 3500, params: 18, emoji: "❤️", discount: 57, bg: "#EFF6FF", color: "#2563EB" },
  { name: "Women's Health", price: 1299, mrp: 3000, params: 45, emoji: "🌸", discount: 57, bg: "#FDF2F8", color: "#DB2777" },
  { name: "Senior Citizen", price: 2499, mrp: 5500, params: 100, emoji: "👴", discount: 55, bg: "#ECFDF5", color: "#059669" },
  { name: "Diabetes Panel", price: 599, mrp: 1200, params: 8, emoji: "🔬", discount: 50, bg: "#FFFBEB", color: "#D97706" },
  { name: "Vitamin Panel", price: 799, mrp: 1800, params: 6, emoji: "☀️", discount: 56, bg: "#FFFBEB", color: "#D97706" },
];

const steps = [
  { num: 1, title: "Search Tests", desc: "Compare prices from 50+ labs near you", icon: "🔍" },
  { num: 2, title: "Book Online", desc: "Choose lab, select time slot", icon: "📅" },
  { num: 3, title: "Home Collection", desc: "Certified phlebo at your door", icon: "🏠" },
  { num: 4, title: "WhatsApp Reports", desc: "Results delivered digitally", icon: "📱" },
];

const stats = [
  { value: "50+", label: "Labs" },
  { value: "200+", label: "Tests" },
  { value: "10,000+", label: "Reports" },
  { value: "4.8★", label: "Rating" },
];

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("hemato-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`hemato-fade ${className}`}>
      {children}
    </div>
  );
}

export function HematoLanding() {
  const [search, setSearch] = useState("");

  return (
    <>
      <style jsx global>{`
        @keyframes hemato-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hemato-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hemato-fade {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .hemato-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hemato-scroll-track {
          animation: hemato-scroll 30s linear infinite;
        }
        .hemato-scroll-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "#FAFAF8", color: "#1a1a18", fontFamily: "'DM Sans', sans-serif" }}>
        {/* ── Nav ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(250,250,248,0.92)", backdropFilter: "blur(20px)", borderColor: "#e5e5e0" }}>
          <div className="max-w-[1140px] mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/hemato" className="flex items-center gap-2.5">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C16 2 6 14 6 20C6 25.5 10.5 30 16 30C21.5 30 26 25.5 26 20C26 14 16 2 16 2Z" fill="#DC2626"/>
                  <text x="16" y="22" textAnchor="middle" fill="white" fontFamily="'Space Mono',monospace" fontWeight="700" fontSize="12">H</text>
                </svg>
                <span className="font-bold text-[19px] tracking-tight" style={{ color: "#1a1a18" }}>Hemato</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-[13px] font-medium" style={{ color: "#6b6b65" }}>
                <a href="#packages" className="hover:text-[#1a1a18] transition-colors">Packages</a>
                <a href="#labs" className="hover:text-[#1a1a18] transition-colors">Labs Near Me</a>
                <a href="#for-labs" className="hover:text-[#1a1a18] transition-colors">For Labs</a>
                <a href="#for-phlebos" className="hover:text-[#1a1a18] transition-colors">For Phlebos</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/hemato/phlebo"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-[10px]"
                style={{ background: "#D97706" }}
              >
                🏍️ Phlebo App
              </Link>
              <Link
                href="/hemato/join/lab"
                className="hidden sm:inline-flex items-center text-[13px] font-semibold px-4 py-2 rounded-[10px] border"
                style={{ borderColor: "#e5e5e0", color: "#1a1a18" }}
              >
                Lab Partner
              </Link>
              <Link
                href="#packages"
                className="inline-flex items-center text-[13px] font-semibold text-white px-4 py-2 rounded-[10px]"
                style={{ background: "#DC2626" }}
              >
                Book Test
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="pt-[88px] overflow-hidden text-center">
          <div className="max-w-[1140px] mx-auto px-6">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold mb-4"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" style={{ animation: "hemato-pulse-dot 2s infinite" }} />
              India&apos;s diagnostic marketplace — live in Hyderabad
            </div>

            {/* Headline */}
            <h1
              className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-tight mx-auto mb-3.5"
              style={{ maxWidth: 700, letterSpacing: "-1.5px" }}
            >
              Your city&apos;s labs.<br />
              One search. <em className="not-italic" style={{ color: "#DC2626" }}>Home collected.</em>
            </h1>

            {/* Subtext */}
            <p className="text-[15px] leading-relaxed mx-auto mb-5" style={{ color: "#6b6b65", maxWidth: 540 }}>
              Why drive to a lab when the lab comes to you? Compare prices across 50+ NABL-certified labs, book in 60 seconds, and get reports on WhatsApp — faster than your morning chai.
            </p>

            {/* Search bar */}
            <div
              className="flex mx-auto mb-4 rounded-xl overflow-hidden"
              style={{ maxWidth: 480, border: "2px solid #DC2626", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <input
                type="text"
                placeholder="Search tests... (CBC, Thyroid, Full Body)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-3.5 text-sm outline-none"
                style={{ fontFamily: "'DM Sans', sans-serif", border: "none" }}
              />
              <button
                className="px-5 py-3.5 text-[13px] font-bold text-white whitespace-nowrap"
                style={{ background: "#DC2626", fontFamily: "'DM Sans', sans-serif", border: "none" }}
              >
                Search
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium" style={{ color: "#6b6b65" }}>
              <span className="flex items-center gap-1">🔬 NABL Certified</span>
              <span className="flex items-center gap-1">🏠 Home Collection</span>
              <span className="flex items-center gap-1">📱 WhatsApp Reports</span>
              <span className="flex items-center gap-1">🔒 Dual Verified</span>
            </div>
          </div>
        </section>

        {/* ── Scrolling Packages ── */}
        <div className="text-center pt-5 pb-2">
          <span className="text-xs font-bold tracking-wider" style={{ color: "#DC2626" }}>200+ HEALTH PACKAGES — SCROLL TO EXPLORE →</span>
        </div>
        <section className="pb-10 overflow-hidden relative" id="packages">
          <div className="absolute top-0 bottom-0 left-0 w-[60px] z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #FAFAF8, transparent)" }} />
          <div className="absolute top-0 bottom-0 right-0 w-[60px] z-10 pointer-events-none" style={{ background: "linear-gradient(-90deg, #FAFAF8, transparent)" }} />
          <div className="flex hemato-scroll-track py-5" style={{ width: "max-content", gap: 14 }}>
            {[...packages, ...packages].map((pkg, i) => (
              <div
                key={`${pkg.name}-${i}`}
                className="flex-shrink-0 rounded-[14px] p-4 transition-all duration-300 hover:shadow-md"
                style={{ width: 220, background: "#fff", border: "1px solid #e5e5e0" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#DC2626"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e5e0"; }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base shrink-0"
                    style={{ background: pkg.bg, color: pkg.color }}
                  >
                    {pkg.emoji}
                  </div>
                  <h4 className="text-[13px] font-bold leading-tight">{pkg.name}</h4>
                </div>
                <div className="text-[10px] mb-2" style={{ color: "#6b6b65" }}>{pkg.params} parameters</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[17px] font-bold" style={{ color: "#DC2626", fontFamily: "'Space Mono', monospace", letterSpacing: "-1px" }}>₹{pkg.price}</span>
                  <span className="text-[11px] line-through" style={{ color: "#6b6b65" }}>₹{pkg.mrp}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#064E3B" }}>{pkg.discount}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <FadeSection>
          <section className="py-12" style={{ background: "#fff", borderTop: "1px solid #e5e5e0", borderBottom: "1px solid #e5e5e0" }}>
            <div className="max-w-[1140px] mx-auto px-6">
              <h2 className="text-[clamp(22px,3.5vw,30px)] font-bold text-center mb-1.5" style={{ letterSpacing: "-0.5px" }}>How It Works</h2>
              <p className="text-center text-sm mb-9 mx-auto" style={{ color: "#6b6b65", maxWidth: 480, lineHeight: 1.6 }}>Four simple steps to your health report.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed" style={{ borderColor: "rgba(220,38,38,0.3)" }} />
                {steps.map((step) => (
                  <div key={step.num} className="text-center relative">
                    <div
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl relative z-10"
                      style={{ background: "#fff", border: "1px solid #e5e5e0", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}
                    >
                      <span
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                        style={{ background: "#DC2626" }}
                      >
                        {step.num}
                      </span>
                      {step.icon}
                    </div>
                    <h3 className="mt-4 font-bold text-sm">{step.title}</h3>
                    <p className="mt-1 text-xs" style={{ color: "#6b6b65" }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── For Labs ── */}
        <FadeSection>
          <section id="for-labs" className="py-12" style={{ background: "linear-gradient(180deg, #fff 0%, #F0FDFA 100%)" }}>
            <div className="max-w-[1140px] mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-7 items-center">
                {/* Left */}
                <div>
                  <h2 className="text-[26px] font-bold mb-2.5" style={{ letterSpacing: "-0.5px" }}>Register Your Lab on Hemato</h2>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#6b6b65" }}>
                    Get discovered by thousands of patients. Manage orders, reports, and billing from one dashboard.
                  </p>
                  <div className="space-y-2 mb-5">
                    {[
                      { title: "Free LIS", desc: "Complete lab information system with report generation" },
                      { title: "Marketplace Orders", desc: "Receive patient bookings — we handle collection" },
                      { title: "Digital Storefront", desc: "Branded page with tests, prices, and reviews" },
                      { title: "Analytics", desc: "Track orders, revenue, and patient insights" },
                    ].map((f) => (
                      <div key={f.title} className="flex gap-2 items-start">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
                          style={{ background: "#F0FDFA", color: "#0D9488" }}
                        >
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold">{f.title}</h4>
                          <p className="text-[11px]" style={{ color: "#6b6b65" }}>{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/hemato/join/lab"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-[10px] transition-all hover:-translate-y-0.5"
                    style={{ background: "#0D9488" }}
                  >
                    Join as Lab Partner →
                  </Link>
                </div>

                {/* Right — Lab storefront mockup */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm rounded-[14px] overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e5e0", boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
                    {/* Browser bar */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ background: "#f3f3f0", borderColor: "#e5e5e0" }}>
                      <div className="flex gap-1">
                        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "#d1d1cc" }} />
                        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "#d1d1cc" }} />
                        <span className="w-[7px] h-[7px] rounded-full" style={{ background: "#d1d1cc" }} />
                      </div>
                      <div className="flex-1 rounded px-2 py-0.5 text-[10px]" style={{ background: "#fff", color: "#6b6b65", fontFamily: "'Space Mono', monospace" }}>
                        hemato.in/lab/medilab
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[15px]" style={{ background: "#F0FDFA" }}>🔬</div>
                        <div>
                          <h4 className="text-[13px] font-bold">MediLab Diagnostics</h4>
                          <p className="text-[10px]" style={{ color: "#6b6b65" }}>NABL Certified · Hyderabad</p>
                        </div>
                      </div>
                      <div className="text-[10px] rounded-md px-2 py-1.5 mb-3" style={{ background: "#F0FDFA", color: "#6b6b65" }}>
                        Open 7AM - 9PM · Home Collection Available
                      </div>
                      <div className="space-y-1">
                        {[
                          { name: "CBC", price: "₹249" },
                          { name: "Thyroid Panel", price: "₹349" },
                          { name: "Lipid Profile", price: "₹399" },
                          { name: "HbA1c", price: "₹299" },
                        ].map((t) => (
                          <div key={t.name} className="flex items-center justify-between px-2 py-1.5 rounded-md text-[11px]" style={{ border: "1px solid #f0f0ec" }}>
                            <span>{t.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color: "#0D9488", fontFamily: "'Space Mono', monospace" }}>{t.price}</span>
                              <button
                                className="px-2 py-0.5 rounded text-[9px] font-bold text-white"
                                style={{ background: "#0D9488" }}
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── For Phlebotomists ── */}
        <FadeSection>
          <section id="for-phlebos" className="py-12">
            <div className="max-w-[1140px] mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-7 items-center">
                {/* Left — Earnings calculator */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm rounded-[14px] p-5" style={{ background: "#fff", border: "1px solid #e5e5e0" }}>
                    <h3 className="text-[15px] font-bold text-center mb-3.5">Earnings Calculator</h3>
                    <div className="space-y-0">
                      {[
                        { label: "Collections per day", value: "5" },
                        { label: "Per collection earning", value: "₹200" },
                        { label: "Daily earnings", value: "₹1,000" },
                        { label: "Monthly earnings (30 days)", value: "₹30,000", highlight: true },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between py-2 text-xs"
                          style={{
                            borderBottom: row.highlight ? "none" : "1px solid #f5f5f0",
                            fontWeight: row.highlight ? 700 : 400,
                            fontSize: row.highlight ? 15 : 12,
                            color: row.highlight ? "#059669" : undefined,
                            paddingTop: row.highlight ? 10 : undefined,
                          }}
                        >
                          <span>{row.label}</span>
                          <span style={{ fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div>
                  <h2 className="text-[26px] font-bold mb-2.5" style={{ letterSpacing: "-0.5px" }}>
                    Join India&apos;s Largest Collection Network
                  </h2>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#6b6b65" }}>
                    Earn on your own schedule. Certified training. Daily payouts. GPS-powered routes.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: "🕐", title: "Flexible Schedule", desc: "Work when you want" },
                      { icon: "📚", title: "Training Provided", desc: "Certified phlebotomy" },
                      { icon: "💰", title: "Daily Payouts", desc: "Earn every day" },
                      { icon: "📍", title: "GPS Navigation", desc: "Optimized routes" },
                    ].map((f) => (
                      <div key={f.title} className="rounded-xl p-3" style={{ background: "#fff", border: "1px solid #e5e5e0" }}>
                        <div className="text-lg mb-1">{f.icon}</div>
                        <div className="text-xs font-bold">{f.title}</div>
                        <div className="text-[10px]" style={{ color: "#6b6b65" }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/hemato/join/phlebotomist"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-[10px] transition-all hover:-translate-y-0.5"
                    style={{ background: "#DC2626" }}
                  >
                    Join as Phlebotomist →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── Trust Badges ── */}
        <FadeSection>
          <section className="py-8" style={{ background: "#fff", borderTop: "1px solid #e5e5e0", borderBottom: "1px solid #e5e5e0" }}>
            <div className="max-w-[1140px] mx-auto px-6">
              <div className="flex flex-wrap items-center justify-center gap-7 text-[11px] font-semibold" style={{ color: "#6b6b65" }}>
                <span className="flex items-center gap-1.5">🛡️ NABL Accredited</span>
                <span className="flex items-center gap-1.5">🔒 HIPAA Compliant</span>
                <span className="flex items-center gap-1.5">🏥 ABDM Integrated</span>
                <span className="flex items-center gap-1.5">✅ ISO 15189</span>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── Powered by MediHost ── */}
        <FadeSection>
          <section className="py-8" style={{ background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
            <div className="flex items-center justify-center gap-3.5 flex-wrap text-center px-6">
              <p className="text-xs max-w-[480px] leading-relaxed" style={{ color: "#1E40AF" }}>
                Hemato is powered by <strong>MediHost</strong> — India&apos;s healthcare infrastructure platform. From lab management to home collection logistics, we build the rails that make diagnostics work.
              </p>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "#fff", border: "1px solid #BFDBFE", color: "#2563EB" }}>
                Powered by MediHost
              </span>
            </div>
          </section>
        </FadeSection>

        {/* ── Join CTA ── */}
        <FadeSection>
          <section className="py-12">
            <div className="max-w-[1140px] mx-auto px-6">
              <div className="rounded-[18px] p-8 text-center" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <h2 className="text-[22px] font-bold mb-2">Ready to get started?</h2>
                <p className="text-[13px] mb-5" style={{ color: "#6b6b65" }}>
                  Book your first test or join the Hemato network today.
                </p>
                <div className="flex justify-center gap-2 flex-wrap mb-3.5">
                  <Link
                    href="#packages"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold text-white"
                    style={{ background: "#DC2626" }}
                  >
                    🔬 Book a Test
                  </Link>
                  <Link
                    href="/hemato/join/lab"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all"
                    style={{ background: "#fff", border: "1px solid #e5e5e0" }}
                  >
                    🏥 Register Lab
                  </Link>
                  <Link
                    href="/hemato/join/phlebotomist"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all"
                    style={{ background: "#fff", border: "1px solid #e5e5e0" }}
                  >
                    🩸 Join as Phlebo
                  </Link>
                </div>
                <div className="flex justify-center gap-4 flex-wrap text-[11px]" style={{ color: "#6b6b65" }}>
                  <span>WhatsApp: <a href="https://wa.me/917993135689" className="font-semibold" style={{ color: "#DC2626" }}>+91 799 313 5689</a></span>
                  <span>Email: <a href="mailto:hello@hemato.in" className="font-semibold" style={{ color: "#DC2626" }}>hello@hemato.in</a></span>
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── Footer ── */}
        <footer className="py-8 border-t" style={{ borderColor: "#e5e5e0" }}>
          <div className="max-w-[1140px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2C16 2 6 14 6 20C6 25.5 10.5 30 16 30C21.5 30 26 25.5 26 20C26 14 16 2 16 2Z" fill="#DC2626"/>
                    <text x="16" y="22" textAnchor="middle" fill="white" fontFamily="'Space Mono',monospace" fontWeight="700" fontSize="10">H</text>
                  </svg>
                  <span className="font-bold text-sm">Hemato</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: "#6b6b65", maxWidth: 220 }}>
                  India&apos;s diagnostic marketplace. Compare labs, book tests, get reports on WhatsApp. A MediHost product.
                </p>
              </div>
              {/* Links */}
              {[
                { title: "FOR PATIENTS", links: [{ label: "Book Test", href: "#packages" }, { label: "Labs Near Me", href: "#labs" }, { label: "Health Packages", href: "#packages" }] },
                { title: "FOR PARTNERS", links: [{ label: "Register Lab", href: "/hemato/join/lab" }, { label: "Phlebo Signup", href: "/hemato/join/phlebotomist" }, { label: "Lab Dashboard", href: "/hemato/lab" }] },
                { title: "COMPANY", links: [{ label: "About", href: "#" }, { label: "Contact", href: "https://wa.me/917993135689" }, { label: "Careers", href: "#" }] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6b6b65" }}>{col.title}</h4>
                  <ul className="space-y-1">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-[11px] transition-colors hover:text-[#1a1a18]" style={{ color: "#6b6b65" }}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t text-[9px]" style={{ borderColor: "#e5e5e0", color: "#6b6b65" }}>
              <span>&copy; 2026 SmartGumastha Technologies. hemato.in — We Deliver Health.</span>
              <a href="https://wa.me/917993135689" className="hover:text-[#1a1a18] transition-colors">WhatsApp: +91 799 313 5689</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
