"use client";

import { useState, useEffect } from 'react';
import { getTokenFromClient } from '@/lib/auth';

type DiscountType = 'percent' | 'flat' | 'domain_free' | 'trial_days';

interface Offer {
  id: string;
  code: string;
  name: string;
  discount_type: DiscountType;
  discount_value: number;
  applicable_plans: string[];
  valid_from: number | null;
  valid_until: number | null;
  max_uses: number | null;
  times_used: number;
  banner_text: string;
  is_active: boolean;
}

const ALL_PLANS = ['starter', 'growth', 'professional', 'enterprise'];
const DISCOUNT_LABELS: Record<string, string> = { percent: 'Percent', flat: 'Flat (INR)', domain_free: 'Free Domain', trial_days: 'Trial Days' };

function formatDiscount(type: string, value: number) {
  if (type === 'percent') return value + '% off';
  if (type === 'flat') return '\u20B9' + value + ' off';
  if (type === 'domain_free') return 'Free domain';
  return value + ' day trial';
}

interface OfferForm {
  code: string;
  name: string;
  discount_type: DiscountType;
  discount_value: number;
  applicable_plans: string[];
  max_uses: number | null;
  banner_text: string;
  is_active: boolean;
  valid_from: number | null;
  valid_until: number | null;
}

const EMPTY_FORM: OfferForm = { code: '', name: '', discount_type: 'percent', discount_value: 0, applicable_plans: [], max_uses: 100, banner_text: '', is_active: true, valid_from: null, valid_until: null };

export function OffersManager() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function loadOffers() {
    try {
      var token = getTokenFromClient();
      var res = await fetch('/api/admin/offers', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      });
      var data = await res.json();
      if (data.success && data.offers) {
        setOffers(data.offers);
      }
    } catch {
      showToast('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOffers(); }, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditOffer(null);
    setIsCreating(true);
  }

  function openEdit(offer: Offer) {
    setForm({
      code: offer.code,
      name: offer.name,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      applicable_plans: offer.applicable_plans || [],
      max_uses: offer.max_uses,
      banner_text: offer.banner_text || '',
      is_active: offer.is_active,
      valid_from: offer.valid_from,
      valid_until: offer.valid_until,
    });
    setEditOffer(offer);
    setIsCreating(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      var token = getTokenFromClient();
      if (editOffer) {
        var res = await fetch('/api/admin/offers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ id: editOffer.id, ...form }),
        });
        var data = await res.json();
        if (data.success) {
          showToast('Offer ' + form.code + ' updated');
          await loadOffers();
        } else {
          showToast('Error: ' + (data.error || 'Update failed'));
        }
      } else {
        var res2 = await fetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify(form),
        });
        var data2 = await res2.json();
        if (data2.success) {
          showToast('Offer ' + form.code + ' created');
          await loadOffers();
        } else {
          showToast('Error: ' + (data2.error || 'Create failed'));
        }
      }
      setIsCreating(false);
      setEditOffer(null);
    } catch {
      showToast('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(offer: Offer) {
    try {
      var token = getTokenFromClient();
      var res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          id: offer.id,
          code: offer.code,
          name: offer.name,
          discount_type: offer.discount_type,
          discount_value: offer.discount_value,
          applicable_plans: offer.applicable_plans,
          valid_from: offer.valid_from,
          valid_until: offer.valid_until,
          max_uses: offer.max_uses,
          banner_text: offer.banner_text,
          is_active: !offer.is_active,
        }),
      });
      var data = await res.json();
      if (data.success) {
        setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
        showToast(offer.code + ' ' + (!offer.is_active ? 'activated' : 'deactivated'));
      }
    } catch {
      showToast('Failed to toggle offer');
    }
  }

  function togglePlan(plan: string) {
    setForm(prev => ({
      ...prev,
      applicable_plans: prev.applicable_plans.includes(plan) ? prev.applicable_plans.filter(p => p !== plan) : [...prev.applicable_plans, plan],
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">{offers.length} offers loaded from database</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">Create Offer</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Discount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Plans</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Usage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{o.code}</td>
                  <td className="py-3 px-4 text-gray-700">{o.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">{formatDiscount(o.discount_type, o.discount_value)}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{(o.applicable_plans || []).join(', ')}</td>
                  <td className="py-3 px-4 text-gray-600">{o.times_used || 0}{o.max_uses ? ' / ' + o.max_uses : ''}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(o)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {o.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => openEdit(o)} className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No offers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-10 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 mb-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{editOffer ? 'Edit Offer' : 'Create Offer'}</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="LAUNCH20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Launch 20% off"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm(prev => ({ ...prev, discount_type: e.target.value as DiscountType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(DISCOUNT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={e => setForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plans</label>
                <div className="flex flex-wrap gap-3">
                  {ALL_PLANS.map(plan => (
                    <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={form.applicable_plans.includes(plan)}
                        onChange={() => togglePlan(plan)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>{plan}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (blank = unlimited)</label>
                <input
                  type="number"
                  value={form.max_uses || ''}
                  onChange={e => setForm(prev => ({ ...prev, max_uses: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                <input
                  type="text"
                  value={form.banner_text}
                  onChange={e => setForm(prev => ({ ...prev, banner_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Launch offer: 20% off your first 3 months!"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!form.code || !form.name || saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : editOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
