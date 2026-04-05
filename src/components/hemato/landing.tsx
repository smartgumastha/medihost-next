"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const packages = [
  { name: "CBC", price: 299, mrp: 500, params: 24, emoji: "🩸", discount: 40 },
  { name: "Full Body Checkup", price: 999, mrp: 2500, params: 72, emoji: "🫀", discount: 60 },
  { name: "Thyroid Profile", price: 399, mrp: 800, params: 3, emoji: "🦋", discount: 50 },
  { name: "Cardiac Risk", price: 1499, mrp: 3500, params: 18, emoji: "❤️", discount: 57 },
  { name: "Women's Health", price: 1299, mrp: 3000, params: 45, emoji: "🌸", discount: 57 },
  { name: "Senior Citizen", price: 2499, mrp: 5500, params: 100, emoji: "👴", discount: 55 },
  { name: "Diabetes Panel", price: 599, mrp: 1200, params: 8, emoji: "🔬", discount: 50 },
  { name: "Vitamin Panel", price: 799, mrp: 1800, params: 6, emoji: "☀️", discount: 56 },
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
        @keyframes hemato-float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes hemato-float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(25px, -40px) scale(0.95); }
        }
        @keyframes hemato-float3 {
          0%, 100% { transform: translate(0, 0) scale(0.95); }
          50% { transform: translate(35px, 25px) scale(1.1); }
        }
        @keyframes hemato-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15); }
          50% { box-shadow: 0 0 30px rgba(220,38,38,0.6), 0 0 80px rgba(220,38,38,0.25); }
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
          animation: hemato-scroll 40s linear infinite;
        }
        .hemato-scroll-track:hover {
          animation-play-state: paused;
        }
        .hemato-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="min-h-screen bg-[#050506] text-[#F1F5F9] hemato-noise">
        {/* ── Nav ── */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#111113]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/hemato" className="flex items-center gap-2.5">
                <span className="text-xl">🩸</span>
                <span className="font-extrabold text-lg tracking-tight text-white">Hemato</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
                <a href="#packages" className="hover:text-white transition-colors duration-200">Packages</a>
                <a href="#labs" className="hover:text-white transition-colors duration-200">Labs</a>
                <a href="#for-labs" className="hover:text-white transition-colors duration-200">For Labs</a>
                <a href="#for-phlebos" className="hover:text-white transition-colors duration-200">For Phlebos</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/hemato/join/lab"
                className="hidden sm:block text-sm font-medium text-[#94A3B8] border border-white/[0.1] hover:border-[#DC2626]/50 hover:text-white px-4 py-2 rounded-full transition-all duration-200"
              >
                Lab Partner
              </Link>
              <Link
                href="#packages"
                className="text-sm font-semibold text-white px-5 py-2 rounded-full bg-[#DC2626] hover:bg-[#EF4444] transition-all duration-200"
                style={{ boxShadow: "0 0 20px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)" }}
              >
                Book Test
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Floating red orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
            style={{ background: "radial-gradient(circle, #DC2626 0%, transparent 70%)", animation: "hemato-float1 12s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full opacity-15 blur-[100px]"
            style={{ background: "radial-gradient(circle, #EF4444 0%, transparent 70%)", animation: "hemato-float2 15s ease-in-out infinite" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
            style={{ background: "radial-gradient(circle, #DC2626 0%, transparent 70%)", animation: "hemato-float3 10s ease-in-out infinite" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 text-sm text-[#EF4444] mb-8">
              <span>🔬</span>
              <span>Live in Hyderabad — NABL Certified Labs</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Your city&apos;s labs.{" "}
              <span className="bg-gradient-to-r from-[#DC2626] to-[#EF4444] bg-clip-text text-transparent">
                One search.
              </span>
              <br />
              Home collected.
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
              Compare prices from 50+ NABL-certified labs. Book in 60 seconds. Reports on WhatsApp.
            </p>

            {/* Search bar */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="flex items-center bg-[#111113] border border-white/[0.06] rounded-2xl overflow-hidden focus-within:border-[#DC2626]/40 transition-colors h-14">
                <svg className="ml-4 w-5 h-5 text-[#94A3B8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tests, packages, or labs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-[#94A3B8]/50 px-4 py-4 text-base outline-none"
                />
                <button
                  className="bg-[#DC2626] hover:bg-[#EF4444] text-white px-6 h-full text-sm font-semibold transition-colors"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#94A3B8]">
              <span>🔬 NABL Certified</span>
              <span className="text-white/10">|</span>
              <span>🏠 Home Collection</span>
              <span className="text-white/10">|</span>
              <span>📱 WhatsApp Reports</span>
              <span className="text-white/10">|</span>
              <span>🔒 Dual Verified</span>
            </div>

            {/* Sub badge */}
            <p className="mt-6 text-sm text-[#94A3B8]/70">
              200+ Health Packages — Starting <span className="text-[#EF4444] font-semibold">₹99</span>
            </p>
          </div>
        </section>

        {/* ── Scrolling Packages ── */}
        <FadeSection>
          <section id="packages" className="py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Popular Packages</h2>
              <p className="mt-2 text-[#94A3B8]">Compare, choose, book — all under one roof.</p>
            </div>
            <div className="relative">
              <div className="flex hemato-scroll-track" style={{ width: "max-content" }}>
                {[...packages, ...packages].map((pkg, i) => (
                  <div
                    key={`${pkg.name}-${i}`}
                    className="flex-shrink-0 w-64 mx-3 bg-[#111113] border border-white/[0.06] rounded-2xl p-5 hover:border-[#DC2626]/30 transition-all duration-300 group relative overflow-hidden"
                    style={{ boxShadow: "0 0 0 0 rgba(220,38,38,0)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(220,38,38,0.12)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 0 rgba(220,38,38,0)"; }}
                  >
                    {/* Red top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="text-3xl mb-3">{pkg.emoji}</div>
                    <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">{pkg.params} parameters included</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span className="text-sm text-[#94A3B8] line-through">₹{pkg.mrp}</span>
                        <span className="block text-2xl font-extrabold text-[#DC2626]">₹{pkg.price}</span>
                      </div>
                      <span className="text-xs font-semibold bg-green-500/10 text-green-400 px-2 py-1 rounded-lg">
                        {pkg.discount}% off
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── How It Works ── */}
        <FadeSection>
          <section className="py-20">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-4">How It Works</h2>
              <p className="text-center text-[#94A3B8] mb-16">Four simple steps to your health report.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Connecting line (desktop) */}
                <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] border-t-2 border-dashed border-[#DC2626]/30" />

                {steps.map((step) => (
                  <div key={step.num} className="text-center relative">
                    <div
                      className="w-20 h-20 mx-auto rounded-full bg-[#111113] border border-white/[0.06] flex items-center justify-center text-2xl relative z-10"
                      style={{ boxShadow: "0 0 30px rgba(220,38,38,0.15)" }}
                    >
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center">
                        {step.num}
                      </span>
                      {step.icon}
                    </div>
                    <h3 className="mt-5 font-bold text-white text-lg">{step.title}</h3>
                    <p className="mt-2 text-sm text-[#94A3B8]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── For Labs ── */}
        <FadeSection>
          <section id="for-labs" className="py-20">
            <div className="max-w-6xl mx-auto px-4">
              <div className="relative bg-[#111113] border border-white/[0.06] rounded-3xl overflow-hidden">
                {/* Background glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#DC2626]/10 blur-[100px]" />

                <div className="grid lg:grid-cols-2 gap-10 p-8 sm:p-12 relative z-10">
                  {/* Left */}
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      Register Your Lab on Hemato
                    </h2>
                    <p className="mt-4 text-[#94A3B8] leading-relaxed">
                      Get discovered by thousands of patients. Manage orders, reports, and billing from one dashboard.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        { title: "Free LIS", desc: "Complete lab information system with report generation" },
                        { title: "Marketplace Orders", desc: "Receive patient bookings — we handle collection" },
                        { title: "Digital Storefront", desc: "Branded page with tests, prices, and reviews" },
                        { title: "Analytics", desc: "Track orders, revenue, and patient insights" },
                      ].map((f) => (
                        <li key={f.title} className="flex items-start gap-3">
                          <span className="mt-1 w-5 h-5 rounded-full bg-[#DC2626]/20 flex items-center justify-center shrink-0">
                            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                          </span>
                          <div>
                            <span className="font-semibold text-white">{f.title}</span>
                            <span className="text-[#94A3B8] ml-1">— {f.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/hemato/join/lab"
                      className="mt-8 inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#EF4444] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
                      style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
                    >
                      Join as Lab Partner
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>

                  {/* Right — Lab storefront mockup */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-sm bg-[#0a0a0b] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                        <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 flex items-center justify-center text-[#DC2626] font-bold">M</div>
                        <div>
                          <div className="font-bold text-white text-sm">MediLab Diagnostics</div>
                          <div className="text-xs text-[#94A3B8]">NABL Certified · Hyderabad</div>
                        </div>
                      </div>
                      {[
                        { name: "CBC", price: "₹249" },
                        { name: "Thyroid Panel", price: "₹349" },
                        { name: "Lipid Profile", price: "₹399" },
                        { name: "HbA1c", price: "₹299" },
                      ].map((t) => (
                        <div key={t.name} className="flex items-center justify-between text-sm">
                          <span className="text-[#94A3B8]">{t.name}</span>
                          <span className="font-semibold text-[#EF4444]">{t.price}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-white/[0.06]">
                        <div className="w-full h-9 rounded-lg bg-[#DC2626]/20 flex items-center justify-center text-xs text-[#EF4444] font-semibold">
                          View Full Menu →
                        </div>
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
          <section id="for-phlebos" className="py-20">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Join India&apos;s Largest Collection Network
              </h2>
              <p className="mt-4 text-[#94A3B8] max-w-xl mx-auto">
                Earn on your own schedule. Certified training. Daily payouts. GPS-powered routes.
              </p>

              {/* Earnings calculator */}
              <div className="mt-12 inline-block bg-[#111113] border border-white/[0.06] rounded-2xl p-8">
                <div className="flex flex-wrap items-center justify-center gap-3 text-lg sm:text-xl">
                  <span className="bg-[#DC2626]/10 text-[#EF4444] font-bold px-4 py-2 rounded-xl">5 collections/day</span>
                  <span className="text-[#94A3B8]">×</span>
                  <span className="bg-[#DC2626]/10 text-[#EF4444] font-bold px-4 py-2 rounded-xl">₹200</span>
                  <span className="text-[#94A3B8]">=</span>
                  <span className="bg-[#DC2626]/10 text-[#EF4444] font-bold px-4 py-2 rounded-xl">₹1,000/day</span>
                  <span className="text-[#94A3B8]">=</span>
                  <span className="bg-green-500/10 text-green-400 font-extrabold px-4 py-2 rounded-xl text-2xl">₹30,000/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: "🕐", title: "Flexible Schedule", desc: "Work when you want" },
                  { icon: "📚", title: "Training Provided", desc: "Certified phlebotomy" },
                  { icon: "💰", title: "Daily Payouts", desc: "Earn every day" },
                  { icon: "📍", title: "GPS Navigation", desc: "Optimized routes" },
                ].map((f) => (
                  <div key={f.title} className="bg-[#111113] border border-white/[0.06] rounded-xl p-5 text-center">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="font-semibold text-white text-sm">{f.title}</div>
                    <div className="text-xs text-[#94A3B8] mt-1">{f.desc}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/hemato/join/phlebotomist"
                className="mt-10 inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#EF4444] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
                style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
              >
                Join as Phlebotomist
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        </FadeSection>

        {/* ── Stats ── */}
        <FadeSection>
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-[#111113] border border-white/[0.06] rounded-3xl p-10 sm:p-14">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-b from-[#DC2626] to-[#EF4444] bg-clip-text text-transparent">
                        {s.value}
                      </div>
                      <div className="mt-2 text-sm text-[#94A3B8] font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── Trust Badges ── */}
        <FadeSection>
          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {["NABL", "HIPAA", "ABDM", "ISO 15189"].map((badge) => (
                  <div
                    key={badge}
                    className="px-5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#94A3B8] text-sm font-medium tracking-wide"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── CTA ── */}
        <FadeSection>
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4">
              <div
                className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
                style={{ background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" }}
              >
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Book your first test
                  </h2>
                  <p className="mt-3 text-white/80 text-lg">
                    Quick, easy, and reliable. Your health, delivered.
                  </p>
                  <Link
                    href="#packages"
                    className="mt-8 inline-block bg-white text-[#DC2626] font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/90 transition-all duration-200"
                    style={{ animation: "hemato-glow-pulse 3s ease-in-out infinite", boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
                  >
                    Book Now
                  </Link>
                  <p className="mt-4 text-white/60 text-sm">
                    Free home collection on orders above ₹499
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeSection>

        {/* ── Footer ── */}
        <footer className="border-t border-white/[0.06] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🩸</span>
                <span className="font-extrabold text-lg tracking-tight text-white">Hemato</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#94A3B8]">
                <a href="#packages" className="hover:text-white transition-colors">Tests</a>
                <a href="#labs" className="hover:text-white transition-colors">Labs</a>
                <a href="#for-labs" className="hover:text-white transition-colors">For Labs</a>
                <a href="#for-phlebos" className="hover:text-white transition-colors">For Phlebos</a>
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="https://wa.me/917993135689" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#94A3B8]/60">
              <span>&copy; 2026 SmartGumastha Technologies. hemato.in — We Deliver Health.</span>
              <a href="https://wa.me/917993135689" className="hover:text-white transition-colors">
                WhatsApp: +91 799 313 5689
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
