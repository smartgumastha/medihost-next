'use client';

import { useState } from 'react';

const BENEFITS = [
  { amount: '₹500+', label: 'per referral that converts to paid plan', icon: '💰' },
  { amount: '₹100', label: 'per referral that signs up (even free plan)', icon: '🎯' },
  { amount: 'Recurring', label: '10% commission on yearly renewals', icon: '🔄' },
];

const BACKGROUNDS = [
  'Pharma Sales Rep',
  'Medical Device Sales',
  'Hospital Admin',
  'Healthcare IT',
  'Doctor',
  'Lab Technician',
  'Other',
];

const SOURCES = ['Google', 'LinkedIn', 'WhatsApp', 'Friend', 'Other'];

interface RegistrationResult {
  ref_code: string;
  reseller_id?: string;
  note?: string;
}

export function ResellerRegistration() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    background: '',
    linkedin: '',
    source: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const refLink = result ? `medihost.in/signup?ref=${result.ref_code}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/reseller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }
      setResult(data);
      // Store ref code for dashboard
      localStorage.setItem('reseller_ref_code', data.ref_code);
      localStorage.setItem('reseller_name', form.name);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${refLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! I just joined MediHost as a reseller. MediHost gives clinics an AI-powered website, appointments, billing & more — all in 60 seconds.\n\nSign up here: https://${refLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(`https://${refLink}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Success state
  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome aboard!</h2>
        <p className="text-slate-400 mb-6">Your referral code:</p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 mb-4">
          <span className="text-3xl font-mono font-bold text-emerald-400">{result.ref_code}</span>
        </div>

        <p className="text-sm text-slate-500 mb-2">Your referral link:</p>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-6">
          <span className="text-sm text-slate-300 flex-1 truncate">https://{refLink}</span>
          <button
            onClick={copyLink}
            className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.305 0-4.461-.676-6.27-1.838l-.45-.293-2.946.988.988-2.946-.293-.45A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Share on WhatsApp
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share on LinkedIn
          </button>
        </div>

        {/* QR Code placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-sm text-slate-400 mb-3">QR Code for your referral link</p>
          <div className="w-32 h-32 mx-auto bg-white/10 rounded-lg flex items-center justify-center">
            <span className="text-slate-500 text-xs">QR Code</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Coming soon</p>
        </div>

        <a
          href="/reseller/dashboard"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          Go to Reseller Dashboard
        </a>
      </div>
    );
  }

  // Registration form
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Become a MediHost Reseller
          </span>
        </h1>
        <p className="text-lg text-slate-400">
          Refer clinics. Earn commissions. No investment needed.
        </p>
      </div>

      {/* Benefit cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {BENEFITS.map((b) => (
          <div
            key={b.amount}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors"
          >
            <span className="text-2xl mb-2 block">{b.icon}</span>
            <p className="text-2xl font-bold text-emerald-400 mb-1">{b.amount}</p>
            <p className="text-sm text-slate-400">{b.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Register as Reseller</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Phone *</label>
            <div className="flex">
              <span className="px-3 py-2.5 rounded-l-lg bg-white/10 border border-r-0 border-white/10 text-slate-400 text-sm">
                +91
              </span>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-r-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">City *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              placeholder="Hyderabad"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Medical Background</label>
            <select
              value={form.background}
              onChange={(e) => update('background', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none transition-colors appearance-none"
            >
              <option value="" className="bg-slate-800">Select...</option>
              {BACKGROUNDS.map((b) => (
                <option key={b} value={b} className="bg-slate-800">{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">LinkedIn Profile</label>
            <input
              type="url"
              value={form.linkedin}
              onChange={(e) => update('linkedin', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-1.5">How did you hear about us?</label>
          <select
            value={form.source}
            onChange={(e) => update('source', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none transition-colors appearance-none"
          >
            <option value="" className="bg-slate-800">Select...</option>
            {SOURCES.map((s) => (
              <option key={s} value={s} className="bg-slate-800">{s}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Registering...' : 'Register as Reseller'}
        </button>
      </form>
    </div>
  );
}
