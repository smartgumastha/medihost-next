"use client";

import { useState, useEffect } from 'react';
import { getTokenFromClient } from '@/lib/auth';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  plan_tier: string;
  plan_name: string;
  monthly_price: number;
  yearly_price: number;
  trial_days: number;
  cta_text: string;
  tagline: string;
  is_popular: boolean;
  is_active: boolean;
  features: PlanFeature[];
  modules_included: string[];
}

export function PricingControl() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      try {
        var token = getTokenFromClient();
        var res = await fetch('/api/admin/pricing', {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        });
        var data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
        }
      } catch {
        showToast('Failed to load plans');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updatePlan(tier: string, updates: Partial<Plan>) {
    setPlans(prev => prev.map(p => p.plan_tier === tier ? { ...p, ...updates } : p));
  }

  async function savePlan(plan: Plan) {
    setSaving(plan.plan_tier);
    try {
      var token = getTokenFromClient();
      var res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          plan_tier: plan.plan_tier,
          plan_name: plan.plan_name,
          monthly_price: plan.monthly_price,
          yearly_price: plan.yearly_price,
          trial_days: plan.trial_days,
          cta_text: plan.cta_text,
          tagline: plan.tagline,
          is_popular: plan.is_popular,
          is_active: plan.is_active,
          features: plan.features,
        }),
      });
      var data = await res.json();
      if (data.success) {
        showToast(plan.plan_name + ' saved');
      } else {
        showToast('Error: ' + (data.error || 'Save failed'));
      }
    } catch {
      showToast('Network error saving plan');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Control</h1>
          <p className="text-sm text-gray-500 mt-1">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing Control</h1>
        <p className="text-sm text-gray-500 mt-1">Manage subscription plans — {plans.length} plans loaded from database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.plan_tier} className={`bg-white border rounded-xl p-5 space-y-4 relative ${plan.is_popular ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'} ${!plan.is_active ? 'opacity-60' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">Popular</div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">{plan.plan_name}</div>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${plan.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">{plan.plan_tier}</div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Price (INR)</label>
                <input
                  type="number"
                  value={plan.monthly_price}
                  onChange={e => updatePlan(plan.plan_tier, { monthly_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Yearly Price (INR)</label>
                <input
                  type="number"
                  value={plan.yearly_price}
                  onChange={e => updatePlan(plan.plan_tier, { yearly_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trial Days</label>
                <input
                  type="number"
                  value={plan.trial_days}
                  onChange={e => updatePlan(plan.plan_tier, { trial_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tagline</label>
                <input
                  type="text"
                  value={plan.tagline || ''}
                  onChange={e => updatePlan(plan.plan_tier, { tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={plan.cta_text || ''}
                  onChange={e => updatePlan(plan.plan_tier, { cta_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Features */}
            {Array.isArray(plan.features) && plan.features.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-500 uppercase">Features</div>
                {plan.features.map((feat, fi) => (
                  <div key={fi} className="flex items-center gap-2 text-xs">
                    <span className={feat.included ? 'text-emerald-600' : 'text-gray-400'}>{feat.included ? '✓' : '✗'}</span>
                    <span className={feat.included ? 'text-gray-700' : 'text-gray-400'}>{feat.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.is_popular}
                  onChange={() => updatePlan(plan.plan_tier, { is_popular: !plan.is_popular })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-600 text-xs font-medium">Popular</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.is_active}
                  onChange={() => updatePlan(plan.plan_tier, { is_active: !plan.is_active })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-600 text-xs font-medium">Active</span>
              </label>
            </div>

            <button
              onClick={() => savePlan(plan)}
              disabled={saving === plan.plan_tier}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {saving === plan.plan_tier ? 'Saving...' : 'Save ' + plan.plan_name}
            </button>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">No plans found in database</div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
