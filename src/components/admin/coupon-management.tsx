"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

type DiscountType = 'percentage' | 'fixed_amount' | 'free_months' | 'domain_free';

interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  applicable_plans: string[];
  applicable_cycles: string[];
  max_redemptions: number | null;
  times_redeemed: number;
  valid_from: number | null;
  valid_until: number | null;
  is_active: boolean;
  created_at: number;
}

interface Redemption {
  hospital_id: string;
  hospital_name: string;
  redeemed_at: number;
  plan_tier: string;
  discount_applied: number;
}

interface CouponForm {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  applicable_plans: string[];
  applicable_cycles: string[];
  max_redemptions: number;
  valid_from: string;
  valid_until: string;
}

// ── Constants ──────────────────────────────────────────────

const ALL_PLANS = ['starter', 'growth', 'professional', 'enterprise'];
const ALL_CYCLES = ['monthly', 'yearly'];

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  percentage: { bg: 'bg-blue-50 text-blue-700', label: 'Percentage' },
  fixed_amount: { bg: 'bg-emerald-50 text-emerald-700', label: 'Fixed Amount' },
  free_months: { bg: 'bg-purple-50 text-purple-700', label: 'Free Months' },
  domain_free: { bg: 'bg-amber-50 text-amber-700', label: 'Free Domain' },
};

