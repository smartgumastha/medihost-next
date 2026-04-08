"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { PRACTICE_TYPES } from '@/lib/constants';

const GOOGLE_CLIENT_ID = '645434958645-adj9plpl6m1blipo06fv17ioiqjjbftt.apps.googleusercontent.com';

const HEADINGS: Record<string, string> = {
  dental: 'HMS for Dental Clinics',
  hospital: 'Enterprise HMS for Hospitals',
  eye: 'HMS for Eye Clinics',
  skin: 'HMS for Skin Clinics',
  multispecialty: 'Multi-Specialty HMS',
  general: 'Start your Clinic on MediHost',
};

const PRODUCT_HEADINGS: Record<string, string> = {
  lis: 'NABL LIS for your Lab',
  pharmacy: 'Pharmacy POS',
  physio: 'RightPhysio for Physio Centres',
};

const PRODUCT_REDIRECTS: Record<string, string> = {
  hms: 'https://app.hemato.in',
  lis: 'https://lis.hemato.in',
  pharmacy: 'https://rx.medihost.in',
  physio: 'https://physio.hemato.in',
};

function getHeading(domain: string | null, type: string | null, product: string | null): string {
  if (domain) return `Get ${domain} + start your clinic`;
  if (type && HEADINGS[type]) return HEADINGS[type];
  if (product && PRODUCT_HEADINGS[product]) return PRODUCT_HEADINGS[product];
  return 'Create your free MediHost account';
}

function getSelectedProduct(type: string | null, product: string | null): string {
  if (product === 'lis') return 'lis';
  if (product === 'pharmacy') return 'pharmacy';
  if (product === 'physio') return 'physio';
  return 'hms';
}

