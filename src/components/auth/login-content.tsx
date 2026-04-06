"use client";

import { useSearchParams } from 'next/navigation';
import { LoginForm } from './login-form';

const PRODUCT_CONFIG = {
  hms: { name: 'MediHost HMS', color: '#0F6D7A', subtitle: 'Hospital Management' },
  lis: { name: 'MediHost LIS', color: '#185FA5', subtitle: 'Laboratory System' },
  physio: { name: 'MediHost Physio', color: '#534AB7', subtitle: 'Physiotherapy' },
  medihost: { name: 'MediHost', color: '#10B981', subtitle: 'Clinic Software' },
} as const;

type ProductKey = keyof typeof PRODUCT_CONFIG;

export function LoginContent() {
  const searchParams = useSearchParams();
  const product = (searchParams.get('product') || 'medihost') as ProductKey;
  const config = PRODUCT_CONFIG[product] || PRODUCT_CONFIG.medihost;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
        <span className="text-lg font-bold text-white tracking-tight">
          {config.name}<sup className="text-[10px] text-slate-400 ml-0.5">TM</sup> <span style={{ color: config.color }}>AI</span>
        </span>
      </div>

      {/* Product subtitle */}
      {product !== 'medihost' && (
        <div className="text-center mb-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold border"
            style={{ color: config.color, borderColor: `${config.color}40`, backgroundColor: `${config.color}15` }}
          >
            {config.subtitle}
          </span>
        </div>
      )}

      <h2 className="text-2xl font-extrabold text-white mb-1 text-center">Welcome back</h2>
      <p className="text-sm text-slate-400 mb-8 text-center">
        Sign in to {product === 'medihost' ? 'your dashboard' : config.subtitle}
      </p>

      <LoginForm product={product} accentColor={config.color} />
    </div>
  );
}
