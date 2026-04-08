"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '645434958645-adj9plpl6m1blipo06fv17ioiqjjbftt.apps.googleusercontent.com';

interface LoginFormProps {
  product?: string;
  accentColor?: string;
}

// Role-based redirect mapping
function getRedirectUrl(role: string, product: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'HOSPITAL_ADMIN':
    case 'DOCTOR':
    case 'NURSE':
    case 'RECEPTIONIST':
      if (product === 'hms') return 'https://app.hemato.in';
      return '/dashboard';
    case 'LAB_MANAGER':
    case 'LAB_TECHNICIAN':
    case 'PHLEBOTOMIST':
    case 'PATHOLOGIST':
      if (product === 'lis') return 'https://lis.hemato.in';
      return '/dashboard';
    case 'PHYSIOTHERAPIST':
      if (product === 'physio') return 'https://physio.hemato.in';
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

export function LoginForm({ product = 'medihost', accentColor = '#10B981' }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginIntent = searchParams.get('intent') || '';
  const loginDomain = searchParams.get('domain') || '';
  const loginAmount = searchParams.get('amount') || '699';
  const [authTab, setAuthTab] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const hasRedirected = useRef(false);

  var redirectParam = searchParams.get('redirect') || '';

  function buildRedirectUrl(): string {
    // Explicit redirect param takes priority
    if (redirectParam) return redirectParam;
    // Build from intent params
    if (loginIntent === 'domain-only' && loginDomain) {
      return '/payment?plan=domain-only&domain=' + encodeURIComponent(loginDomain) + '&amount=' + loginAmount + '&billing=yearly&intent=domain-only';
    }
    if (loginIntent) {
      var url = '/dashboard?intent=' + encodeURIComponent(loginIntent);
      if (loginDomain) url += '&domain=' + encodeURIComponent(loginDomain);
      return url;
    }
    return '';
  }

  function redirectAfterAuth(defaultUrl: string) {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    var url = buildRedirectUrl() || defaultUrl;
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        var role = data.user.role || 'HOSPITAL_ADMIN';
        var defaultUrl = getRedirectUrl(role, product);

        // External redirects (HMS/LIS/Physio) — only when no intent redirect
        if (defaultUrl.startsWith('http')) {
          var hasIntentRedirect = !!buildRedirectUrl();
          if (!hasIntentRedirect) {
            var token = data.user.hmsToken || data.user.token;
            if (token) {
              var ld = encodeURIComponent(JSON.stringify({
                token: token, hospitalId: String(data.user.hospitalId || ''),
                userid: String(data.user.id || ''), first_name: data.user.name?.split(' ')[0] || '',
                last_name: data.user.name?.split(' ').slice(1).join(' ') || '',
                email: data.user.email || '', role: role, role_id: 2,
              }));
              window.location.href = defaultUrl + '?mw_token=' + encodeURIComponent(token) + '&mw_hospital_id=' + encodeURIComponent(data.user.hospitalId || '') + '&mw_login_data=' + ld;
            } else {
              window.location.href = defaultUrl;
            }
            return;
          }
        }
        redirectAfterAuth(defaultUrl);
      } else {
        setError(data.error || 'Google sign-in failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);

    try {
      var res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      var data = await res.json();

      if (data.success && data.user) {
        var role = data.user.role || 'HOSPITAL_ADMIN';
        var defaultUrl = getRedirectUrl(role, product);

        if (defaultUrl.startsWith('http')) {
          var hasIntentRedirect2 = !!buildRedirectUrl();
          if (!hasIntentRedirect2) {
            if (data.user.hmsToken || data.user.token) {
              var token = data.user.hmsToken || data.user.token;
              var ld = encodeURIComponent(JSON.stringify({
                token: data.user.hmsToken || data.user.token, hospitalId: String(data.user.hospitalId || ''),
                userid: String(data.user.id || ''), first_name: data.user.name?.split(' ')[0] || '',
                last_name: data.user.name?.split(' ').slice(1).join(' ') || '',
                email: data.user.email || email, role: role, role_id: 2,
              }));
              window.location.href = defaultUrl + '?mw_token=' + encodeURIComponent(token) + '&mw_hospital_id=' + encodeURIComponent(data.user.hospitalId || '') + '&mw_login_data=' + ld;
            } else {
              window.location.href = defaultUrl;
            }
            return;
          }
        }
        redirectAfterAuth(defaultUrl);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="space-y-5">
        {/* Auth tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <button type="button" onClick={() => { setAuthTab('google'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${authTab === 'google' ? 'text-emerald-400' : 'text-slate-500'}`}
            style={authTab === 'google' ? { background: 'rgba(16,185,129,0.12)' } : {}}>
            Google
          </button>
          <button type="button" onClick={() => { setAuthTab('email'); setError(''); }}
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
                Signing you in...
              </div>
            ) : (
              <div className="flex justify-center [&_iframe]:rounded-xl">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="signin_with"
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
              <p className="text-xs text-slate-400 leading-relaxed">Fastest way in. One click, no password needed.</p>
            </div>
          </div>
        )}

        {/* Email tab */}
        {authTab === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 outline-none transition-colors"
                style={{ borderColor: email ? `${accentColor}50` : undefined }}
                onFocus={(e) => e.target.style.borderColor = `${accentColor}80`}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <a href="/reset-password" className="text-xs hover:opacity-80 transition-opacity" style={{ color: accentColor }}>
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 outline-none transition-colors"
                onFocus={(e) => e.target.style.borderColor = `${accentColor}80`}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
            </div>
            {error && authTab === 'email' && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                boxShadow: loading ? 'none' : `0 8px 20px ${accentColor}30`,
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 mt-4">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: accentColor }}>
            Sign up
          </a>
        </p>
      </div>
    </GoogleOAuthProvider>
  );
}
