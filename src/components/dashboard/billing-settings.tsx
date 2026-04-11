"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface Subscription {
  plan_tier: string;
  status: string;
  billing_cycle: string;
  trial_ends_at: number | null;
  current_period_start: number | null;
  current_period_end: number | null;
  downgrade_to: string | null;
}

interface PlanOption {
  plan_tier: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  features: { feature_key: string; feature_value: string; description: string }[];
}

interface PaymentRecord {
  id: string;
  plan_tier: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id: string;
  created_at: number;
  invoice_number: string;
}

interface CouponResult {
  valid: boolean;
  discount_type: string;
  discount_value: number;
  final_price: number;
  error?: string;
}

// ── Constants ──────────────────────────────────────────────

const TIER_ORDER = ['free', 'starter', 'growth', 'professional', 'enterprise'];
const TIER_LABELS: Record<string, string> = { free: 'Starter', starter: 'Starter', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise' };
const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free: { bg: '#ECFDF5', text: '#059669', border: '#059669' },
  starter: { bg: '#ECFDF5', text: '#059669', border: '#059669' },
  growth: { bg: '#EFF6FF', text: '#2563EB', border: '#2563EB' },
  professional: { bg: '#EDE9FE', text: '#7C3AED', border: '#7C3AED' },
  enterprise: { bg: '#FEF3C7', text: '#D97706', border: '#D97706' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#ECFDF5', text: '#059669', label: 'Active' },
  trialing: { bg: '#FEF3C7', text: '#92400E', label: 'Trial' },
  trial: { bg: '#FEF3C7', text: '#92400E', label: 'Trial' },
  past_due: { bg: '#FEF3C7', text: '#D97706', label: 'Past Due' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
  canceled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
  expired: { bg: '#FEE2E2', text: '#DC2626', label: 'Expired' },
};

const PAYMENT_STATUS: Record<string, string> = {
  captured: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-amber-50 text-amber-700',
  pending: 'bg-blue-50 text-blue-700',
  created: 'bg-blue-50 text-blue-700',
};

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function jsonHeaders(): Record<string, string> {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function inr(paise: number): string {
  if (paise === 0) return 'Free';
  return '\u20B9' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(ts: number | null): string {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(ts: number | null): number {
  if (!ts) return -1;
  return Math.ceil((ts - Date.now()) / (24 * 60 * 60 * 1000));
}

function tierIndex(tier: string): number {
  const idx = TIER_ORDER.indexOf(tier);
  return idx >= 0 ? idx : 0;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function BillingSettings({ user }: { user: AuthUser | null }) {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponTarget, setCouponTarget] = useState('');

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState('');

  // Cancel
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const currentTier = sub?.plan_tier || user?.plan_tier || 'starter';
  const currentIdx = tierIndex(currentTier);

  // ── Load subscription ────────────────────────────────────

  const loadSub = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/current', { headers: authHeaders() });
      const data = await res.json();
      if (data.subscription) {
        setSub(data.subscription);
        if (data.subscription.billing_cycle) setCycle(data.subscription.billing_cycle);
      }
    } catch { /* graceful — default to starter */ }
    finally { setSubLoading(false); }
  }, []);

  // ── Load plans ───────────────────────────────────────────

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/plans?country_code=IN', { headers: authHeaders() });
      const data = await res.json();
      if (data.plans) {
        const sorted = [...data.plans].sort((a: PlanOption, b: PlanOption) =>
          tierIndex(a.plan_tier) - tierIndex(b.plan_tier)
        );
        setPlans(sorted);
      }
    } catch { /* graceful */ }
    finally { setPlansLoading(false); }
  }, []);

  // ── Load payments ────────────────────────────────────────

  const loadPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/payments', { headers: authHeaders() });
      const data = await res.json();
      if (data.payments) setPayments(data.payments);
    } catch { /* graceful */ }
    finally { setPaymentsLoading(false); }
  }, []);

  useEffect(() => { loadSub(); loadPlans(); loadPayments(); }, [loadSub, loadPlans, loadPayments]);

  // ── Validate coupon ──────────────────────────────────────

  async function validateCoupon(planTier: string) {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponTarget(planTier);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ code: couponCode.toUpperCase(), plan_tier: planTier, billing_cycle: cycle }),
      });
      const data = await res.json();
      setCouponResult(data);
      if (!data.valid) showToast(data.error || 'Invalid coupon');
    } catch {
      showToast('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  // ── Razorpay checkout ────────────────────────────────────

  async function startCheckout(planTier: string) {
    setCheckoutLoading(planTier);
    try {
      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          plan_tier: planTier,
          billing_cycle: cycle,
          coupon_code: couponResult?.valid && couponTarget === planTier ? couponCode : undefined,
        }),
      });
      const data = await res.json();

      if (!data.order_id) {
        showToast(data.error || 'Payment system coming soon');
        return;
      }

      // Load Razorpay script
      await loadRazorpayScript();

      const options = {
        key: data.key || 'rzp_live_SYv4bpGGvljs1k',
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.order_id,
        name: 'MediHost',
        description: `${TIER_LABELS[planTier] || planTier} Plan - ${cycle}`,
        prefill: { email: user?.email || '' },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          // Verify payment
          try {
            await fetch('/api/subscription/verify-payment', {
              method: 'POST',
              headers: jsonHeaders(),
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
          } catch { /* best effort */ }
          showToast('Payment successful! Your plan has been upgraded.');
          loadSub();
          loadPayments();
        },
        theme: { color: '#059669' },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch {
      showToast('Payment system coming soon');
    } finally {
      setCheckoutLoading('');
    }
  }

  // ── Change plan (upgrade/downgrade) ──────────────────────

  async function changePlan(newTier: string) {
    const isUpgrade = tierIndex(newTier) > currentIdx;
    if (isUpgrade) {
      // Upgrades go through checkout
      startCheckout(newTier);
      return;
    }

    // Downgrade
    setCheckoutLoading(newTier);
    try {
      const res = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ new_plan_tier: newTier, billing_cycle: cycle }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        showToast(data.message || 'Plan will change at end of billing period');
        loadSub();
      } else {
        showToast(data.error || 'Failed to change plan');
      }
    } catch {
      showToast('Network error');
    } finally {
      setCheckoutLoading('');
    }
  }

  // ── Cancel subscription ──────────────────────────────────

  async function cancelSubscription() {
    setCancelling(true);
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: jsonHeaders(),
      });
      const data = await res.json();
      if (data.message || data.success) {
        showToast(data.message || 'Subscription cancelled. Active until period end.');
        setShowCancel(false);
        loadSub();
      } else {
        showToast(data.error || 'Failed to cancel');
      }
    } catch {
      showToast('Network error');
    } finally {
      setCancelling(false);
    }
  }

  // ── Derived state ────────────────────────────────────────

  const status = sub?.status || (currentTier === 'starter' || currentTier === 'free' ? 'active' : 'trialing');
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;
  const tierColor = TIER_COLORS[currentTier] || TIER_COLORS.starter;
  const isTrial = status === 'trialing' || status === 'trial';
  const isCancelled = status === 'cancelled' || status === 'canceled';
  const trialDays = daysUntil(sub?.trial_ends_at ?? user?.trial_ends_at ?? null);
  const isFree = currentTier === 'free' || currentTier === 'starter';

  return (
    <div style={{ maxWidth: 900 }} className="space-y-6 mx-auto">
      <h2 className="text-xl font-bold text-gray-900">Plan & Billing</h2>

      {/* ── Section 1: Current Plan Card ── */}
      {subLoading ? (
        <Skeleton className="h-36 rounded-xl" />
      ) : (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: `2px solid ${tierColor.border}` }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-gray-900">{TIER_LABELS[currentTier] || currentTier} Plan</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: tierColor.bg, color: tierColor.text }}>
                  {TIER_LABELS[currentTier]}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                  {statusStyle.label}
                </span>
              </div>

              {isTrial && trialDays > 0 && (
                <p className="text-sm mt-2" style={{ color: '#92400E' }}>
                  Your trial ends in <strong>{trialDays} day{trialDays !== 1 ? 's' : ''}</strong>. Upgrade to keep full access.
                </p>
              )}
              {isTrial && trialDays <= 0 && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Your trial has ended. Upgrade now to restore features.
                </p>
              )}
              {isCancelled && sub?.current_period_end && (
                <p className="text-sm text-gray-600 mt-2">
                  Your plan ends on <strong>{formatDate(sub.current_period_end)}</strong>. You can reactivate anytime.
                </p>
              )}

              {!isFree && (
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Billing: <strong className="text-gray-700 capitalize">{sub?.billing_cycle || cycle}</strong></span>
                  {sub?.current_period_end && <span>Next billing: <strong className="text-gray-700">{formatDate(sub.current_period_end)}</strong></span>}
                </div>
              )}
            </div>

            {(isTrial || isFree) && (
              <a href="#plans" className="px-4 py-2 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#059669' }}>
                Upgrade Plan
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Section 2: Available Plans ── */}
      <div id="plans">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Available Plans</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${cycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-10 h-5 rounded-full transition-colors ${cycle === 'yearly' ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${cycle === 'yearly' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-xs font-semibold ${cycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
            {cycle === 'yearly' && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Save ~17%</span>}
          </div>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map(plan => {
              const idx = tierIndex(plan.plan_tier);
              const isCurrent = plan.plan_tier === currentTier;
              const isUpgrade = idx > currentIdx;
              const isDowngrade = idx < currentIdx;
              const price = cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
              const period = cycle === 'yearly' ? '/yr' : '/mo';
              const isPopular = plan.plan_tier === 'professional';
              const pc = TIER_COLORS[plan.plan_tier] || TIER_COLORS.starter;

              // Coupon applied?
              const hasCoupon = couponResult?.valid && couponTarget === plan.plan_tier;

              return (
                <div
                  key={plan.plan_tier}
                  className={`bg-white rounded-xl p-4 transition-all relative ${
                    isCurrent ? 'ring-2' : 'border border-gray-200 hover:border-gray-300'
                  }`}
                  style={isCurrent ? { borderColor: pc.border } : {}}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-white text-[10px] font-bold rounded-full" style={{ backgroundColor: '#7C3AED' }}>
                      Popular
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-white text-[10px] font-bold rounded-full" style={{ backgroundColor: pc.text }}>
                      Current plan
                    </div>
                  )}

                  <div className="text-sm font-bold text-gray-900 mt-1">{plan.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 min-h-[16px]">{plan.description}</div>

                  <div className="mt-3">
                    {hasCoupon ? (
                      <div>
                        <span className="text-lg font-bold text-gray-300 line-through">{inr(price)}</span>
                        <span className="text-xl font-extrabold text-emerald-600 ml-1.5">{inr(couponResult!.final_price)}</span>
                        <span className="text-xs text-gray-400">{period}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-extrabold text-gray-900">{inr(price)}</span>
                        {price > 0 && <span className="text-xs text-gray-400">{period}</span>}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    {isCurrent ? (
                      <div className="text-center text-xs font-semibold text-gray-400 py-2">Current plan</div>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => changePlan(plan.plan_tier)}
                        disabled={checkoutLoading === plan.plan_tier}
                        className="w-full py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#059669' }}
                      >
                        {checkoutLoading === plan.plan_tier ? 'Processing...' : 'Upgrade'}
                      </button>
                    ) : isDowngrade ? (
                      <button
                        onClick={() => changePlan(plan.plan_tier)}
                        disabled={checkoutLoading === plan.plan_tier}
                        className="w-full py-2 rounded-lg text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        title="Takes effect at end of billing period"
                      >
                        {checkoutLoading === plan.plan_tier ? 'Processing...' : 'Downgrade'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Coupon Input */}
        {!isFree && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                const target = plans.find(p => tierIndex(p.plan_tier) > currentIdx)?.plan_tier || 'growth';
                validateCoupon(target);
              }}
              disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {couponLoading ? 'Checking...' : 'Apply'}
            </button>
            {couponResult?.valid && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {couponResult.discount_type === 'percentage' ? couponResult.discount_value + '% off' : 'Discount applied'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Section 3: Payment History ── */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Payment History</h3>
        {paymentsLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : payments.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                      <td className="py-3 px-4 text-gray-700 capitalize">{TIER_LABELS[p.plan_tier] || p.plan_tier}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{inr(p.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-xs">{p.invoice_number || p.razorpay_payment_id || '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">
              No payments yet. {isFree ? 'You are on the free plan.' : 'Your trial is active.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Section 4: Cancel Subscription (Danger Zone) ── */}
      {!isFree && status !== 'cancelled' && status !== 'canceled' && (
        <div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
          <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
          {!showCancel ? (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-red-600/80">Cancel your subscription. Your data will not be deleted.</p>
              <button
                onClick={() => setShowCancel(true)}
                className="px-4 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-red-700">
                Your plan stays active until <strong>{formatDate(sub?.current_period_end ?? null)}</strong>.
                After that you&apos;ll be on Starter (free). No data is lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={cancelSubscription}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, cancel my subscription'}
                </button>
                <button
                  onClick={() => setShowCancel(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Keep my plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Razorpay script loader ─────────────────────────────────

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed'));
    document.body.appendChild(script);
  });
}
