"use client";

import Link from "next/link";

const partnerTypes = [
  {
    id: "lab",
    title: "Diagnostic Lab",
    desc: "Register your lab, list tests, receive marketplace orders.",
    icon: "🔬",
    href: "/hemato/join/lab",
    active: true,
  },
  {
    id: "hospital",
    title: "Hospital / Clinic",
    desc: "Add your hospital's lab to the Hemato network.",
    icon: "🏥",
    href: "#",
    active: false,
  },
  {
    id: "physio",
    title: "Physiotherapy",
    desc: "Offer home physiotherapy sessions through Hemato.",
    icon: "🦴",
    href: "#",
    active: false,
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    desc: "Deliver medicines and health products to patients.",
    icon: "💊",
    href: "#",
    active: false,
  },
  {
    id: "phlebo",
    title: "Phlebotomist",
    desc: "Join our home collection network. Earn per collection.",
    icon: "🩸",
    href: "/hemato/join/phlebotomist",
    active: true,
  },
];

export function JoinPage() {
  return (
    <div className="min-h-screen bg-[#0C0D0F] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
          <Link href="/hemato" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-lg">
              H
            </div>
            <span className="font-semibold text-lg">Hemato</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          Join <span className="text-[#DC2626]">Hemato</span> as a Partner
        </h1>
        <p className="mt-4 text-gray-400 text-center max-w-lg mx-auto">
          Choose how you want to partner with us. Grow your business with
          Hemato&apos;s marketplace.
        </p>

        <div className="mt-12 grid gap-4">
          {partnerTypes.map((p) => {
            const content = (
              <div
                className={`bg-white/5 border rounded-xl p-6 flex items-start gap-5 transition ${
                  p.active
                    ? "border-white/10 hover:border-[#DC2626]/40 cursor-pointer"
                    : "border-white/5 opacity-60"
                }`}
              >
                <div className="text-3xl shrink-0">{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    {!p.active && (
                      <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{p.desc}</p>
                </div>
                {p.active && (
                  <svg
                    className="w-5 h-5 text-gray-500 shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            );

            return p.active ? (
              <Link key={p.id} href={p.href}>
                {content}
              </Link>
            ) : (
              <div key={p.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
