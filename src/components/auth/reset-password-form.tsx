"use client";

import { useState } from 'react';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/proxy/api/presence/partner-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success || res.ok) {
        setSent(true);
      } else {
        setError(data.error || data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">&#9993;&#65039;</div>
        <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
        <p className="text-sm text-slate-400 mb-6">
          If an account exists for <strong className="text-slate-200">{email}</strong>, we&#39;ve sent a password reset link.
        </p>
        <a href="/login" className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="reset-email" className="block text-sm font-medium text-slate-300">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic.com"
          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <div className="text-center">
        <a href="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
          Back to login
        </a>
      </div>
    </form>
  );
}
