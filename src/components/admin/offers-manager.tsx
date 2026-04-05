"use client";

import { useState } from 'react';

type DiscountType = 'percent' | 'flat' | 'trial';

interface Offer {
  id: number;
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  plans: string[];
  maxUses: number;
  used: number;
  banner: string;
  active: boolean;
}

const ALL_PLANS = ['Starter', 'Professional', 'Business', 'Enterprise'];

const INITIAL_OFFERS: Offer[] = [
  { id: 1, code: 'WELCOME20', name: 'Welcome Discount', discountType: 'percent', value: 20, plans: ['Starter', 'Professional'], maxUses: 100, used: 34, banner: 'Get 20% off on your first subscription!', active: true },
  { id: 2, code: 'STARTER50', name: 'Starter Bonus', discountType: 'flat', value: 500, plans: ['Starter'], maxUses: 50, used: 12, banner: 'Save ₹500 on Starter plan', active: true },
  { id: 3, code: 'TRIAL30', name: 'Extended Trial', discountType: 'trial', value: 30, plans: ['Starter', 'Professional', 'Business'], maxUses: 200, used: 89, banner: 'Get 30 days free trial!', active: true },
  { id: 4, code: 'ANNUAL15', name: 'Annual Discount', discountType: 'percent', value: 15, plans: ['Professional', 'Business', 'Enterprise'], maxUses: 75, used: 21, banner: '15% off on yearly plans', active: false },
];

const DISCOUNT_LABELS: Record<DiscountType, string> = { percent: 'Percent', flat: 'Flat (INR)', trial: 'Trial Days' };

function formatDiscount(type: DiscountType, value: number) {
  if (type === 'percent') return `${value}% off`;
  if (type === 'flat') return `₹${value} off`;
  return `${value} day trial`;
}

const EMPTY_OFFER: Omit<Offer, 'id'> = { code: '', name: '', discountType: 'percent', value: 0, plans: [], maxUses: 100, used: 0, banner: '', active: true };

export function OffersManager() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Omit<Offer, 'id'>>(EMPTY_OFFER);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setForm({ ...EMPTY_OFFER });
    setEditOffer(null);
    setIsCreating(true);
  }

  function openEdit(offer: Offer) {
    setForm({ code: offer.code, name: offer.name, discountType: offer.discountType, value: offer.value, plans: [...offer.plans], maxUses: offer.maxUses, used: offer.used, banner: offer.banner, active: offer.active });
    setEditOffer(offer);
    setIsCreating(true);
  }

  function handleSave() {
    if (editOffer) {
      setOffers(prev => prev.map(o => o.id === editOffer.id ? { ...o, ...form } : o));
      showToast(`Offer ${form.code} updated`);
    } else {
      setOffers(prev => [...prev, { ...form, id: Date.now() }]);
      showToast(`Offer ${form.code} created`);
    }
    setIsCreating(false);
    setEditOffer(null);
  }

  function handleDelete(id: number) {
    setOffers(prev => prev.filter(o => o.id !== id));
    showToast('Offer deleted');
  }

  function toggleActive(id: number) {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  }

  function togglePlan(plan: string) {
    setForm(prev => ({
      ...prev,
      plans: prev.plans.includes(plan) ? prev.plans.filter(p => p !== plan) : [...prev.plans, plan],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount codes and promotions</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700">Create Offer</button>
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
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">{formatDiscount(o.discountType, o.value)}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{o.plans.join(', ')}</td>
                  <td className="py-3 px-4 text-gray-600">{o.used} / {o.maxUses}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(o.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {o.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(o)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(o.id)} className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline">Delete</button>
                    </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    placeholder="WELCOME20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Welcome Discount"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value as DiscountType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="percent">Percent</option>
                    <option value="flat">Flat (INR)</option>
                    <option value="trial">Trial Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={e => setForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plans</label>
                <div className="flex flex-wrap gap-3">
                  {ALL_PLANS.map(plan => (
                    <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.plans.includes(plan)}
                        onChange={() => togglePlan(plan)}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{plan}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={e => setForm(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                <input
                  type="text"
                  value={form.banner}
                  onChange={e => setForm(prev => ({ ...prev, banner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Get 20% off on your first subscription!"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!form.code || !form.name} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50">
                {editOffer ? 'Update Offer' : 'Create Offer'}
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
