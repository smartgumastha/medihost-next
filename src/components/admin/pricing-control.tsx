// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
"use client";

import { useState } from 'react';

interface PlanFeature {
  name: string;
  enabled: boolean;
}

interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays: number;
  cta: string;
  popular: boolean;
  active: boolean;
  features: PlanFeature[];
}

const FEATURE_LIST = [
  'Custom Domain',
  'Website Builder',
  'LIS (Lab Info System)',
  'Pharmacy Module',
  'Marketing Tools',
  'Advanced Analytics',
  'API Access',
  'Priority Support',
  'White Label',
  'Multi-branch',
];

const INITIAL_PLANS: Plan[] = [
  {
    id: 1, name: 'Starter', monthlyPrice: 999, yearlyPrice: 9990, trialDays: 14, cta: 'Start Free Trial', popular: false, active: true,
    features: FEATURE_LIST.map((f, i) => ({ name: f, enabled: i < 3 })),
  },
  {
    id: 2, name: 'Professional', monthlyPrice: 2499, yearlyPrice: 24990, trialDays: 14, cta: 'Get Started', popular: true, active: true,
    features: FEATURE_LIST.map((f, i) => ({ name: f, enabled: i < 6 })),
  },
  {
    id: 3, name: 'Business', monthlyPrice: 4999, yearlyPrice: 49990, trialDays: 7, cta: 'Contact Sales', popular: false, active: true,
    features: FEATURE_LIST.map((f, i) => ({ name: f, enabled: i < 8 })),
  },
  {
    id: 4, name: 'Enterprise', monthlyPrice: 9999, yearlyPrice: 99990, trialDays: 30, cta: 'Talk to Us', popular: false, active: true,
    features: FEATURE_LIST.map(() => ({ name: '', enabled: true })).map((_, i) => ({ name: FEATURE_LIST[i], enabled: true })),
  },
];

export function PricingControl() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function updatePlan(id: number, updates: Partial<Plan>) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  function toggleFeature(planId: number, featureIdx: number) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const features = [...p.features];
      features[featureIdx] = { ...features[featureIdx], enabled: !features[featureIdx].enabled };
      return { ...p, features };
    }));
  }

  function savePlan(plan: Plan) {
    showToast(`${plan.name} plan saved successfully`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing Control</h1>
        <p className="text-sm text-gray-500 mt-1">Manage subscription plans and features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white border rounded-xl p-5 space-y-4 relative ${plan.popular ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full">Popular</div>
            )}
            <div className="text-lg font-bold text-gray-900">{plan.name}</div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Price (INR)</label>
                <input
                  type="number"
                  value={plan.monthlyPrice}
                  onChange={e => updatePlan(plan.id, { monthlyPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Yearly Price (INR)</label>
                <input
                  type="number"
                  value={plan.yearlyPrice}
                  onChange={e => updatePlan(plan.id, { yearlyPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trial Days</label>
                <input
                  type="number"
                  value={plan.trialDays}
                  onChange={e => updatePlan(plan.id, { trialDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={plan.cta}
                  onChange={e => updatePlan(plan.id, { cta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Features</div>
              {plan.features.map((feat, fi) => (
                <label key={fi} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feat.enabled}
                    onChange={() => toggleFeature(plan.id, fi)}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className={feat.enabled ? 'text-gray-900' : 'text-gray-400'}>{feat.name}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.popular}
                  onChange={() => updatePlan(plan.id, { popular: !plan.popular })}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-gray-600 text-xs font-medium">Popular</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.active}
                  onChange={() => updatePlan(plan.id, { active: !plan.active })}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-gray-600 text-xs font-medium">Active</span>
              </label>
            </div>

            <button
              onClick={() => savePlan(plan)}
              className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
            >
              Save {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
