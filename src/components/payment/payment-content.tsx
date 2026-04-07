'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

var PLAN_NAMES: Record<string, string> = {
  starter: 'Starter', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise',
  'domain-only': 'Domain Only',
};

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export function PaymentContent() {
  var router = useRouter();
  var searchParams = useSearchParams();
  var planId = searchParams.get('plan') || 'growth';
  var domain = searchParams.get('domain') || '';
  var intent = searchParams.get('intent') || 'website';
  var billingParam = searchParams.get('billing') || 'monthly';

  var baseAmount = parseInt(searchParams.get('amount') || '0', 10);
  var gst = Math.round(baseAmount * 0.18);
  var total = baseAmount + gst;
  var planName = PLAN_NAMES[planId] || 'Growth';

  var [orderRef, setOrderRef] = useState<string | null>(null);
  var [orderId, setOrderId] = useState<string | null>(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [statusMsg, setStatusMsg] = useState('');

  // Set mh_redirect cookie so login returns here
  useEffect(function () {
    if (typeof window !== 'undefined') {
      document.cookie = 'mh_redirect=' + encodeURIComponent(window.location.pathname + window.location.search) + '; path=/; max-age=3600; samesite=lax';
    }
  }, []);

  // Redirect free plans with no domain
  useEffect(function () {
    if (baseAmount === 0 && !domain) {
      router.push('/dashboard?intent=' + intent);
    }
  }, [baseAmount, domain, intent, router]);

  // Load Razorpay SDK
  function loadRazorpay(): Promise<void> {
    if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Razorpay SDK failed to load')); };
      document.head.appendChild(s);
    });
  }

  var steps = ['Signup', 'Plan', 'Payment', 'Done'];

  async function createOrder() {
    setLoading(true);
    setError('');
    setStatusMsg('');
    try {
      var res = await fetch('/api/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, domain_requested: domain, signup_intent: intent, amount: baseAmount }),
      });
      var data = await res.json();

      if (res.status === 401) {
        // Not authenticated — redirect to login, mh_redirect cookie will bring them back
        router.push('/login?intent=' + encodeURIComponent(intent) + '&domain=' + encodeURIComponent(domain));
        return;
      }

      if (!data.success || !data.order) {
        setError(data.error || 'Could not create order. Please try again.');
        return;
      }

      setOrderRef(data.order.order_ref);
      setOrderId(String(data.order.id));

      // Free plan — skip Razorpay
      if (total === 0) {
        router.push('/welcome?order=' + data.order.order_ref + '&plan=' + planId + '&domain=' + encodeURIComponent(domain) + '&intent=' + intent);
        return;
      }

      // Load Razorpay SDK + get key
      await loadRazorpay();
      var configRes = await fetch('/api/payment-config');
      var configData = await configRes.json();
      var rzpKey = configData.key || '';

      if (!rzpKey || typeof window.Razorpay !== 'function') {
        setError('Payment gateway not ready. Please refresh and try again.');
        return;
      }

      // Open Razorpay checkout
      var options: Record<string, unknown> = {
        key: rzpKey,
        amount: data.order.total_paise,
        currency: 'INR',
        name: 'MediHost',
        description: planName + ' — ' + (domain || 'medihost.in'),
        order_id: data.order.razorpay_order_id,
        theme: { color: '#10b981' },
        handler: async function (response: Record<string, string>) {
          setStatusMsg('Verifying payment…');
          try {
            var verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: data.order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            var verifyData = await verifyRes.json();
            if (verifyData.success) {
              router.push('/welcome?order=' + data.order.order_ref + '&plan=' + planId + '&domain=' + encodeURIComponent(domain) + '&intent=' + intent);
            } else {
              setError('Payment received but verification failed. Order ' + data.order.order_ref + ' is saved — contact support.');
              setStatusMsg('');
            }
          } catch {
            setError('Payment received but verification failed. Order ' + data.order.order_ref + ' is saved — contact support.');
            setStatusMsg('');
          }
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled. Order ' + data.order.order_ref + ' is saved — retry below anytime.');
            setStatusMsg('');
            setLoading(false);
          },
        },
      };

      var rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: Record<string, Record<string, string>>) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error') + '. Order ' + data.order.order_ref + ' saved — retry below.');
        setStatusMsg('');
        setLoading(false);
      });

      rzp.open();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map(function (step, i) {
          return (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ' +
                (i <= 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500')}>
                {i < 2 ? '✓' : i + 1}
              </div>
              <span className={'text-xs ' + (i <= 2 ? 'text-slate-300' : 'text-slate-600')}>{step}</span>
              {i < 3 && <div className={'flex-1 h-px ' + (i < 2 ? 'bg-emerald-500/40' : 'bg-white/10')} />}
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-extrabold text-white mb-1 text-center">Complete payment</h2>
      <p className="text-sm text-slate-400 text-center mb-6">Your order is saved before payment opens</p>

      {/* Order ref */}
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
          <span className="text-sm text-slate-300">{planName} plan — {billingParam === 'yearly' ? 'Yearly' : 'Monthly'}</span>
          <span className="text-sm font-bold text-white">₹{fmt(baseAmount)}</span>
        </div>
        {domain && (
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm text-slate-400">Domain: {domain}</span>
            {planId === 'starter' || planId === 'domain-only' ? (
              <span className="text-sm text-slate-300">₹{fmt(baseAmount)}</span>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">Included</span>
            )}
          </div>
        )}
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-slate-400">GST (18%)</span>
          <span className="text-sm text-slate-300">₹{fmt(gst)}</span>
        </div>
        <div className="px-4 py-3 bg-white/5 flex justify-between items-center">
          <span className="text-sm font-bold text-white">Total due today</span>
          <span className="text-lg font-extrabold text-white">{total === 0 ? 'Free' : '₹' + fmt(total)}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 leading-relaxed">
          {error}
          {orderId && (
            <button
              onClick={function () { setError(''); createOrder(); }}
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
         total === 0 ? 'Activate free plan →' :
         'Pay ₹' + fmt(total) + ' securely →'}
      </button>

      <p className="text-center text-xs text-slate-600 mt-3">
        256-bit SSL · Razorpay certified · GST invoice auto-generated
      </p>

      <p className="text-center text-xs text-slate-500 mt-2">
        Money deducted but issue? Call us — order ID is your proof.
      </p>
    </div>
  );
}
