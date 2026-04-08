'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BUSINESS_TYPES = [
  { value: 'clinic', label: 'Clinic' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'diagnostic_lab', label: 'Diagnostic Lab' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'nursing_home', label: 'Nursing Home' },
  { value: 'dental', label: 'Dental' },
  { value: 'eye_clinic', label: 'Eye Clinic' },
] as const;

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map((t) => [t.value, t.label]),
);

/* ------------------------------------------------------------------ */
/*  Inline toast                                                       */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        \u00d7
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form state                                                         */
/* ------------------------------------------------------------------ */

interface FormData {
  businessName: string;
  businessType: string;
  ownerName: string;
  specialization: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  tagline: string;
  about: string;
}

const emptyForm: FormData = {
  businessName: '',
  businessType: 'clinic',
  ownerName: '',
  specialization: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  tagline: '',
  about: '',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileForm({ user }: { user: AuthUser | null }) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  /* ---- Fetch latest profile on mount ---- */
  useEffect(() => {
    if (!user?.token) {
      setFetching(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/proxy/api/presence/auth/me', {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to load profile');

        const json = await res.json();
        const data = json.data || json;

        setPartnerId(data._id || data.id || null);
        setSlug(data.slug || null);
        setForm({
          businessName: data.businessName || data.business_name || data.name || '',
          businessType: data.businessType || data.partner_type || data.type || 'clinic',
          ownerName: data.ownerName || data.owner_name || data.doctorName || '',
          specialization: data.specialization || '',
          email: data.email || user.email || '',
          phone: data.phone || data.mobile || '',
          address: data.address || data.address_line1 || '',
          city: data.city || '',
          pincode: data.pincode || data.zipCode || '',
          tagline: data.tagline || data.website_meta_title || '',
          about: data.about || data.description || '',
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fall back to auth cookie data
          setForm((prev) => ({
            ...prev,
            email: user.email || '',
            ownerName: user.name || '',
          }));
        }
      } finally {
        setFetching(false);
      }
    })();

    return () => controller.abort();
  }, [user]);

  /* ---- Handle field change ---- */
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ---- Save ---- */
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.businessName.trim() || !form.ownerName.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    if (!partnerId) {
      showToast('Partner ID not found. Please reload.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/proxy/api/presence/partners/${partnerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            business_name: form.businessName,
            partner_type: form.businessType,
            owner_name: form.ownerName,
            specialization: form.specialization,
            email: form.email,
            phone: form.phone,
            address_line1: form.address,
            city: form.city,
            pincode: form.pincode,
            website_meta_title: form.tagline,
            description: form.about,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || err.message || 'Save failed');
      }

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast((err as Error).message || 'Failed to save profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Initials helper ---- */
  const initials = (form.ownerName || user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-500">
            Not authenticated. Please log in again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (fetching) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading profile...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      {/* ---- Profile Display Card ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 48, height: 48, backgroundColor: '#E1F5EE', color: '#0F6E56', fontSize: 18, fontWeight: 500 }}>
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                {form.businessName || 'Untitled Business'}
              </h3>
              <p className="text-sm text-gray-600">{form.ownerName}</p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
                <Badge variant="secondary">
                  {TYPE_LABELS[form.businessType] || form.businessType}
                </Badge>
                {form.city && (
                  <span className="text-xs text-gray-500">{form.city}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-gray-500 sm:justify-start">
                {form.phone && (
                  <span className="flex items-center gap-1">
                    <PhoneIcon /> {form.phone}
                  </span>
                )}
                {form.email && (
                  <span className="flex items-center gap-1">
                    <MailIcon /> {form.email}
                  </span>
                )}
              </div>

              {slug && (
                <p className="pt-2 text-xs text-gray-400">
                  Public URL:{' '}
                  <a
                    href={`https://medihost.co.in/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 underline hover:text-emerald-700"
                  >
                    medihost.co.in/{slug}
                  </a>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ---- Edit Form Card ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-5">
            {/* Row 1: Clinic name + Clinic type */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Clinic / Hospital Name <span className="text-red-500">*</span></Label>
                <Input id="businessName" name="businessName" value={form.businessName} onChange={onChange} placeholder="e.g. City Care Hospital" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessType">Clinic Type</Label>
                <select id="businessType" name="businessType" value={form.businessType} onChange={onChange}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  {BUSINESS_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
            </div>

            {/* Row 2: Owner name + Specialization */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ownerName">Owner / Doctor Name <span className="text-red-500">*</span></Label>
                <Input id="ownerName" name="ownerName" value={form.ownerName} onChange={onChange} placeholder="Dr. John Doe" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" value={form.specialization} onChange={onChange} placeholder="e.g. General Physician, Dentist" />
              </div>
            </div>

            {/* Row 3: Phone + Email (read-only) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="9876543210" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} disabled className="opacity-60 cursor-not-allowed" />
              </div>
            </div>

            {/* Row 4: Address + City */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={onChange} placeholder="123 Main Street" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={form.city} onChange={onChange} placeholder="Mumbai" />
              </div>
            </div>

            {/* Row 5: Tagline (full width) */}
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" value={form.tagline} onChange={onChange} placeholder="Short tagline for your website" />
              <p className="text-[10px] text-gray-400">Appears on your website hero section</p>
            </div>

            {/* Row 6: About (full width textarea) */}
            <div className="space-y-1.5">
              <Label htmlFor="about">About</Label>
              <textarea id="about" name="about" value={form.about} onChange={(e) => setForm(prev => ({ ...prev, about: e.target.value }))}
                placeholder="1-2 sentences about your clinic" rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none" />
              <p className="text-[10px] text-gray-400">Appears on your website about section</p>
            </div>

            {/* Branding section */}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Branding</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-lg" style={{ width: 48, height: 48, backgroundColor: '#E1F5EE', color: '#0F6E56', fontSize: 18, fontWeight: 500 }}>
                  {initials}
                </div>
                <div>
                  <button type="button" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline">Upload logo</button>
                  <p className="text-[10px] text-gray-400 mt-0.5">Recommended: 200x200px, PNG or JPG</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-3">Changes sync to your website and HMS automatically.</p>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny inline icons                                                  */
/* ------------------------------------------------------------------ */

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.69 2.36a2 2 0 01-.45 2.11L8.09 9.45a16 16 0 006.46 6.46l1.27-1.27a2 2 0 012.11-.45c.76.33 1.55.56 2.36.69A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  );
}
