'use client';

import { useEffect, useState } from 'react';

interface Settings {
  markup_percent: number;
  fallback_price_in: number;
  fallback_price_com: number;
  fallback_price_org: number;
  gst_percent: number;
}

export default function DomainSettingsPage() {
  var [settings, setSettings] = useState<Settings>({
    markup_percent: 25,
    fallback_price_in: 550,
    fallback_price_com: 900,
    fallback_price_org: 800,
    gst_percent: 18,
  });
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [message, setMessage] = useState('');

  useEffect(function () {
    fetch('/api/presence-pricing-admin/domain-settings')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.settings) {
          setSettings({
            markup_percent: data.settings.markup_percent ?? 25,
            fallback_price_in: data.settings.fallback_price_in ?? 550,
            fallback_price_com: data.settings.fallback_price_com ?? 900,
            fallback_price_org: data.settings.fallback_price_org ?? 800,
            gst_percent: data.settings.gst_percent ?? 18,
          });
        }
      })
      .catch(function () { setMessage('Failed to load settings'); })
      .finally(function () { setLoading(false); });
  }, []);

  function handleSave() {
    setSaving(true);
    setMessage('');
    fetch('/api/presence-pricing-admin/domain-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          setMessage('Settings saved!');
        } else {
          setMessage('Error: ' + (data.error || 'Unknown'));
        }
      })
      .catch(function () { setMessage('Network error'); })
      .finally(function () { setSaving(false); });
  }

  function update(field: keyof Settings, value: string) {
    setSettings(function (prev) { return { ...prev, [field]: parseInt(value, 10) || 0 }; });
  }

  if (loading) {
    return <div className="p-8 text-slate-400">Loading domain settings...</div>;
  }

  var fields: { key: keyof Settings; label: string; hint: string }[] = [
    { key: 'markup_percent', label: 'Domain Markup %', hint: 'Applied on top of ResellerClub cost price' },
    { key: 'fallback_price_in', label: 'Fallback .in Price (INR)', hint: 'Used when RC API is unavailable' },
    { key: 'fallback_price_com', label: 'Fallback .com Price (INR)', hint: 'Used when RC API is unavailable' },
    { key: 'fallback_price_org', label: 'Fallback .org Price (INR)', hint: 'Used when RC API is unavailable' },
    { key: 'gst_percent', label: 'GST %', hint: 'Applied on selling price' },
  ];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-1">Domain Pricing Settings</h1>
      <p className="text-sm text-slate-400 mb-6">Controls pricing for all domain purchases across MediHost</p>

      <div className="space-y-4">
        {fields.map(function (f) {
          return (
            <div key={f.key} className="space-y-1">
              <label className="block text-sm font-medium text-slate-300">{f.label}</label>
              <input
                type="number"
                value={settings[f.key]}
                onChange={function (e) { update(f.key, e.target.value); }}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
              />
              <p className="text-[11px] text-slate-500">{f.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs font-bold text-slate-300 mb-2">Preview (.in domain)</p>
        <p className="text-xs text-slate-400">
          Base: ₹{settings.fallback_price_in} + {settings.markup_percent}% markup = ₹{Math.round(settings.fallback_price_in * (1 + settings.markup_percent / 100))} selling
        </p>
        <p className="text-xs text-slate-400">
          + {settings.gst_percent}% GST = ₹{Math.round(settings.fallback_price_in * (1 + settings.markup_percent / 100) * (1 + settings.gst_percent / 100))} total
        </p>
      </div>

      {message && (
        <div className={'mt-4 p-3 rounded-lg text-sm ' + (message.startsWith('Error') || message === 'Network error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400')}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-5 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <a href="/admin" className="block text-center text-sm text-slate-500 hover:text-slate-300 mt-4 transition-colors">
        ← Back to Admin
      </a>
    </div>
  );
}
