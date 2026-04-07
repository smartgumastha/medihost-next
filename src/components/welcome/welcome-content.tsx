'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter — Free',
  growth: 'Growth — ₹999/mo',
  professional: 'Professional — ₹2,499/mo',
  enterprise: 'Enterprise — ₹4,999/mo',
};

export function WelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderRef = searchParams.get('order') || '';
  const planId = searchParams.get('plan') || 'starter';
  const domain = searchParams.get('domain') || '';
  const intent = searchParams.get('intent') || 'website';

  const [userName, setUserName] = useState('Doctor');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const match = document.cookie.split('; ').find(r => r.startsWith('medihost_auth='));
    if (match) {
      try {
        const auth = JSON.parse(decodeURIComponent(match.split('=')[1]));
        if (auth?.name) setUserName(auth.name.split(' ')[0]);
      } catch { /* silent */ }
    }
  }, []);

  function copyOrderRef() {
    if (!orderRef) return;
    navigator.clipboard.writeText(orderRef).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goToHMS() {
    const match = document.cookie.split('; ').find(r => r.startsWith('medihost_auth='));
    if (match) {
      try {
        const auth = JSON.parse(decodeURIComponent(match.split('=')[1]));
        const token = auth?.token || '';
        const hospitalId = auth?.hospitalId || '';
        if (token && hospitalId) {
          window.location.href = `https://app.hemato.in?mw_token=${encodeURIComponent(token)}&mw_hospital_id=${encodeURIComponent(hospitalId)}`;
          return;
        }
      } catch { /* silent */ }
    }
    router.push('/dashboard');
  }

  // ── Free plan welcome ────────────────────────────────
  if (planId === 'starter') {
    return (
      <div className="text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16L13 23L26 9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-1">
          Welcome to MediHost, {userName}!
        </h1>
        <p className="text-sm text-slate-400 mb-6">Your free account is ready.</p>

        {/* What you got */}
        <div className="border border-white/10 rounded-2xl overflow-hidden mb-5 text-left">
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
            <span className="text-xs font-bold text-white">What&apos;s included</span>
          </div>
          {[
            'Subdomain: yourname.medihost.in',
            'Basic clinic website',
            '1 doctor profile',
            '50 appointments/month',
            'Basic billing',
          ].map(function (item) {
            return (
              <div key={item} className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <span className="text-emerald-400 text-xs shrink-0">✓</span>
                <span className="text-xs text-slate-300">{item}</span>
              </div>
            );
          })}
        </div>

        {/* Upgrade nudge */}
        <div className="border border-emerald-500/20 rounded-2xl bg-emerald-500/5 p-4 mb-5 text-left">
          <p className="text-xs font-bold text-emerald-300 mb-2">Upgrade to Growth (₹999/mo) to get:</p>
          <ul className="space-y-1.5 mb-3">
            {[
              'Custom .in domain',
              'Full HMS (OPD, EMR)',
              'WhatsApp notifications',
              'Billing + GST invoices',
            ].map(function (item) {
              return (
                <li key={item} className="flex items-center gap-2 text-xs text-emerald-300/70">
                  <span className="text-emerald-400 shrink-0">+</span>
                  {item}
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => router.push(`/plans?intent=${intent}${domain ? '&domain=' + encodeURIComponent(domain) : ''}`)}
            className="text-xs text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            Upgrade →
          </button>
        </div>

        {/* CTAs */}
        <div className="space-y-3 mb-5">
          <button
            onClick={() => router.push('/dashboard?tab=website')}
            className="w-full flex items-center gap-4 px-5 py-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="11" rx="2" stroke="#10b981" strokeWidth="1.5"/>
                <path d="M6 17h8M10 14v3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 8h8M6 10.5h5" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Set up my website</div>
              <div className="text-xs text-slate-400 mt-0.5">Add logo, services, doctors</div>
            </div>
            <span className="text-emerald-500 text-lg">→</span>
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" stroke="#60a5fa" strokeWidth="1.5"/>
                <path d="M7 7h6M7 10h4M7 13h5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Explore dashboard</div>
              <div className="text-xs text-slate-400 mt-0.5">See everything MediHost has to offer</div>
            </div>
            <span className="text-slate-500 text-lg group-hover:text-white transition-colors">→</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Paid plan welcome (from payment success) ─────────
  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16L13 23L26 9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-white mb-1">
        {intent === 'hms' ? `Your clinic software is ready, ${userName}!` : `You're live, ${userName}!`}
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Your MediHost clinic is ready. Receipt sent to your email.
      </p>

      {/* Order summary card */}
      <div className="border border-white/10 rounded-2xl overflow-hidden mb-6 text-left">
        {orderRef && (
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400">Order ID</span>
            <button
              onClick={copyOrderRef}
              className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {orderRef}
              <span className="text-[10px] text-slate-500">
                {copied ? '✓ copied' : 'tap to copy'}
              </span>
            </button>
          </div>
        )}
        {planId && (
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400">Plan</span>
            <span className="text-xs font-bold text-white">{PLAN_LABELS[planId] || planId}</span>
          </div>
        )}
        {intent === 'website' ? (
          <>
            {domain && (
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs text-slate-400">Your domain</span>
                <span className="text-xs font-bold text-emerald-400">{domain}</span>
              </div>
            )}
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">Domain active in</span>
              <span className="text-xs text-slate-300">~15 minutes (DNS propagation)</span>
            </div>
          </>
        ) : (
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-slate-400">Status</span>
            <span className="text-xs text-slate-300">OPD, billing, EMR &amp; LIS modules ready</span>
          </div>
        )}
      </div>

      {/* Safety message */}
      {orderRef && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6 text-left">
          <p className="text-xs text-blue-300 leading-relaxed">
            {intent === 'hms' ? (
              <>
                <span className="font-bold">Your OPD, billing, EMR, and LIS modules are ready.</span>{' '}
                Download the desktop app or open in browser. Order{' '}
                <span className="font-mono font-bold">{orderRef}</span> is your receipt.
              </>
            ) : (
              <>
                <span className="font-bold">Your order ID is your proof.</span> If any issue arises with payment or setup,
                share <span className="font-mono font-bold">{orderRef}</span> with our support team for instant resolution.
              </>
            )}
          </p>
        </div>
      )}

      {/* What to do first — the critical split */}
      <p className="text-sm font-bold text-white mb-3">What would you like to do first?</p>

      <div className="space-y-3 mb-5">
        {intent === 'hms' ? (
          <>
            <button
              onClick={goToHMS}
              className="w-full flex items-center gap-4 px-5 py-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M10 6v8M6 10h8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Open Clinic Software</div>
                <div className="text-xs text-slate-400 mt-0.5">Register patients, billing, OPD, LIS</div>
              </div>
              <span className="text-emerald-500 text-lg">→</span>
            </button>

            <button
              onClick={() => router.push('/dashboard?tab=website&intent=hms')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="3" width="16" height="11" rx="2" stroke="#60a5fa" strokeWidth="1.5"/>
                  <path d="M6 17h8M10 14v3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 8h8M6 10.5h5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Set up website later</div>
                <div className="text-xs text-slate-400 mt-0.5">Add logo, services, doctors — goes live in 10 min</div>
              </div>
              <span className="text-slate-500 text-lg group-hover:text-white transition-colors">→</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/dashboard?tab=website&intent=website')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="3" width="16" height="11" rx="2" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M6 17h8M10 14v3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 8h8M6 10.5h5" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Build my clinic website</div>
                <div className="text-xs text-slate-400 mt-0.5">Add logo, services, doctors — goes live in 10 min</div>
              </div>
              <span className="text-emerald-500 text-lg">→</span>
            </button>

            <button
              onClick={goToHMS}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="#60a5fa" strokeWidth="1.5"/>
                  <path d="M10 6v8M6 10h8" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Open Hospital Management (HMS)</div>
                <div className="text-xs text-slate-400 mt-0.5">Register patients, billing, OPD, LIS</div>
              </div>
              <span className="text-slate-500 text-lg group-hover:text-white transition-colors">→</span>
            </button>
          </>
        )}
      </div>

      {/* Next step nudge */}
      <div className="mb-4">
        <button
          onClick={() => router.push(`/onboard?intent=${intent}`)}
          className="text-sm text-emerald-400/80 hover:text-emerald-300 transition-colors"
        >
          Complete your clinic profile →
        </button>
        <p className="text-[11px] text-slate-500 mt-1">
          Help us customize your experience — takes 30 seconds
        </p>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        Go to dashboard →
      </button>
    </div>
  );
}
