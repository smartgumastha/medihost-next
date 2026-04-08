'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

var PLAN_NAMES: Record<string, string> = {
  starter: 'Starter', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise',
  'domain-only': 'Domain Only',
};

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export function PaymentContent() {
  var searchParams = useSearchParams();
  var planId = searchParams.get('plan') || 'growth';
  var domain = searchParams.get('domain') || '';
  var intent = searchParams.get('intent') || 'website';
  var billingParam = searchParams.get('billing') || 'monthly';

  var baseAmount = parseInt(searchParams.get('amount') || '0', 10);
  var gst = Math.round(baseAmount * 0.18);
  var total = baseAmount + gst;
  var planName = PLAN_NAMES[planId] || 'Growth';

  var [orderRef, setOrderRef] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');

  // Redirect free plans with no domain
  useEffect(function () {
    if (baseAmount === 0 && !domain) {
      window.location.href = '/dashboard?intent=' + intent;
    }
  }, [baseAmount, domain, intent]);

  async function handlePay() {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create order via server-side route (reads httpOnly cookie)
      var orderRes = await fetch('/api/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          domain_requested: domain,
          signup_intent: intent,
          amount: baseAmount,
        }),
      });
      var orderData = await orderRes.json();

      if (orderRes.status === 401 || (!orderData.success && orderData.error === 'Not authenticated')) {
        window.location.href = '/login?intent=' + encodeURIComponent(intent) + '&domain=' + encodeURIComponent(domain);
        return;
      }

      if (!orderData.success || !orderData.order) {
        setError(orderData.error || 'Failed to create order. Please try again.');
        setLoading(false);
        return;
      }

      var order = orderData.order;
      setOrderRef(order.order_ref || '');

      // Free plan — skip Razorpay
      if (order.total_paise === 0 || total === 0) {
        window.location.href = '/welcome?order=' + (order.order_ref || '') + '&plan=' + planId + '&domain=' + encodeURIComponent(domain) + '&intent=' + intent;
        return;
      }

      // Step 2: Load Razorpay script if not loaded
      if (typeof window.Razorpay !== 'function') {
        await new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Step 3: Get Razorpay key
      var configRes = await fetch('/api/payment-config');
      var configData = await configRes.json();

      // Step 4: Open Razorpay checkout
      var rzp = new window.Razorpay({
        key: configData.key,
        amount: order.total_paise,
        currency: 'INR',
        name: 'MediHost',
        description: (planId === 'domain-only' ? 'Domain' : planName) + ' — ' + (domain || 'MediHost Plan'),
        order_id: order.razorpay_order_id,
        handler: async function (response: Record<string, string>) {
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
          } catch { /* verification failure — order is still saved */ }
          window.location.href = '/welcome?order=' + (order.order_ref || '') + '&plan=' + planId + '&domain=' + encodeURIComponent(domain) + '&intent=' + intent;
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled. Click Pay to try again.');
          },
        },
        theme: { color: '#10b981' },
      });
      rzp.open();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  var steps = ['Signup', 'Plan', 'Payment', 'Done'];

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
          <span className="text-sm text-slate-300">{planName} — {billingParam === 'yearly' ? 'Yearly' : 'Monthly'}</span>
          <span className="text-sm font-bold text-white">₹{fmt(baseAmount)}</span>
        </div>
        {domain && (
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm text-slate-400">Domain: {domain}</span>
            {planId === 'domain-only' ? (
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
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Preparing payment…' : total === 0 ? 'Activate free plan →' : 'Pay ₹' + fmt(total) + ' securely →'}
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
