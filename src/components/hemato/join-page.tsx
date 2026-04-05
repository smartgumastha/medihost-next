"use client";

import Link from "next/link";

const partnerTypes = [
  {
    id: "lab",
    title: "Diagnostic Lab",
    desc: "Register your lab, list tests, receive marketplace orders.",
    icon: "🔬",
    href: "/join/lab",
    active: true,
    accent: "border-[#DC2626]/40",
    glow: "shadow-[0_0_30px_rgba(220,38,38,0.15)]",
  },
  {
    id: "hospital",
    title: "Hospital / Clinic",
    desc: "Add your hospital's lab to the Hemato network.",
    icon: "🏥",
    href: "#",
    active: false,
    accent: "",
    glow: "",
  },
  {
    id: "physio",
    title: "Physiotherapy",
    desc: "Offer home physiotherapy sessions through Hemato.",
    icon: "🦴",
    href: "#",
    active: false,
    accent: "",
    glow: "",
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    desc: "Deliver medicines and health products to patients.",
    icon: "💊",
    href: "#",
    active: false,
    accent: "",
    glow: "",
  },
  {
    id: "phlebo",
    title: "Phlebotomist",
    desc: "Join our home collection network. Earn per collection.",
    icon: "🩸",
    href: "/join/phlebotomist",
    active: true,
    accent: "border-[#DC2626]/40",
    glow: "shadow-[0_0_30px_rgba(220,38,38,0.15)]",
  },
];

export function JoinPage() {
  return (
    <div className="min-h-screen bg-[#0C0D0F] text-white">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #DC2626 0%, transparent 70%)" }}
        />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-lg">
              H
            </div>
            <span className="font-semibold text-lg">Hemato</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Back
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">
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
                className={`relative overflow-hidden rounded-xl p-6 flex items-start gap-5 transition-all duration-300 ${
                  p.active
                    ? `border border-white/10 hover:${p.accent} ${p.glow} cursor-pointer bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.07]`
                    : "border border-white/5 opacity-50 bg-white/[0.02]"
                }`}
              >
                {/* Glassmorphic border accent for active items */}
                {p.active && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DC2626] to-transparent opacity-50" />
                )}
                <div className="text-3xl shrink-0">{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    {!p.active && (
                      <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{p.desc}</p>
                </div>
                {p.active && (
                  <svg
                    className="w-5 h-5 text-[#DC2626] shrink-0 mt-1"
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

        {/* Bottom info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Questions? <a href="https://wa.me/917993135689" className="text-[#DC2626] font-medium hover:underline">Chat with us on WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  );
}
