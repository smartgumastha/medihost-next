"use client";

import { useState, useEffect, useCallback } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────

interface Feature {
  feature_key: string;
  feature_value: string;
  description: string;
}

interface Plan {
  plan_tier: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  features: Feature[];
}

// ── Constants ──────────────────────────────────────────────

const COUNTRIES = [
  { code: 'IN', label: 'India', symbol: '\u20B9' },
  { code: 'US', label: 'US', symbol: '$' },
  { code: 'GB', label: 'UK', symbol: '\u00A3' },
  { code: 'AE', label: 'UAE', symbol: '\u062F.\u0625' },
  { code: 'NG', label: 'Nigeria', symbol: '\u20A6' },
  { code: 'KE', label: 'Kenya', symbol: 'KSh' },
  { code: 'PH', label: 'Philippines', symbol: '\u20B1' },
];

const TIER_ORDER = ['free', 'growth', 'professional', 'enterprise'];

const FALLBACK_PLANS: Plan[] = [
  { plan_tier: 'free', name: 'Starter', description: 'Perfect for trying MediHost', monthly_price: 0, yearly_price: 0, currency: 'INR', features: [] },
  { plan_tier: 'growth', name: 'Growth', description: 'For growing clinics', monthly_price: 99900, yearly_price: 999900, currency: 'INR', features: [] },
  { plan_tier: 'professional', name: 'Professional', description: 'Full-featured clinic software', monthly_price: 249900, yearly_price: 2499900, currency: 'INR', features: [] },
  { plan_tier: 'enterprise', name: 'Enterprise', description: 'For hospitals & chains', monthly_price: 499900, yearly_price: 4999900, currency: 'INR', features: [] },
];

const FAQS = [
  { q: 'How long is the free trial?', a: '14 days with full access to all features. No credit card required to start.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes! Upgrades take effect immediately with prorated billing. Downgrades apply at the end of your current billing period.' },
  { q: 'What happens when my trial ends?', a: 'Your account is automatically moved to the Starter (free) plan. No data is lost \u2014 upgrade anytime to restore premium features.' },
  { q: 'Do you offer refunds?', a: 'Yes, we offer a full refund within 7 days of payment if you\u2019re not satisfied. No questions asked.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted at rest and in transit. Our infrastructure is HIPAA-ready with regular security audits.' },
];

// ── Helpers ────────────────────────────────────────────────

function displayPrice(paise: number, symbol: string): string {
  if (paise === 0) return 'Free';
  return symbol + (paise / 100).toLocaleString('en-IN');
}

function isBoolean(val: string): boolean {
  return val === 'true' || val === 'false';
}

