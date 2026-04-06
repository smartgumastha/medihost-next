"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const role = data.user.role || 'HOSPITAL_ADMIN';
        const redirectUrl = getRedirectUrl(role, product);

        if (redirectUrl.startsWith('http')) {
          // External redirect — for HMS/LIS/Physio apps, pass token
          if (data.user.hmsToken || data.user.token) {
            const loginData = encodeURIComponent(JSON.stringify({
              token: data.user.hmsToken || data.user.token,
              hospitalId: String(data.user.hospitalId || ''),
              userid: String(data.user.id || ''),
              first_name: data.user.name?.split(' ')[0] || '',
              last_name: data.user.name?.split(' ').slice(1).join(' ') || '',
              email: data.user.email || email,
              role: role,
              role_id: 2,
            }));
            const token = data.user.hmsToken || data.user.token;
            window.location.href = `${redirectUrl}?mw_token=${encodeURIComponent(token)}&mw_hospital_id=${encodeURIComponent(data.user.hospitalId || '')}&mw_login_data=${loginData}`;
          } else {
            window.location.href = redirectUrl;
          }
        } else {
          router.push(redirectUrl);
        }
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
      {error && (
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
      <p className="text-center text-sm text-slate-400 mt-4">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: accentColor }}>
          Sign up
        </a>
      </p>
    </form>
  );
}
