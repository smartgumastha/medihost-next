"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRACTICE_TYPES } from '@/lib/constants';

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    partner_type: 'clinic',
  });
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
        body: JSON.stringify(form),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_name">Business / Clinic Name *</Label>
          <Input
            id="business_name"
            type="text"
            placeholder="e.g. Smile Dental Clinic"
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">Owner / Doctor Name *</Label>
          <Input
            id="owner_name"
            type="text"
            placeholder="Dr. Sharma"
            value={form.owner_name}
            onChange={(e) => update('owner_name', e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup_email">Email *</Label>
        <Input
          id="signup_email"
          type="email"
          placeholder="you@clinic.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">+91</span>
          <Input
            id="phone"
            type="tel"
            placeholder="98765 43210"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="h-11 pl-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup_password">Password *</Label>
        <div className="relative">
          <Input
            id="signup_password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="h-11 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="partner_type">Business Type</Label>
        <select
          id="partner_type"
          value={form.partner_type}
          onChange={(e) => update('partner_type', e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {PRACTICE_TYPES.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.icon} {pt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-emerald-600 font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
