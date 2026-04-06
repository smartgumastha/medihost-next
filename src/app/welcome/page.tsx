import { Suspense } from 'react';
import { WelcomeContent } from '@/components/welcome/welcome-content';

export const metadata = {
  title: 'You\'re live — MediHost',
  description: 'Your clinic is now on MediHost. Let\'s get you set up.',
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-16 left-[15%] w-3 h-3 rounded-full bg-emerald-400/30 animate-pulse" />
      <div className="absolute top-[35%] right-[10%] w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" />
      <div className="absolute bottom-28 left-[25%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse" />
      <div className="relative z-10 w-full max-w-[520px]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
          <Suspense fallback={<div className="text-slate-500 text-center py-8">Loading...</div>}>
            <WelcomeContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
