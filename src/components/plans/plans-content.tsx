'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

// ── Plan definitions ────────────────────────────────────────
var PLAN_DEFS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 0,
    yearlyDiscount: 0,
    domainFree: false,
    domainCharge: 699,
    features: ['Clinic website', 'Online appointments', 'Basic OPD', '1 branch'],
    missing: ['Lab reports (LIS)', 'Billing + GST invoices'],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 999,
    yearlyDiscount: 0.20,
    domainFree: false,     // monthly: +699, yearly: free
    domainCharge: 699,
    features: ['AI website builder', 'Full OPD + EMR', 'Billing + GST invoices', 'WhatsApp notifications'],
    missing: ['Pharmacy POS', 'Lab reports (LIS)'],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthly: 2499,
    yearlyDiscount: 0.20,
    domainFree: true,
    domainCharge: 0,
    features: ['Everything in Growth', 'LIS — lab reports', 'Pharmacy POS', 'Home care module'],
    missing: ['Unlimited branches', 'Dedicated manager'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 4999,
    yearlyDiscount: 0.25,
    domainFree: true,
    domainCharge: 0,
    features: ['Everything in Professional', 'Unlimited branches', 'Dedicated account manager', 'Custom integrations'],
    missing: [],
  },
];

var COMPETITORS = [
  { feature: 'Custom .in domain', medihost: 'Included', practo: 'No', godaddy: '₹699/yr separate', diy: '₹800+/yr' },
  { feature: 'AI website builder', medihost: 'Yes', practo: 'No', godaddy: 'Wix (extra)', diy: '₹15k–50k agency' },
  { feature: 'HMS / EMR', medihost: 'Built-in', practo: '₹5k+/mo', godaddy: 'No', diy: 'No' },
  { feature: 'Online appointments', medihost: 'Yes', practo: '₹2k+/mo', godaddy: 'Plugin (extra)', diy: 'No' },
  { feature: 'Google Business sync', medihost: 'Yes', practo: 'Paid add-on', godaddy: 'No', diy: 'Manual' },
  { feature: 'Lab (LIS)', medihost: 'Pro plan', practo: 'No', godaddy: 'No', diy: 'No' },
  { feature: 'Starting price', medihost: 'Free / ₹999', practo: '₹5,000+', godaddy: '₹3,500+', diy: '₹15,000+' },
];

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

