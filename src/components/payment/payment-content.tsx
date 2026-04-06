'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { getTokenFromClient } from '@/lib/auth';

const PLAN_DETAILS: Record<string, { name: string; amount: number; gst: number; total: number }> = {
  starter:      { name: 'Starter',      amount: 0,      gst: 0,    total: 0      },
  growth:       { name: 'Growth',       amount: 99900,  gst: 17982, total: 117882 },
  professional: { name: 'Professional', amount: 249900, gst: 44982, total: 294882 },
  enterprise:   { name: 'Enterprise',   amount: 499900, gst: 89982, total: 589882 },
};

function paise(n: number) {
  return '₹' + (n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// Razorpay type declared in domain-manager.tsx global scope

export function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'growth';
  const domain = searchParams.get('domain') || '';

  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.growth;

  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [rzpOrderId, setRzpOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Progress steps
  const steps = ['Signup', 'Plan', 'Payment', 'Done'];

  async function loadRazorpay(): Promise<void> {
    if (window.Razorpay) return;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(s);
    });
  }

  async function createOrder() {
    setLoading(true);
    setError('');
    setStatusMsg('');
    try {
      // Read token directly — getTokenFromClient can fail during SSR
      let token = '';
      try {
        const cookieMatch = document.cookie.split('; ').find(r => r.startsWith('mh_auth='));
        if (cookieMatch) {
          const parsed = JSON.parse(decodeURIComponent(cookieMatch.split('=')[1]));
          token = parsed.token || '';
        }
        if (!token) {
          token = localStorage.getItem('mh_token') || '';
        }
      } catch { /* silent */ }
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await apiPost('/api/payment-orders/create', { plan_id: planId, domain_requested: domain }, token);

      setOrderRef(data.order.order_ref);
      setOrderId(String(data.order.id));
      setRzpOrderId(data.order.razorpay_order_id);

      // Free plan — skip Razorpay
      if (plan.total === 0) {
        router.push(`/welcome?order=${data.order.order_ref}&plan=${planId}&domain=${domain}`);
        return;
      }

      await loadRazorpay();
      openRazorpay(data.order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function openRazorpay(order: { id: string; order_ref: string; razorpay_order_id: string; total_paise: number }) {
    const token = getTokenFromClient();
    const options: Record<string, unknown> = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.total_paise,
      currency: 'INR',
      name: 'MediHost™',
      description: `${planId} plan · ${domain || 'medihost.in'}`,
      order_id: order.razorpay_order_id,
      theme: { color: '#10b981' },
      handler: async (response: Record<string, string>) => {
        setStatusMsg('Verifying payment…');
        try {
          await apiPost('/api/payment-orders/verify', {
            order_id: order.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }, token);
          router.push(`/welcome?order=${order.order_ref}&plan=${planId}&domain=${domain}`);
        } catch {
          setError(`Payment received but verification failed. Your order ${order.order_ref} is saved — contact support with this ID.`);
          setStatusMsg('');
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await apiPost('/api/payment-orders/mark-failed', { order_id: order.id, reason: 'user_dismissed' }, token);
          } catch { /* silent */ }
          setError(`Payment cancelled. Order ${order.order_ref} is saved — retry below anytime.`);
          setStatusMsg('');
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async (response: Record<string, Record<string, string>>) => {
      try {
        await apiPost('/api/payment-orders/mark-failed', {
          order_id: order.id,
          reason: response.error?.description || 'payment_failed',
        }, token);
      } catch { /* silent */ }
      setError(`Payment failed: ${response.error?.description || 'Unknown error'}. Order ${order.order_ref} saved — retry below.`);
      setStatusMsg('');
      setLoading(false);
    });

    rzp.open();
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
              ${i < 2 ? 'bg-emerald-500 text-white' :
                i === 2 ? 'bg-emerald-500 text-white' :
                'bg-white/10 text-slate-500'}`}>
              {i < 2 ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i <= 2 ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
            {i < 3 && <div className={`flex-1 h-px ${i < 2 ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-extrabold text-white mb-1 text-center">Complete payment</h2>
      <p className="text-sm text-slate-400 text-center mb-6">Your order is saved before payment opens</p>

      {/* Order ref — shown once created */}
      {orderRef && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
          <span className="text-emerald-400 text-sm">✓</span>
          <div>
            <div className="text-sm font-bold text-emerald-300">Order {orderRef} saved</div>
            <div className="text-xs text-emerald-400/60">Your slot is held — safe to proceed</div>
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="border border-white/10 rounded-2xl overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-slate-300">{plan.name} plan</span>
          <span className="text-sm font-bold text-white">{paise(plan.amount)}<span className="text-xs text-slate-500">/mo</span></span>
        </div>
        {domain && (
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm text-slate-400">Domain: {domain}</span>
            <span className="text-xs text-emerald-400 font-bold">Free</span>
          </div>
        )}
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-slate-400">GST (18%)</span>
          <span className="text-sm text-slate-300">{paise(plan.gst)}</span>
        </div>
        <div className="px-4 py-3 bg-white/5 flex justify-between items-center">
          <span className="text-sm font-bold text-white">Total due today</span>
          <span className="text-lg font-extrabold text-white">{plan.total === 0 ? 'Free' : paise(plan.total)}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 leading-relaxed">
          {error}
          {(orderId) && (
            <button
              onClick={() => { setError(''); createOrder(); }}
              className="block mt-2 text-xs text-emerald-400 underline"
            >
              Retry payment →
            </button>
          )}
        </div>
      )}

      {/* Status */}
      {statusMsg && (
        <div className="text-sm text-slate-300 text-center mb-4 animate-pulse">{statusMsg}</div>
      )}

      {/* Pay button */}
      <button
        onClick={createOrder}
        disabled={loading || !!statusMsg}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Preparing order…' :
         statusMsg ? statusMsg :
         plan.total === 0 ? 'Activate free plan →' :
         `Pay ${paise(plan.total)} securely →`}
      </button>

      <p className="text-center text-xs text-slate-600 mt-3">
        🔒 256-bit SSL · Razorpay certified · GST invoice auto-generated
      </p>

      <p className="text-center text-xs text-slate-500 mt-2">
        Money deducted but issue? Call us — order ID is your proof.
      </p>
    </div>
  );
}
