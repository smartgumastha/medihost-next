import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Sign Up — MediHost',
  description: 'Create your MediHost account and get your clinic online in 60 seconds.',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] overflow-hidden p-6">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />

      {/* Floating orbs */}
      <div className="absolute top-16 right-[12%] w-3 h-3 rounded-full bg-emerald-400/30 animate-pulse" />
      <div className="absolute top-[45%] left-[10%] w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" />
      <div className="absolute bottom-24 right-[20%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-lg font-bold text-white tracking-tight">
              MediHost <span className="text-emerald-400">AI</span>
              <sup className="text-[10px] text-slate-400 ml-0.5">TM</sup>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-1 text-center">Create your account</h2>
          <p className="text-sm text-slate-400 mb-8 text-center">Start your free clinic in under a minute</p>

          <Suspense fallback={<div className="text-slate-500 text-center py-8">Loading...</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
