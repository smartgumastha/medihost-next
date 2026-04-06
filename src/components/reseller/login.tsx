'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResellerLogin() {
  const router = useRouter();
  const [refCode, setRefCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim() || !phone.trim()) {
      setError('Please enter both your referral code and phone number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/reseller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_code: refCode.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('reseller_ref_code', data.ref_code);
        localStorage.setItem('reseller_name', data.name || 'Reseller');
        router.push('/reseller/dashboard');
      } else {
        setError(data.error || 'Invalid referral code or phone number.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Reseller Login</h1>
            <p className="text-sm text-slate-400">Enter your referral code and phone to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Referral Code *</label>
              <input
                type="text"
                required
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors font-mono text-lg tracking-wider"
                placeholder="MH-XXX1234"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Phone *</label>
              <div className="flex">
                <span className="px-3 py-3 rounded-l-xl bg-white/10 border border-r-0 border-white/10 text-slate-400 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-r-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have a referral code?{' '}
            <a href="/reseller" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Register as reseller
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