function featureDisplay(val: string): string {
  if (val === 'true') return '\u2713';
  if (val === 'false') return '\u2717';
  if (val === '-1' || val === 'unlimited' || val === 'Unlimited') return 'Unlimited';
  return val;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Page Component ─────────────────────────────────────────

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);
  const [country, setCountry] = useState('IN');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedCountry = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  const loadPlans = useCallback(async (cc: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscription/plans?country_code=${cc}`);
      const data = await res.json();
      if (data.plans && data.plans.length > 0) {
        // Sort by tier order
        const sorted = [...data.plans].sort((a: Plan, b: Plan) =>
          TIER_ORDER.indexOf(a.plan_tier) - TIER_ORDER.indexOf(b.plan_tier)
        );
        setPlans(sorted);
      } else {
        setPlans(FALLBACK_PLANS);
      }
    } catch {
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(country); }, [country, loadPlans]);

  // Collect all feature keys for comparison table
  const allFeatureKeys: { key: string; description: string }[] = [];
  const keySet = new Set<string>();
  for (const plan of plans) {
    for (const f of plan.features) {
      if (!keySet.has(f.feature_key)) {
        keySet.add(f.feature_key);
        allFeatureKeys.push({ key: f.feature_key, description: f.description || f.feature_key.replace(/_/g, ' ') });
      }
    }
  }

  function getFeatureValue(planTier: string, featureKey: string): string {
    const plan = plans.find(p => p.plan_tier === planTier);
    const feat = plan?.features.find(f => f.feature_key === featureKey);
    return feat?.feature_value ?? 'false';
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              MediHost<span className="text-[10px] align-super font-bold text-gray-400">&trade;</span> AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-bold text-white rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-8 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Start free. Scale as you grow. No hidden fees.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${yearly ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-semibold ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
          {yearly && (
            <span className="ml-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
              Save ~17%
            </span>
          )}
        </div>

        {/* Country Selector */}
        <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => setCountry(c.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                country === c.code
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Plan Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[480px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map(plan => {
              const isPopular = plan.plan_tier === 'professional';
              const isFree = plan.plan_tier === 'free' || (plan.monthly_price === 0 && plan.yearly_price === 0);
              const price = yearly ? plan.yearly_price : plan.monthly_price;
              const period = yearly ? '/yr' : '/mo';

              return (
                <div
                  key={plan.plan_tier}
                  className={`relative bg-white rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isPopular
                      ? 'border-2 shadow-lg'
                      : 'border border-gray-200 shadow-sm hover:border-gray-300'
                  }`}
                  style={isPopular ? { borderColor: '#534AB7' } : {}}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-bold rounded-full"
                      style={{ backgroundColor: '#534AB7' }}
                    >
                      Most popular
                    </div>
                  )}

                  {/* Plan Name */}
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{plan.name}</div>
                  <p className="text-xs text-gray-400 mt-1 min-h-[32px]">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-4 mb-6">
                    {isFree ? (
                      <div className="text-4xl font-extrabold text-gray-900">Free</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {displayPrice(price, selectedCountry.symbol)}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">{period}</span>
                      </div>
                    )}
                    {!isFree && yearly && plan.monthly_price > 0 && (
                      <div className="text-xs text-gray-400 mt-1 line-through">
                        {displayPrice(plan.monthly_price * 12, selectedCountry.symbol)}/yr
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/signup?plan=${plan.plan_tier}`}
                    className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                      isPopular
                        ? 'text-white hover:opacity-90 hover:shadow-lg'
                        : isFree
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    style={isPopular ? { backgroundColor: '#534AB7' } : {}}
                  >
                    {isFree ? 'Get started free' : 'Start 14-day trial'}
                  </Link>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 flex-1">
                    {plan.features.slice(0, 12).map(f => {
                      const isBool = isBoolean(f.feature_value);
                      const isTrue = f.feature_value === 'true';
                      return (
                        <div key={f.feature_key} className="flex items-start gap-2.5">
                          {isBool ? (
                            isTrue ? (
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                            )
                          ) : (
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <span className={`text-sm ${isBool && !isTrue ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isBool
                              ? (f.description || f.feature_key.replace(/_/g, ' '))
                              : `${featureDisplay(f.feature_value)} ${(f.description || f.feature_key.replace(/_/g, ' ')).toLowerCase()}`
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Feature Comparison Table */}
      {allFeatureKeys.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare all features</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-5 font-semibold text-gray-600 min-w-[200px]">Feature</th>
                    {plans.map(p => (
                      <th key={p.plan_tier} className="text-center py-4 px-4 font-semibold text-gray-600 min-w-[120px]">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatureKeys.map((feat, i) => (
                    <tr key={feat.key} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-3 px-5 text-gray-700 font-medium capitalize">
                        {feat.description || feat.key.replace(/_/g, ' ')}
                      </td>
                      {plans.map(p => {
                        const val = getFeatureValue(p.plan_tier, feat.key);
                        const isBool = isBoolean(val);
                        return (
                          <td key={p.plan_tier} className="py-3 px-4 text-center">
                            {isBool ? (
                              val === 'true' ? (
                                <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-gray-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm font-medium text-gray-700">{featureDisplay(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to digitize your clinic?
            </h2>
            <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
              Join hundreds of doctors who run their practice with MediHost. Start free, upgrade anytime.
            </p>
            <Link
              href="/signup"
              className="inline-flex mt-6 px-8 py-3.5 text-sm font-bold text-white rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} MediHost&trade; AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
