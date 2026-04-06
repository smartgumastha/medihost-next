import { Suspense } from 'react';
import { ResellerRegistration } from '@/components/reseller/registration';

export const metadata = {
  title: 'Become a MediHost Reseller — Earn 10-20% Ongoing Commission',
  description: 'Join MediHost\'s reseller program. Refer clinics, earn recurring commissions. No investment needed.',
  openGraph: {
    title: 'Become a MediHost Reseller — Earn 10-20% Ongoing Commission',
    description: 'Refer clinics, earn recurring commissions. Free to join, no targets, no pressure.',
    url: 'https://medihost.in/reseller',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
};

export default function ResellerPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Nav bar */}
      <nav className="border-b border-white/10 h-14 flex items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          MediHost<sup className="text-[8px] text-slate-500">&trade;</sup> <span className="text-emerald-400">AI</span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            Home
          </a>
          <a
            href="/reseller/login"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Already a reseller? Login →
          </a>
        </div>
      </nav>

      <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading...</div>}>
        <ResellerRegistration />
      </Suspense>
    </div>
  );
}