// ── Component ───────────────────────────────────────────────
export function PlansContent() {
  var router = useRouter();
  var searchParams = useSearchParams();
  var domain = searchParams.get('domain') || '';
  var intent = searchParams.get('intent') || 'website';

  var [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  var [selected, setSelected] = useState(intent === 'hms' ? 'professional' : 'growth');

  // Compute prices for selected plan
  var breakdown = useMemo(function () {
    var plan = PLAN_DEFS.find(function (p) { return p.id === selected; }) || PLAN_DEFS[0];
    var isYearly = billing === 'yearly';
    var isFree = plan.monthly === 0;

    // Starter is always free — no domain charge on plans page
    if (isFree) {
      return {
        plan: plan, isYearly: isYearly, isFree: true,
        softwareTotal: 0, discountAmount: 0, domainCost: 0,
        domainFreeOnPlan: false, subtotal: 0, gst: 0, total: 0,
        monthlyEquiv: 0, yearlySavings: 0,
      };
    }

    // Software cost
    var softwareMonthly = plan.monthly;
    var softwareAnnual = softwareMonthly * 12;
    var discountAmount = isYearly ? Math.round(softwareAnnual * plan.yearlyDiscount) : 0;
    var softwareTotal = isYearly ? softwareAnnual - discountAmount : softwareMonthly;

    // Domain cost — only Growth monthly charges for domain
    var domainCost = 0;
    var domainFreeOnPlan = plan.domainFree || isYearly;
    if (domain && !domainFreeOnPlan) {
      domainCost = plan.domainCharge; // Growth monthly: +699
    }

    var subtotal = softwareTotal + domainCost;
    var gst = Math.round(subtotal * 0.18);
    var total = subtotal + gst;

    var monthlyEquiv = isYearly ? Math.round(softwareTotal / 12) : softwareMonthly;

    return {
      plan: plan,
      isYearly: isYearly,
      isFree: false,
      softwareTotal: softwareTotal,
      discountAmount: discountAmount,
      domainCost: domainCost,
      domainFreeOnPlan: domainFreeOnPlan,
      subtotal: subtotal,
      gst: gst,
      total: total,
      monthlyEquiv: monthlyEquiv,
      yearlySavings: Math.round(softwareMonthly * 12 * plan.yearlyDiscount) + ((!plan.domainFree && domain) ? plan.domainCharge : 0),
    };
  }, [selected, billing, domain]);

  function handleCTA() {
    var plan = breakdown.plan;
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:hello@medihost.in?subject=Enterprise Plan Enquiry';
      return;
    }
    // Starter always goes to welcome — no payment
    if (plan.monthly === 0) {
      var starterParams = new URLSearchParams();
      starterParams.set('plan', 'starter');
      starterParams.set('intent', intent);
      if (domain) starterParams.set('domain', domain);
      router.push('/welcome?' + starterParams.toString());
      return;
    }
    // Paid plans — pass pre-GST subtotal to payment page
    var params = new URLSearchParams();
    params.set('plan', plan.id);
    if (domain) params.set('domain', domain);
    params.set('billing', billing);
    params.set('amount', String(breakdown.subtotal));
    params.set('intent', intent);
    router.push('/payment?' + params.toString());
  }

  return (
    <div>
      {/* Header */}
      <h2 className="text-2xl font-extrabold text-white text-center mb-1">Choose your plan</h2>

      {/* Domain badge */}
      {domain ? (
        <div className="flex items-center justify-center gap-2 mt-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-emerald-400 text-xs font-bold">✓</span>
          <span className="text-sm text-emerald-300 font-medium">{domain} is available</span>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center mb-4">Free .in domain with paid plans</p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-5">
        {['Signup', 'Plan', 'Payment', 'Done'].map(function (step, i) {
          return (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ' +
                (i <= 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500')}>
                {i < 1 ? '✓' : i + 1}
              </div>
              <span className={'text-xs ' + (i <= 1 ? 'text-slate-300' : 'text-slate-600')}>{step}</span>
              {i < 3 && <div className={'flex-1 h-px ' + (i < 1 ? 'bg-emerald-500/40' : 'bg-white/10')} />}
            </div>
          );
        })}
      </div>

      {/* Monthly / Yearly toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={function () { setBilling('monthly'); }}
          className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' +
            (billing === 'monthly' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300')}
        >
          Monthly
        </button>
        <button
          onClick={function () { setBilling('yearly'); }}
          className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ' +
            (billing === 'yearly' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300')}
        >
          Yearly
          <span className="absolute -top-2 -right-3 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -20%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {PLAN_DEFS.map(function (plan) {
          var isSelected = selected === plan.id;
          var isFree = plan.monthly === 0;
          var isYearly = billing === 'yearly';

          // Badges
          var badge = '';
          if (plan.id === 'growth') badge = 'Most popular';
          if (plan.id === 'professional' && intent === 'hms') badge = 'Recommended for HMS';

          // Price display
          var displayPrice = isFree ? 'Free' : ('₹' + fmt(plan.monthly));
          var period = isFree ? 'forever' : '/mo';

          // Yearly effective price
          var yearlyEffective = isYearly && !isFree
            ? Math.round(plan.monthly * 12 * (1 - plan.yearlyDiscount) / 12)
            : 0;

          // Domain label
          var domainLabel = '';
          if (isFree) {
            domainLabel = 'Subdomain only';
          } else if (domain) {
            if (plan.domainFree || isYearly) {
              domainLabel = 'Domain FREE';
            } else {
              domainLabel = '+ ₹699 domain';
            }
          }

          return (
            <div
              key={plan.id}
              onClick={function () { setSelected(plan.id); }}
              className={'relative rounded-2xl border p-4 cursor-pointer transition-all ' +
                (isSelected
                  ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8')}
            >
              {/* Badge */}
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {badge}
                </div>
              )}

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 font-medium mb-0.5">{plan.name}</div>
                {isYearly && !isFree ? (
                  <div>
                    <span className="text-xl font-extrabold text-white">₹{fmt(yearlyEffective)}</span>
                    <span className="text-sm text-slate-400">/mo</span>
                    <span className="ml-2 text-xs text-slate-500 line-through">₹{fmt(plan.monthly)}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl font-extrabold text-white">{displayPrice}</span>
                    <span className="text-sm text-slate-400">{period}</span>
                  </div>
                )}
                {domainLabel && (
                  <div className={'text-[11px] mt-1 font-medium ' +
                    (domainLabel === 'Domain FREE' ? 'text-emerald-400' : domainLabel === 'Subdomain only' ? 'text-slate-600' : 'text-slate-500')}>
                    {domainLabel}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-2">
                {plan.features.map(function (f) {
                  return (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  );
                })}
              </ul>
              {plan.missing.length > 0 && (
                <ul className="space-y-1 border-t border-white/5 pt-2">
                  {plan.missing.map(function (f) {
                    return (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600 line-through">
                        <span className="mt-0.5 shrink-0">✕</span>
                        {f}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Compact checkout summary ────────────────────── */}
      <div className="border border-white/10 rounded-2xl bg-white/5 px-4 py-4 mb-5">
        {breakdown.isFree ? (
          <>
            {/* Starter summary */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Starter — Free forever</span>
              <span className="text-sm font-extrabold text-white">₹0</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">
              Subdomain: yourname.medihost.in — no custom domain
            </p>
            {domain && (
              <div className="rounded-lg px-3 py-2 mt-2 mb-1 bg-amber-500/10 border border-amber-500/20">
                <p className="text-[11px] text-amber-300">
                  Custom domain <span className="font-bold">{domain}</span> requires Growth plan or above.
                  You&apos;ll get a yourname.medihost.in subdomain on free plan.
                </p>
                <button onClick={function () { setSelected('growth'); }} className="mt-1 text-[11px] text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                  Switch to Growth for custom domain →
                </button>
              </div>
            )}
            {!domain && breakdown.plan.missing.length > 0 && (
              <div className="flex items-center gap-2 mt-2 mb-1 text-[11px] text-amber-300/80">
                <span>Free plan excludes: {breakdown.plan.missing.join(', ')}</span>
                <button onClick={function () { setSelected('growth'); }} className="text-emerald-400 font-bold hover:text-emerald-300 shrink-0">Upgrade →</button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Paid plan summary */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">{breakdown.plan.name} — {breakdown.isYearly ? 'Yearly' : 'Monthly'}</span>
              <div className="flex items-center gap-2">
                {breakdown.isYearly && breakdown.discountAmount > 0 && (
                  <span className="text-[11px] text-emerald-400 font-medium">Save ₹{fmt(breakdown.yearlySavings)}/yr</span>
                )}
                {!breakdown.isYearly && (
                  <button onClick={function () { setBilling('yearly'); }} className="text-[11px] text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Save {Math.round(breakdown.plan.yearlyDiscount * 100)}% yearly →
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>
                ₹{fmt(breakdown.softwareTotal)}
                {domain ? (breakdown.domainFreeOnPlan ? ' + domain free' : ' + ₹' + fmt(breakdown.domainCost) + ' domain') : ''}
                {' + ₹' + fmt(breakdown.gst) + ' GST'}
              </span>
              <span className="text-sm font-extrabold text-white">₹{fmt(breakdown.total)}</span>
            </div>
          </>
        )}

        {/* Big CTA */}
        <button
          onClick={handleCTA}
          className="w-full mt-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-bold rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
        >
          {breakdown.plan.id === 'enterprise'
            ? 'Contact us for Enterprise →'
            : breakdown.isFree
              ? 'Start free →'
              : 'Pay ₹' + fmt(breakdown.total) + ' securely →'}
        </button>

        <p className="text-center text-[11px] text-slate-500 mt-2">
          7-day free trial on Growth &amp; Professional. Cancel anytime. GST invoice provided.
        </p>
      </div>

      {/* ── Competitor comparison ────────────────────────── */}
      <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Why MediHost?</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Everything in one platform — no plugins, no agencies</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-400 font-medium px-4 py-2.5">Feature</th>
                <th className="text-center text-emerald-400 font-bold px-3 py-2.5">MediHost</th>
                <th className="text-center text-slate-500 font-medium px-3 py-2.5">Practo</th>
                <th className="text-center text-slate-500 font-medium px-3 py-2.5">GoDaddy+Wix</th>
                <th className="text-center text-slate-500 font-medium px-3 py-2.5">DIY/Agency</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map(function (row, i) {
                return (
                  <tr key={i} className={i < COMPETITORS.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="px-4 py-2.5 text-slate-300 font-medium">{row.feature}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-400 font-semibold">{row.medihost}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{row.practo}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{row.godaddy}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{row.diy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
