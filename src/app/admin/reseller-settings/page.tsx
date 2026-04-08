'use client';

import { useState } from 'react';

export default function ResellerSettingsPage() {
  var [tiers, setTiers] = useState([
    { name: 'Bronze', minReferrals: 0, pct: 20, frequency: 'monthly' },
    { name: 'Silver', minReferrals: 5, pct: 25, frequency: 'monthly' },
    { name: 'Gold', minReferrals: 15, pct: 30, frequency: 'weekly' },
  ]);
  var [minPayout, setMinPayout] = useState(500);
  var [bonusDays, setBonusDays] = useState(7);
  var [toast, setToast] = useState('');

  function updateTier(idx: number, field: string, value: string | number) {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }

  function save() { setToast('Settings saved'); setTimeout(() => setToast(''), 3000); }

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reseller Settings</h1>

      {/* Commission tiers */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Commission tiers</h3>
        <div className="space-y-3">
          {tiers.map((t, i) => (
            <div key={t.name} className="grid grid-cols-4 gap-3 items-end" style={{ paddingBottom: 8, borderBottom: '0.5px solid #E5E5E3' }}>
              <div><label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Tier</label><input value={t.name} onChange={e => updateTier(i, 'name', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></div>
              <div><label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Min referrals</label><input type="number" value={t.minReferrals} onChange={e => updateTier(i, 'minReferrals', Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></div>
              <div><label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Commission %</label><input type="number" value={t.pct} onChange={e => updateTier(i, 'pct', Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></div>
              <div><label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Payout</label>
                <select value={t.frequency} onChange={e => updateTier(i, 'frequency', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-transparent">
                  <option value="monthly">Monthly</option><option value="biweekly">Biweekly</option><option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Payout settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Minimum payout (Rs.)</label>
            <input type="number" value={minPayout} onChange={e => setMinPayout(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Payout method</label>
            <input value="Bank transfer" disabled className="w-full border border-gray-300 rounded px-2 py-1 text-sm opacity-60" />
          </div>
        </div>
      </div>

      {/* Referral bonus */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Referral bonus</h3>
        <div>
          <label style={{ fontSize: 10, color: '#78776F', display: 'block', marginBottom: 2 }}>Extra trial days for referred users</label>
          <input type="number" value={bonusDays} onChange={e => setBonusDays(Number(e.target.value))} className="w-32 border border-gray-300 rounded px-2 py-1 text-sm" />
          <span style={{ fontSize: 10, color: '#78776F', marginLeft: 6 }}>days</span>
        </div>
      </div>

      <button onClick={save} style={{ fontSize: 12, fontWeight: 600, color: '#fff', backgroundColor: '#534AB7', border: 'none', borderRadius: 6, padding: '8px 24px', cursor: 'pointer' }}>Save settings</button>

      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium">{toast}</div>}
    </div>
  );
}
