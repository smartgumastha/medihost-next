"use client";

import Link from "next/link";
import { useState } from "react";

const packages = [
  { name: "CBC", price: 299, desc: "Complete Blood Count" },
  { name: "Full Body Checkup", price: 999, desc: "70+ tests" },
  { name: "Thyroid Profile", price: 399, desc: "T3, T4, TSH" },
  { name: "Cardiac Risk", price: 1499, desc: "Lipid + Cardiac markers" },
  { name: "Women's Health", price: 1299, desc: "Hormones + Vitamins" },
  { name: "Senior Citizen", price: 2499, desc: "100+ tests" },
  { name: "Diabetes Panel", price: 599, desc: "HbA1c + Glucose" },
  { name: "Vitamin Panel", price: 799, desc: "D3, B12, Iron" },
];

export function HematoLanding() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#0C0D0F] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 sticky top-0 bg-[#0C0D0F]/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/hemato" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-lg">
                H
              </div>
              <span className="font-semibold text-lg hidden sm:block">
                Hemato
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#packages" className="hover:text-white transition">
                Packages
              </a>
              <a href="#labs" className="hover:text-white transition">
                Labs
              </a>
              <a href="#for-labs" className="hover:text-white transition">
                For Labs
              </a>
              <a href="#for-phlebos" className="hover:text-white transition">
                For Phlebos
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/hemato/join/phlebotomist"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition"
            >
              Phlebo App
            </Link>
            <Link
              href="/hemato/join/lab"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition"
            >
              Lab Partner
            </Link>
            <Link
              href="#packages"
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Book Test
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Your city&apos;s labs.{" "}
          <span className="text-[#DC2626]">One search.</span>
          <br />
          Home collected.
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Compare prices from NABL-certified labs near you. Book online. Get
          samples collected at home. Reports delivered on WhatsApp.
        </p>
        <div className="mt-10 max-w-xl mx-auto">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#DC2626]/50">
            <svg
              className="ml-4 w-5 h-5 text-gray-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tests, packages, or labs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-4 text-base outline-none"
            />
            <button className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-6 py-4 text-sm font-medium transition">
              Search
            </button>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            NABL Certified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Home Collection
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
            WhatsApp Reports
          </span>
        </div>
      </section>

      {/* Scrolling Packages */}
      <section id="packages" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Popular Packages</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className="flex-shrink-0 w-56 bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#DC2626]/40 transition group"
              >
                <h3 className="font-semibold text-white group-hover:text-[#DC2626] transition">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{pkg.desc}</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-2xl font-bold text-[#DC2626]">
                    ₹{pkg.price}
                  </span>
                  <button className="text-xs bg-[#DC2626]/10 text-[#DC2626] px-3 py-1.5 rounded-lg hover:bg-[#DC2626]/20 transition">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Labs */}
      <section id="for-labs" className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Register your lab on Hemato</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Get discovered by thousands of patients. Manage orders, reports, and
            billing from one dashboard.
          </p>
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Free LIS Software",
                desc: "Complete lab information system with report generation and barcode tracking.",
              },
              {
                title: "Marketplace Orders",
                desc: "Receive patient bookings from hemato.in. We handle collection and delivery.",
              },
              {
                title: "Your Lab Storefront",
                desc: "Get a branded page with your tests, prices, and reviews. Share your link.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <h3 className="font-semibold text-[#DC2626]">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/hemato/join/lab"
            className="mt-10 inline-block bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-8 py-3 rounded-xl transition"
          >
            Join as Lab
          </Link>
        </div>
      </section>

      {/* For Phlebos */}
      <section id="for-phlebos" className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Join our collection network</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Earn ₹150-300 per collection. Flexible hours. Daily payouts. Work in
            your neighborhood.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { label: "₹150-300", sub: "Per Collection" },
              { label: "Flexible", sub: "Choose Your Hours" },
              { label: "Daily", sub: "Payouts" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="text-2xl font-bold text-[#DC2626]">
                  {s.label}
                </div>
                <div className="text-sm text-gray-400 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
          <Link
            href="/hemato/join/phlebotomist"
            className="mt-10 inline-block bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium px-8 py-3 rounded-xl transition"
          >
            Join as Phlebo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          &copy; 2026 SmartGumastha Technologies. hemato.in — We Deliver Health.
        </div>
      </footer>
    </div>
  );
}
