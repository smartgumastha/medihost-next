import { Suspense } from 'react';
import { BuyDomainContent } from '@/components/buy-domain/buy-domain-content';

export const metadata = {
  title: 'Buy Domain — MediHost',
  description: 'Get your custom .in domain for your clinic.',
};

export default function BuyDomainPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
          <Suspense fallback={<div className="text-slate-500 text-center py-8">Loading...</div>}>
            <BuyDomainContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