const EMPTY_FORM: CouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  applicable_plans: [],
  applicable_cycles: [],
  max_redemptions: 0,
  valid_from: '',
  valid_until: '',
};

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function jsonHeaders(): Record<string, string> {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function formatDiscount(type: string, value: number): string {
  if (type === 'percentage') return value + '% off';
  if (type === 'fixed_amount') return '\u20B9' + (value / 100).toLocaleString('en-IN') + ' off';
  if (type === 'free_months') return value + ' month' + (value !== 1 ? 's' : '') + ' free';
  return 'Free domain';
}

function formatDate(ts: number | null): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toEpoch(dateStr: string): number | null {
  if (!dateStr) return null;
  return new Date(dateStr).getTime();
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Record<string, Redemption[]>>({});
  const [loadingRedemptions, setLoadingRedemptions] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const loadCoupons = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/coupons', { headers: authHeaders() });
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      } else {
        setError(data.error || 'Failed to load coupons');
      }
    } catch {
      setError('Network error loading coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  // ── Toggle Active ────────────────────────────────────────

  async function toggleActive(coupon: Coupon) {
    const prev = coupon.is_active;
    // Optimistic update
    setCoupons(cs => cs.map(c => c.id === coupon.id ? { ...c, is_active: !prev } : c));
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({ is_active: !prev }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(coupon.code + ' ' + (!prev ? 'activated' : 'deactivated'));
      } else {
        // Revert
        setCoupons(cs => cs.map(c => c.id === coupon.id ? { ...c, is_active: prev } : c));
        showToast('Error: ' + (data.error || 'Toggle failed'));
      }
    } catch {
      setCoupons(cs => cs.map(c => c.id === coupon.id ? { ...c, is_active: prev } : c));
      showToast('Network error');
    }
  }

  // ── View Redemptions ─────────────────────────────────────

  async function toggleRedemptions(couponId: string) {
    if (expandedId === couponId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(couponId);
    if (redemptions[couponId]) return; // Already loaded

    setLoadingRedemptions(couponId);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/redemptions`, { headers: authHeaders() });
      const data = await res.json();
      setRedemptions(prev => ({ ...prev, [couponId]: data.redemptions || [] }));
    } catch {
      showToast('Failed to load redemptions');
    } finally {
      setLoadingRedemptions('');
    }
  }

  // ── Delete ───────────────────────────────────────────────

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(cs => cs.filter(c => c.id !== confirmDelete.id));
        showToast(confirmDelete.code + ' deleted');
      } else {
        showToast('Error: ' + (data.error || 'Delete failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  // ── Create ───────────────────────────────────────────────

  async function handleCreate() {
    if (!form.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        applicable_plans: form.applicable_plans,
        applicable_cycles: form.applicable_cycles,
        max_redemptions: form.max_redemptions || null,
        valid_from: toEpoch(form.valid_from),
        valid_until: toEpoch(form.valid_until),
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(form.code.toUpperCase() + ' created');
        setForm(EMPTY_FORM);
        setShowCreate(false);
        loadCoupons();
      } else {
        setFormError(data.error || 'Create failed');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  }

  // ── Helpers for form ─────────────────────────────────────

  function toggleFormPlan(plan: string) {
    setForm(prev => ({
      ...prev,
      applicable_plans: prev.applicable_plans.includes(plan)
        ? prev.applicable_plans.filter(p => p !== plan)
        : [...prev.applicable_plans, plan],
    }));
  }

  function toggleFormCycle(cycle: string) {
    setForm(prev => ({
      ...prev,
      applicable_cycles: prev.applicable_cycles.includes(cycle)
        ? prev.applicable_cycles.filter(c => c !== cycle)
        : [...prev.applicable_cycles, cycle],
    }));
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''} in database`}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setFormError(''); setShowCreate(true); }}
            className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#534AB7' }}
          >
            + Create Coupon
          </button>
        )}
      </div>

      {/* Create Form (slide-down) */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">New Coupon</h2>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Coupon Code</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="LAUNCH20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Discount Value</label>
              <input
                type="number"
                value={form.discount_value || ''}
                onChange={e => setForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                placeholder={form.discount_type === 'percentage' ? '20' : '50000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {form.discount_type === 'fixed_amount' && (
                <p className="text-[11px] text-gray-400 mt-1">In paise (50000 = &#8377;500)</p>
              )}
            </div>
          </div>

          {/* Discount Type — Radio Buttons */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Discount Type</label>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(TYPE_STYLES) as [DiscountType, { bg: string; label: string }][]).map(([key, { bg, label }]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discount_type"
                    checked={form.discount_type === key}
                    onChange={() => setForm(prev => ({ ...prev, discount_type: key }))}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${bg}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Applicable Plans */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Applicable Plans</label>
            <div className="flex flex-wrap gap-3">
              {ALL_PLANS.map(plan => (
                <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={form.applicable_plans.includes(plan)}
                    onChange={() => toggleFormPlan(plan)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>{plan}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Applicable Cycles */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Applicable Cycles</label>
            <div className="flex flex-wrap gap-3">
              {ALL_CYCLES.map(cycle => (
                <label key={cycle} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={form.applicable_cycles.includes(cycle)}
                    onChange={() => toggleFormCycle(cycle)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>{cycle}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Max Redemptions */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Redemptions (0 = unlimited)</label>
              <input
                type="number"
                value={form.max_redemptions || ''}
                onChange={e => setForm(prev => ({ ...prev, max_redemptions: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Valid From</label>
              <input
                type="date"
                value={form.valid_from}
                onChange={e => setForm(prev => ({ ...prev, valid_from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600 font-medium">{formError}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#534AB7' }}
            >
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={loadCoupons} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}

      {/* Coupon Table */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plans</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Used / Max</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Valid Until</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => {
                  const typeStyle = TYPE_STYLES[coupon.discount_type] || TYPE_STYLES.percentage;
                  const isExpanded = expandedId === coupon.id;
                  return (
                    <CouponRow
                      key={coupon.id}
                      coupon={coupon}
                      typeStyle={typeStyle}
                      isExpanded={isExpanded}
                      redemptionList={redemptions[coupon.id]}
                      loadingRedemptions={loadingRedemptions === coupon.id}
                      onToggleActive={() => toggleActive(coupon)}
                      onToggleRedemptions={() => toggleRedemptions(coupon.id)}
                      onDelete={() => setConfirmDelete(coupon)}
                    />
                  );
                })}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">No coupons yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Delete Coupon</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-mono font-bold">{confirmDelete.code}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Coupon Row ─────────────────────────────────────────────

function CouponRow({
  coupon,
  typeStyle,
  isExpanded,
  redemptionList,
  loadingRedemptions,
  onToggleActive,
  onToggleRedemptions,
  onDelete,
}: {
  coupon: Coupon;
  typeStyle: { bg: string; label: string };
  isExpanded: boolean;
  redemptionList: Redemption[] | undefined;
  loadingRedemptions: boolean;
  onToggleActive: () => void;
  onToggleRedemptions: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
        {/* Code */}
        <td className="py-3 px-4">
          <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
        </td>

        {/* Type Badge */}
        <td className="py-3 px-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg}`}>
            {typeStyle.label}
          </span>
        </td>

        {/* Value */}
        <td className="py-3 px-4 text-gray-700 font-medium">
          {formatDiscount(coupon.discount_type, coupon.discount_value)}
        </td>

        {/* Plans */}
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {(coupon.applicable_plans || []).map(p => (
              <span key={p} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 capitalize">
                {p}
              </span>
            ))}
            {(!coupon.applicable_plans || coupon.applicable_plans.length === 0) && (
              <span className="text-xs text-gray-400">All</span>
            )}
          </div>
        </td>

        {/* Used / Max */}
        <td className="py-3 px-4 text-gray-600">
          {coupon.times_redeemed || 0}
          <span className="text-gray-400"> / </span>
          {coupon.max_redemptions ? coupon.max_redemptions : <span className="text-gray-400">&infin;</span>}
        </td>

        {/* Status Toggle */}
        <td className="py-3 px-4">
          <button
            onClick={onToggleActive}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
              coupon.is_active ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
              coupon.is_active ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
            }`} />
          </button>
        </td>

        {/* Valid Until */}
        <td className="py-3 px-4 text-gray-500 text-xs">
          {formatDate(coupon.valid_until)}
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRedemptions}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline px-2 py-1 rounded hover:bg-purple-50"
            >
              {isExpanded ? 'Hide' : 'Redemptions'}
            </button>
            <button
              onClick={onDelete}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Redemptions */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-gray-50/80 px-4 py-3">
            {loadingRedemptions ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : redemptionList && redemptionList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left py-1.5 px-3 font-semibold">Hospital</th>
                      <th className="text-left py-1.5 px-3 font-semibold">Plan</th>
                      <th className="text-left py-1.5 px-3 font-semibold">Discount Applied</th>
                      <th className="text-left py-1.5 px-3 font-semibold">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptionList.map((r, i) => (
                      <tr key={i} className="border-t border-gray-200/60">
                        <td className="py-1.5 px-3 text-gray-700 font-medium">{r.hospital_name || r.hospital_id}</td>
                        <td className="py-1.5 px-3 text-gray-600 capitalize">{r.plan_tier}</td>
                        <td className="py-1.5 px-3 text-gray-600">{r.discount_applied != null ? '\u20B9' + (r.discount_applied / 100).toLocaleString('en-IN') : '—'}</td>
                        <td className="py-1.5 px-3 text-gray-500">{formatDate(r.redeemed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">No redemptions yet</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
