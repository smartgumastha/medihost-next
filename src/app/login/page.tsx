import { Suspense } from 'react';
import { LoginContent } from '@/components/auth/login-content';

export const metadata = {
  title: 'Sign In — MediHost',
  description: 'Sign in to your MediHost dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-emerald-400/30 animate-pulse" />
      <div className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" />
      <div className="absolute bottom-32 left-[20%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse" />

      <div className="relative z-10 w-full max-w-[420px]">
        <Suspense fallback={
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
            <div className="text-slate-400">Loading...</div>
          </div>
        }>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
