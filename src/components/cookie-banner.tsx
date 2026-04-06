"use client";

import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="max-w-4xl mx-auto bg-[#1E293B] border border-white/10 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-black/30">
        <p className="text-sm text-slate-300 leading-relaxed">
          We use one essential cookie for login sessions. No tracking or advertising cookies.{' '}
          <a href="/privacy#cookies" className="text-emerald-400 font-medium hover:underline">Learn more</a>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <a href="/privacy#cookies" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Privacy Policy
          </a>
          <button
            onClick={accept}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
