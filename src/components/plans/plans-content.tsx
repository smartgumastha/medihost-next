'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

var PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceLabel: 'Free forever',
    gst: 0,
    total: 0,
    tagline: 'Try MediHost with no commitment',
    features: ['Clinic website', 'Online appointments', 'Basic OPD', '1 branch'],
    cta: 'Start free',
    isFree: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 999,
    priceLabel: '₹999/mo',
    gst: 180,
    total: 1179,
    tagline: 'Best for growing clinics',
    features: ['Everything in Starter', 'LIS — lab reports', 'Billing + GST invoices', 'WhatsApp notifications', '2 branches'],
    cta: 'Get Growth',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2499,
    priceLabel: '₹2,499/mo',
    gst: 450,
    total: 2949,
    tagline: 'For clinics ready to scale',
    features: ['Everything in Growth', 'Pharmacy POS', 'Home care module', 'AI marketing tools', '5 branches'],
    cta: 'Get Professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    priceLabel: '₹4,999/mo',
    gst: 900,
    total: 5899,
    tagline: 'Chain clinics & hospitals',
    features: ['Everything in Professional', 'Unlimited branches', 'Dedicated account manager', 'Custom integrations', 'SLA support'],
    cta: 'Contact us',
    contactOnly: true,
  },
];

export function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const intent = searchParams.get('intent') || 'website';
  const [selected, setSelected] = useState(intent === 'hms' ? 'professional' : 'growth');

  var highlightId = intent === 'hms' ? 'professional' : 'growth';
  var highlightBadge = intent === 'hms' ? 'Recommended for HMS' : 'Most popular';

  function handleSelect(planId: string, contactOnly?: boolean, isFree?: boolean) {
    if (contactOnly) {
      window.location.href = 'mailto:hello@medihost.in?subject=Enterprise Plan Enquiry';
      return;
    }
    if (isFree) {
      router.push(`/dashboard?intent=${intent}`);
      return;
    }
    setSelected(planId);
    const params = new URLSearchParams();
    params.set('plan', planId);
    if (domain) params.set('domain', domain);
    params.set('intent', intent);
    router.push(`/payment?${params.toString()}`);
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-white text-center mb-1">
        Choose your plan
      </h2>
      {domain ? (
        <div className="flex items-center justify-center gap-2 mt-2 mb-5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-emerald-400 text-xs font-bold">✓</span>
          <span className="text-sm text-emerald-300 font-medium">{domain} — included free with any plan</span>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center mb-5">
          Domain included free with any paid plan
        </p>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Signup', 'Plan', 'Payment', 'Done'].map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
              ${i === 0 ? 'bg-emerald-500 text-white' :
                i === 1 ? 'bg-emerald-500 text-white' :
                'bg-white/10 text-slate-500'}`}>
              {i < 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i <= 1 ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
            {i < 3 && <div className={`flex-1 h-px ${i < 1 ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Intent hint */}
      <p className="text-xs text-slate-500 text-center mb-4">
        {intent === 'hms'
          ? 'All HMS plans include OPD, billing, EMR. Professional adds LIS + Pharmacy.'
          : 'All paid plans include a free .in domain and AI-built website.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLANS.map((plan) => {
          var isHighlight = plan.id === highlightId;
          return (
            <div
              key={plan.id}
              onClick={() => handleSelect(plan.id, plan.contactOnly, plan.isFree)}
              className={`relative rounded-2xl border p-4 cursor-pointer transition-all
                ${isHighlight
                  ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : selected === plan.id
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                }`}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {highlightBadge}
                </div>
              )}
              <div className="mb-2">
                <div className="text-xs text-slate-400 font-medium mb-0.5">{plan.name}</div>
                <div className="text-xl font-extrabold text-white">{plan.priceLabel}</div>
                {plan.price > 0 && (
                  <div className="text-[10px] text-slate-500 mt-0.5">+ ₹{plan.gst} GST = ₹{plan.total}/mo</div>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">{plan.tagline}</p>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all
                  ${isHighlight
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                {plan.cta} →
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-600 mt-4">
        7-day free trial on Growth & Professional. Cancel anytime. GST invoice provided.
      </p>
    </div>
  );
}
