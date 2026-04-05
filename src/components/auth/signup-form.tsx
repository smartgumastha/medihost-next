"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRACTICE_TYPES } from '@/lib/constants';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDomain = searchParams.get('domain') || '';
  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    partner_type: 'clinic',
  });

  // Pre-fill business name from domain
  useEffect(() => {
    if (selectedDomain) {
      const name = selectedDomain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setForm(prev => ({ ...prev, business_name: prev.business_name || name }));
    }
  }, [selectedDomain]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name || !form.owner_name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selected_domain: selectedDomain }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/onboard');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedDomain && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-emerald-400 text-lg">🌐</span>
          <div>
            <div className="text-xs text-emerald-400/70 font-medium">Selected Domain</div>
            <div className="text-sm font-bold text-emerald-300">{selectedDomain}</div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="business_name" className="block text-sm font-medium text-slate-300">
            Business / Clinic Name *
          </label>
          <input
            id="business_name"
            type="text"
            placeholder="e.g. Smile Dental Clinic"
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="owner_name" className="block text-sm font-medium text-slate-300">
            Owner / Doctor Name *
          </label>
          <input
            id="owner_name"
            type="text"
            placeholder="Dr. Sharma"
            value={form.owner_name}
            onChange={(e) => update('owner_name', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="signup_email" className="block text-sm font-medium text-slate-300">
          Email *
        </label>
        <input
          id="signup_email"
          type="email"
          placeholder="you@clinic.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
          Phone
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 select-none">+91</span>
          <input
            id="phone"
            type="tel"
            placeholder="98765 43210"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={`${inputClass} pl-12`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="signup_password" className="block text-sm font-medium text-slate-300">
          Password *
        </label>
        <div className="relative">
          <input
            id="signup_password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="partner_type" className="block text-sm font-medium text-slate-300">
          Business Type
        </label>
        <select
          id="partner_type"
          value={form.partner_type}
          onChange={(e) => update('partner_type', e.target.value)}
          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none"
        >
          {PRACTICE_TYPES.map((pt) => (
            <option key={pt.id} value={pt.id} className="bg-[#1E293B] text-white">
              {pt.icon} {pt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
          Sign in
        </a>
      </p>
    </form>
  );
}
