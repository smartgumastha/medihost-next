'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

var API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartgumastha-backend-production.up.railway.app';

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

interface DomainPricing {
  selling_price: number;
  gst: number;
  total_with_gst: number;
  gst_percent: number;
}

export function BuyDomainContent() {
  var searchParams = useSearchParams();
  var router = useRouter();
  var domain = searchParams.get('domain') || '';

  var [isLoggedIn, setIsLoggedIn] = useState(false);
  var [loading, setLoading] = useState(true);
  var [available, setAvailable] = useState<boolean | null>(null);
  var [pricing, setPricing] = useState<DomainPricing>({ selling_price: 699, gst: 126, total_with_gst: 825, gst_percent: 18 });

  useEffect(function () {
    var match = document.cookie.split('; ').find(function (r) { return r.startsWith('medihost_auth='); });
    if (match) {
      try {
        var auth = JSON.parse(decodeURIComponent(match.split('=')[1]));
        if (auth?.token) setIsLoggedIn(true);
      } catch { /* silent */ }
    }
  }, []);

  useEffect(function () {
    if (!domain) { setLoading(false); return; }
    fetch(API_BASE + '/api/presence/pricing/domain-price?domain=' + encodeURIComponent(domain))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.pricing) {
          setPricing({
            selling_price: data.pricing.selling_price,
            gst: data.pricing.gst,
            total_with_gst: data.pricing.total_with_gst,
            gst_percent: data.pricing.gst_percent || 18,
          });
          setAvailable(data.available);
        }
      })
      .catch(function () { /* keep defaults */ })
      .finally(function () { setLoading(false); });
  }, [domain]);

  function handleBuy() {
    if (!domain) return;
    if (isLoggedIn) {
      router.push('/payment?plan=domain-only&domain=' + encodeURIComponent(domain) + '&amount=' + pricing.selling_price + '&intent=website');
    } else {
      router.push('/signup?intent=website&domain=' + encodeURIComponent(domain));
    }
  }

  if (!domain) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-white mb-2">No domain selected</h2>
        <p className="text-sm text-slate-400 mb-4">Search for a domain on our homepage first.</p>
        <a href="/" className="text-sm text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
          Search domains →
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 text-sm animate-pulse">Checking {domain}...</div>
      </div>
    );
  }

  if (available === false) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-white mb-1">{domain} is taken</h2>
        <p className="text-sm text-slate-400 mb-4">This domain is already registered. Try a different name.</p>
        <a href="/" className="text-sm text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
          Search another domain →
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Domain icon */}
      <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.5"/>
          <path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke="#10b981" strokeWidth="1.5"/>
        </svg>
      </div>

      <h2 className="text-xl font-extrabold text-white mb-1">Get {domain}</h2>
      <p className="text-sm text-slate-400 mb-5">Your custom domain for your clinic</p>

      {/* Price card */}
      <div className="border border-white/10 rounded-2xl overflow-hidden mb-5 text-left">
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-slate-300">Domain: {domain}</span>
          <span className="text-sm font-bold text-white">₹{fmt(pricing.selling_price)}/yr</span>
        </div>
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-slate-400">GST ({pricing.gst_percent}%)</span>
          <span className="text-sm text-slate-300">₹{fmt(pricing.gst)}</span>
        </div>
        <div className="px-4 py-3 bg-white/5 flex justify-between items-center">
          <span className="text-sm font-bold text-white">Total</span>
          <span className="text-lg font-extrabold text-white">₹{fmt(pricing.total_with_gst)}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleBuy}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-bold rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-[0.98] mb-3"
      >
        {isLoggedIn ? 'Buy domain — ₹' + fmt(pricing.total_with_gst) + ' →' : 'Sign up to buy domain →'}
      </button>

      {!isLoggedIn && (
        <p className="text-[11px] text-slate-500 mb-4">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
            Log in
          </a>
        </p>
      )}

      {/* Plans upsell */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-slate-400 mb-2">Want more than just a domain?</p>
        <a
          href={'/plans?domain=' + encodeURIComponent(domain)}
          className="text-sm text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
        >
          See our plans — domain included free with Growth →
        </a>
      </div>
    </div>
  );
}
