import { Suspense } from 'react';
import { ResellerRegistration } from '@/components/reseller/registration';

export const metadata = {
  title: 'Become a MediHost Reseller — Earn ₹500+ per Referral',
  description: 'Join MediHost\'s reseller program. Refer clinics, earn commissions. No investment needed.',
};

export default function ResellerPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="border-b border-white/10 h-14 flex items-center px-6">
        <a href="/" className="text-lg font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Medi<span className="text-emerald-400">Host</span> AI<sup className="text-[8px] text-slate-500 ml-0.5">&trade;</sup>
        </a>
      </nav>
      <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading...</div>}>
        <ResellerRegistration />
      </Suspense>
    </div>
  );
}