function getDefaultPartnerType(type: string | null, product: string | null): string {
  if (type === 'dental') return 'dental';
  if (type === 'hospital') return 'hospital';
  if (type === 'eye') return 'eye_clinic';
  if (type === 'multispecialty' || type === 'general') return 'clinic';
  if (product === 'lis') return 'diagnostic_lab';
  if (product === 'pharmacy') return 'pharmacy';
  if (product === 'physio') return 'physiotherapy';
  return 'clinic';
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const domain = searchParams.get('domain') || '';
  const type = searchParams.get('type') || '';
  const product = searchParams.get('product') || '';
  const ref = searchParams.get('ref') || '';
  const intent = searchParams.get('intent') || 'website';

  const selectedProduct = getSelectedProduct(type || null, product || null);
  const heading = getHeading(domain || null, type || null, product || null);

  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    partner_type: getDefaultPartnerType(type || null, product || null),
  });

  // Pre-fill business name from domain
  useEffect(() => {
    if (domain) {
      const name = domain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setForm(prev => ({ ...prev, business_name: prev.business_name || name }));
    }
  }, [domain]);

  const [authTab, setAuthTab] = useState<'google' | 'email'>('google');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState(false);
  const hasRedirected = useRef(false);

  const plan = searchParams.get('plan') || '';

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function buildRedirectUrl() {
    var params = new URLSearchParams();
    if (intent) params.set('intent', intent);
    if (domain) params.set('domain', domain);
    if (plan) params.set('plan', plan);
    var qs = params.toString();
    return '/dashboard' + (qs ? '?' + qs : '');
  }

  function redirectAfterAuth() {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push(buildRedirectUrl());
  }

  function saveAuthAndRedirect(user: { id?: string; partnerId?: string; token?: string; hospitalId?: string; email?: string; name?: string }) {
    var token = user.token || '';
    var hospitalId = user.hospitalId || '';

    // Client-side cookie backup (API route sets it server-side too)
    if (token) {
      document.cookie = 'medihost_auth=' + encodeURIComponent(JSON.stringify(user)) + '; path=/; max-age=2592000; samesite=lax';
      localStorage.setItem('mh_token', token);
      localStorage.setItem('mh_partner_id', user.partnerId || user.id || '');
      localStorage.setItem('medihost_token', token);
      localStorage.setItem('mh_hospital_id', String(hospitalId));
      localStorage.setItem('mh_user_name', user.name || form.owner_name);
      localStorage.setItem('mh_user_email', user.email || form.email);
      localStorage.setItem('mh_user_phone', form.phone);
    }

    // Non-HMS products with token go directly to their app
    if (selectedProduct !== 'hms' && token && hospitalId) {
      var baseUrl = PRODUCT_REDIRECTS[selectedProduct];
      window.location.href = baseUrl + '?mw_token=' + encodeURIComponent(token) + '&mw_hospital_id=' + encodeURIComponent(hospitalId);
      return;
    }

    redirectAfterAuth();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Existing user mode — login with email + password
    if (existingUser) {
      if (!form.email || !form.password) {
        setError('Please enter your password');
        return;
      }
      setError('');
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveAuthAndRedirect(data.user);
        } else {
          setError(data.error || 'Incorrect password. Please try again.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal signup flow
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
        body: JSON.stringify({
          ...form,
          selected_domain: domain,
          selected_product: selectedProduct,
          ref_code: ref,
          intent: intent,
          plan_tier: plan || 'starter',
        }),
      });
      const data = await res.json();

      if (data.success && !data.existing) {
        // New signup succeeded
        saveAuthAndRedirect(data.user || {});
      } else if (data.success && data.existing) {
        // Existing user logged in via signup
        saveAuthAndRedirect(data.user || {});
      } else if (data.existing) {
        // Account exists, wrong password — switch to inline login mode
        setExistingUser(true);
        setError('Account exists. Enter your password to continue.');
        update('password', '');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_token: credentialResponse.credential,
          signup_intent: intent,
          selected_domain: domain,
        }),
      });
      const data = await res.json();
      if (data.success) {
        redirectAfterAuth();
      } else {
        setError(data.error || 'Google signup failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  const inputClass = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-colors";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Intent banner */}
      {intent === 'hms' ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          </span>
          <span className="text-sm text-indigo-300">Setting up your clinic software — OPD, billing, EMR, LIS</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </span>
          <span className="text-sm text-emerald-300">Getting your clinic online — domain, website, booking</span>
        </div>
      )}

      {/* Dynamic heading */}
      <h3 className="text-lg font-bold text-white text-center mb-2">{heading}</h3>

      {/* Domain badge */}
      {domain && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">✓</span>
          <div className="flex-1">
            <div className="text-sm font-bold text-emerald-300">Your domain: {domain}</div>
            <div className="text-xs text-emerald-400/60">Ready to register — included with your plan</div>
          </div>
        </div>
      )}

      {/* Auth tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <button type="button" onClick={() => setAuthTab('google')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${authTab === 'google' ? 'text-emerald-400' : 'text-slate-500'}`}
          style={authTab === 'google' ? { background: 'rgba(16,185,129,0.12)' } : {}}>
          Google
        </button>
        <button type="button" onClick={() => setAuthTab('email')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${authTab === 'email' ? 'text-emerald-400' : 'text-slate-500'}`}
          style={authTab === 'email' ? { background: 'rgba(16,185,129,0.12)' } : {}}>
          Email
        </button>
      </div>

      {/* Google tab */}
      {authTab === 'google' && (
        <div className="space-y-4">
          {googleLoading ? (
            <div className="w-full h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm">
              Creating your account...
            </div>
          ) : (
            <div className="flex justify-center [&_iframe]:rounded-xl">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
                theme="filled_black"
                size="large"
                width="100%"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          )}
          {error && authTab === 'google' && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </div>
          )}
          <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <p className="text-xs text-slate-400 leading-relaxed">One click signup. No password needed. We&apos;ll create your MediHost account using your Google name and email.</p>
          </div>
        </div>
      )}

      {/* Email tab — form fields */}
      {authTab === 'email' && (
        <div className="space-y-4">
          {existingUser ? (
            <>
              {/* Inline login for existing user */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <p className="text-sm text-emerald-300 font-semibold">Welcome back!</p>
                <p className="text-xs text-slate-400 mt-1">Enter your password to continue.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="existing_email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="existing_email"
                  type="email"
                  value={form.email}
                  disabled
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="existing_password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <a href="/reset-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-opacity">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="existing_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={`${inputClass} pr-16`}
                    autoFocus
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
                {loading ? 'Signing in...' : 'Log in & continue'}
              </button>

              <button
                type="button"
                onClick={() => { setExistingUser(false); setError(''); update('password', ''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              {/* Normal signup form */}
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

              {/* No domain path */}
              {!domain && (
                <p className="text-center text-xs text-slate-500 mt-2">
                  Want your own domain?{' '}
                  <a href="/" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Search at medihost.in
                  </a>
                </p>
              )}

              {/* Ref tracking indicator */}
              {ref && (
                <p className="text-center text-xs text-slate-600">
                  Referred by: {ref}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <p className="text-center text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
          Sign in
        </a>
      </p>
    </form>
    </GoogleOAuthProvider>
  );
}
