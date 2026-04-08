'use client';

import { useState, useEffect } from 'react';
import type { AuthUser } from '@/lib/auth';

interface Plan {
  plan_tier: string;
  plan_name: string;
  monthly_price: number;
  yearly_price: number;
  trial_days: number;
  is_popular: boolean;
  tagline: string;
  cta_text: string;
  features: { name: string; included: boolean }[];
}

function fmt(n: number): string { return n.toLocaleString('en-IN'); }

export function PlanBilling({ user }: { user: AuthUser | null }) {
  var [plans, setPlans] = useState<Plan[]>([]);
  var [loading, setLoading] = useState(true);
  var currentTier = user?.plan_tier || 'starter';

  useEffect(() => {
    fetch('/api/proxy/api/presence/pricing/plans')
      .then(r => r.json())
      .then(d => { if (d.success && d.plans) setPlans(d.plans); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  var currentPlan = plans.find(p => p.plan_tier === currentTier) || null;
  var includedFeatures = currentPlan?.features?.filter(f => f.included) || [];

  return (
    <div style={{ maxWidth: 800 }} className="space-y-6">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Plan & Billing</h2>

      {/* Section 1: Current plan */}
      <div className="bg-white rounded-xl p-5" style={{ border: '1.5px solid #0F6E56' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{currentPlan?.plan_name || currentTier}</span>
              <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>
                {currentTier === 'starter' ? 'Free' : 'Active'}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#0F6E56', marginTop: 4 }}>
              {currentPlan ? (currentPlan.monthly_price === 0 ? 'Free' : 'Rs.' + fmt(currentPlan.monthly_price) + '/month') : '—'}
            </div>
            {includedFeatures.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {includedFeatures.map((f, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.7 }}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {currentTier === 'starter' && (
              <a href="/plans" className="text-xs font-medium text-white rounded-md px-3 py-1.5" style={{ backgroundColor: '#0F6E56' }}>
                Upgrade plan
              </a>
            )}
            <a href="/plans" className="text-xs font-medium border rounded-md px-3 py-1.5" style={{ borderColor: '#D4D4D2', color: '#5F5E5A' }}>
              Change plan
            </a>
          </div>
        </div>
      </div>

      {/* Section 2: Compare plans */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>Compare plans</h3>
        {loading ? (
          <p style={{ fontSize: 11, color: '#A1A09E' }}>Loading plans...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {plans.map(plan => {
              var isCurrent = plan.plan_tier === currentTier;
              return (
                <div key={plan.plan_tier} className="bg-white rounded-xl p-4" style={{ border: isCurrent ? '1.5px solid #0F6E56' : '1px solid #E5E5E3' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{plan.plan_name}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: isCurrent ? '#0F6E56' : '#1A1A1A', marginTop: 2 }}>
                    {plan.monthly_price === 0 ? 'FREE' : 'Rs.' + fmt(plan.monthly_price)}
                  </div>
                  <div style={{ fontSize: 10, color: '#A1A09E', marginTop: 2 }}>{plan.tagline || ''}</div>
                  {(plan.plan_tier === 'growth' || plan.plan_tier === 'professional') && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 8, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 5px', borderRadius: 4, marginRight: 4 }}>FREE .in domain</span>
                  )}
                  {plan.plan_tier === 'enterprise' && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 8, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 5px', borderRadius: 4, marginRight: 4 }}>FREE .in or .com domain</span>
                  )}
                  {plan.is_popular && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 8, fontWeight: 600, backgroundColor: '#E6F1FB', color: '#185FA5', padding: '2px 5px', borderRadius: 4, marginRight: 4 }}>Popular</span>
                  )}
                  {isCurrent && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 8, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 5px', borderRadius: 4 }}>Current</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TODO: Backend cron job for trial expiry emails (5d, 3d, 1d, expired) via Resend */}
      {/* Phase 5.8: Exit intent, return visitor, pricing hesitation triggers — admin controls in Phase 6 */}

      {/* Section 3: Payment history */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>Payment history</h3>
        <div style={{ backgroundColor: '#F6F6F4', border: '0.5px solid #E5E5E3', borderRadius: 8, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#A1A09E' }}>No payments yet. {currentTier === 'starter' ? 'You are on the free plan.' : 'Your trial is active.'}</p>
        </div>
      </div>
    </div>
  );
}
