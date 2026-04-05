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
        <div className="text-4xl mb-4">✉️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-500 mb-6">
          If an account exists for <strong>{email}</strong>, we&#39;ve sent a password reset link.
        </p>
        <a href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <div className="text-center">
        <a href="/login" className="text-sm text-gray-500 hover:text-emerald-600">
          Back to login
        </a>
      </div>
    </form>
  );
}
