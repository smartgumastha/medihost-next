import { Suspense } from 'react';
import { PaymentContent } from '@/components/payment/payment-content';

export const metadata = {
  title: 'Complete Payment — MediHost',
  description: 'Secure payment for your MediHost clinic plan.',
};

export default function PaymentPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-lg font-bold text-white tracking-tight">
              MediHost<sup className="text-[10px] text-slate-400 ml-0.5">TM</sup>{' '}
              <span className="text-emerald-400">AI</span>
            </span>
          </div>
          <Suspense fallback={<div className="text-slate-500 text-center py-8">Loading...</div>}>
            <PaymentContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
