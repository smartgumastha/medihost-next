"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface Feature {
  id: string;
  feature_key: string;
  feature_value: string;
}

interface Pricing {
  country_code: string;
  currency: string;
  monthly_price: number;
  yearly_price: number;
}

interface PlanData {
  plan_tier: string;
  features: Feature[];
  pricing: Pricing[];
}

interface Subscription {
  hospital_id: string;
  hospital_name: string;
  plan_tier: string;
  status: string;
  trial_ends_at: number | null;
  current_period_end: number | null;
  partner_email: string;
}

// ── Constants ──────────────────────────────────────────────

const TABS = ['Feature Matrix', 'Pricing Editor', 'Subscriptions'] as const;
type Tab = typeof TABS[number];

const TIERS = ['free', 'growth', 'professional', 'enterprise'];
const TIER_LABELS: Record<string, string> = { free: 'Free', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise' };
const TIER_COLORS: Record<string, string> = { free: 'border-t-gray-400', growth: 'border-t-blue-500', professional: 'border-t-purple-500', enterprise: 'border-t-amber-500' };

const COUNTRIES = [
  { code: 'IN', label: 'India', symbol: '\u20B9' },
  { code: 'US', label: 'United States', symbol: '$' },
  { code: 'GB', label: 'United Kingdom', symbol: '\u00A3' },
  { code: 'AE', label: 'UAE', symbol: '\u062F.\u0625' },
  { code: 'NG', label: 'Nigeria', symbol: '\u20A6' },
  { code: 'KE', label: 'Kenya', symbol: 'KSh' },
  { code: 'PH', label: 'Philippines', symbol: '\u20B1' },
];

const STATUS_STYLES: Record<string, string> = {
  trial: 'bg-blue-50 text-blue-700',
  trialing: 'bg-blue-50 text-blue-700',
  active: 'bg-emerald-50 text-emerald-700',
  past_due: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-600',
  canceled: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-50 text-red-700',
};

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function jsonHeaders(): Record<string, string> {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function formatDate(ts: number | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function PlanManagement() {
  const [tab, setTab] = useState<Tab>('Feature Matrix');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plans & Pricing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage features, pricing tiers, and subscriptions</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            style={tab === t ? { backgroundColor: '#534AB7' } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Feature Matrix' && <FeatureMatrix showToast={showToast} />}
      {tab === 'Pricing Editor' && <PricingEditor showToast={showToast} />}
      {tab === 'Subscriptions' && <SubscriptionsTab showToast={showToast} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Feature Matrix ──────────────────────────────────

function FeatureMatrix({ showToast }: { showToast: (m: string) => void }) {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeature, setNewFeature] = useState({ feature_key: '', default_value: 'false', description: '' });

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/plans', { headers: authHeaders() });
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      } else {
        setError(data.error || 'Failed to load plans');
      }
    } catch {
      setError('Network error loading plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Collect all unique feature keys across all plans
  const allFeatureKeys: string[] = [];
  const keySet = new Set<string>();
  for (const plan of plans) {
    for (const f of plan.features) {
      if (!keySet.has(f.feature_key)) {
        keySet.add(f.feature_key);
        allFeatureKeys.push(f.feature_key);
      }
    }
  }

  // Group by prefix
  const groups: Record<string, string[]> = {};
  for (const key of allFeatureKeys) {
    const prefix = key.includes('_') ? key.split('_')[0] : 'general';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }

  function getFeatureValue(planTier: string, featureKey: string): string {
    const plan = plans.find(p => p.plan_tier === planTier);
    const feat = plan?.features.find(f => f.feature_key === featureKey);
    return feat?.feature_value ?? 'false';
  }

  function isBoolean(val: string): boolean {
    return val === 'true' || val === 'false';
  }

  async function saveFeature(featureKey: string, planTier: string, featureValue: string) {
    const saveKey = `${planTier}:${featureKey}`;
    setSaving(saveKey);
    try {
      const res = await fetch('/api/admin/plans/features', {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({ feature_key: featureKey, plan_tier: planTier, feature_value: featureValue }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans(prev => prev.map(p => {
          if (p.plan_tier !== planTier) return p;
          const features = p.features.map(f =>
            f.feature_key === featureKey ? { ...f, feature_value: featureValue } : f
          );
          // If feature didn't exist for this plan, add it
          if (!features.find(f => f.feature_key === featureKey)) {
            features.push({ id: '', feature_key: featureKey, feature_value: featureValue });
          }
          return { ...p, features };
        }));
        showToast(`${featureKey} updated for ${planTier}`);
      } else {
        showToast('Error: ' + (data.error || 'Save failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setSaving('');
    }
  }

  async function addFeature() {
    if (!newFeature.feature_key.trim()) return;
    setSaving('adding');
    try {
      const res = await fetch('/api/admin/plans/features/add', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(newFeature),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Feature added');
        setNewFeature({ feature_key: '', default_value: 'false', description: '' });
        setShowAddForm(false);
        load();
      } else {
        showToast('Error: ' + (data.error || 'Add failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setSaving('');
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
        <span className="text-sm text-red-700 font-medium">{error}</span>
        <button onClick={load} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider min-w-[200px]">Feature</th>
                {TIERS.map(tier => (
                  <th key={tier} className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider min-w-[120px]">
                    {TIER_LABELS[tier]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([prefix, keys]) => (
                <GroupRows
                  key={prefix}
                  prefix={prefix}
                  keys={keys}
                  getFeatureValue={getFeatureValue}
                  isBoolean={isBoolean}
                  saving={saving}
                  onSave={saveFeature}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Feature */}
      {showAddForm ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="text-sm font-bold text-gray-800">Add New Feature</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="feature_key (e.g. max_staff)"
              value={newFeature.feature_key}
              onChange={e => setNewFeature(prev => ({ ...prev, feature_key: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              placeholder="Default value"
              value={newFeature.default_value}
              onChange={e => setNewFeature(prev => ({ ...prev, default_value: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              placeholder="Description"
              value={newFeature.description}
              onChange={e => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addFeature}
              disabled={saving === 'adding'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {saving === 'adding' ? 'Adding...' : 'Add Feature'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 border border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors w-full"
        >
          + Add Feature
        </button>
      )}
    </div>
  );
}

function GroupRows({
  prefix,
  keys,
  getFeatureValue,
  isBoolean,
  saving,
  onSave,
}: {
  prefix: string;
  keys: string[];
  getFeatureValue: (tier: string, key: string) => string;
  isBoolean: (val: string) => boolean;
  saving: string;
  onSave: (key: string, tier: string, val: string) => void;
}) {
  return (
    <>
      {keys.length > 1 && (
        <tr>
          <td colSpan={5} className="py-2 px-4 bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {prefix}
          </td>
        </tr>
      )}
      {keys.map(key => (
        <tr key={key} className="border-b border-gray-100 hover:bg-gray-50/50">
          <td className="py-2.5 px-4 text-sm text-gray-700 font-medium">
            {key.replace(/_/g, ' ')}
          </td>
          {TIERS.map(tier => {
            const val = getFeatureValue(tier, key);
            const isBool = isBoolean(val);
            const cellKey = `${tier}:${key}`;
            return (
              <td key={tier} className="py-2.5 px-4 text-center">
                {isBool ? (
                  <button
                    onClick={() => onSave(key, tier, val === 'true' ? 'false' : 'true')}
                    disabled={saving === cellKey}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      val === 'true' ? 'bg-emerald-500' : 'bg-gray-300'
                    } ${saving === cellKey ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                      val === 'true' ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                ) : (
                  <input
                    type="text"
                    defaultValue={val}
                    onBlur={e => {
                      if (e.target.value !== val) onSave(key, tier, e.target.value);
                    }}
                    className="w-20 text-center px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

// ── Tab 2: Pricing Editor ──────────────────────────────────

function PricingEditor({ showToast }: { showToast: (m: string) => void }) {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('IN');
  const [editing, setEditing] = useState<{ tier: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/plans', { headers: authHeaders() });
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      } else {
        setError(data.error || 'Failed to load');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedCountry = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  function getPricing(tier: string): Pricing | undefined {
    const plan = plans.find(p => p.plan_tier === tier);
    return plan?.pricing.find(p => p.country_code === country);
  }

  function displayPrice(paise: number): string {
    return (paise / 100).toLocaleString('en-IN');
  }

  function startEdit(tier: string, field: 'monthly_price' | 'yearly_price') {
    const pricing = getPricing(tier);
    const raw = pricing ? pricing[field] : 0;
    setEditing({ tier, field });
    setEditValue(String(raw / 100));
  }

  async function savePrice() {
    if (!editing) return;
    const { tier, field } = editing;
    const pricing = getPricing(tier);
    const paise = Math.round(Number(editValue) * 100);
    if (isNaN(paise) || paise < 0) {
      showToast('Invalid price');
      return;
    }

    setSaving(`${tier}:${field}`);
    try {
      const body: Record<string, unknown> = {
        plan_tier: tier,
        country_code: country,
      };
      if (field === 'monthly_price') {
        body.monthly_price = paise;
        body.yearly_price = pricing?.yearly_price ?? 0;
      } else {
        body.yearly_price = paise;
        body.monthly_price = pricing?.monthly_price ?? 0;
      }

      const res = await fetch('/api/admin/plans/pricing', {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setPlans(prev => prev.map(p => {
          if (p.plan_tier !== tier) return p;
          const pricingArr = p.pricing.map(pr => {
            if (pr.country_code !== country) return pr;
            return { ...pr, [field]: paise };
          });
          // If pricing didn't exist for this country, add it
          if (!pricingArr.find(pr => pr.country_code === country)) {
            pricingArr.push({
              country_code: country,
              currency: selectedCountry.symbol,
              monthly_price: field === 'monthly_price' ? paise : 0,
              yearly_price: field === 'yearly_price' ? paise : 0,
            });
          }
          return { ...p, pricing: pricingArr };
        }));
        showToast(`${TIER_LABELS[tier]} ${field.replace('_', ' ')} updated`);
      } else {
        showToast('Error: ' + (data.error || 'Save failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setSaving('');
      setEditing(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
        <span className="text-sm text-red-700 font-medium">{error}</span>
        <button onClick={load} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Country:</label>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.label} ({c.symbol})</option>
          ))}
        </select>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TIERS.map(tier => {
          const pricing = getPricing(tier);
          const monthly = pricing?.monthly_price ?? 0;
          const yearly = pricing?.yearly_price ?? 0;
          const isPopular = tier === 'professional';

          return (
            <div
              key={tier}
              className={`bg-white border border-t-[3px] rounded-xl p-5 shadow-sm ${TIER_COLORS[tier]} ${
                isPopular ? 'ring-2 ring-purple-100 border-purple-300' : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <div className="text-center mb-3">
                  <span className="px-3 py-0.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-lg font-bold text-gray-900 mb-1">{TIER_LABELS[tier]}</div>
              <div className="text-xs text-gray-400 font-mono mb-5">{tier}</div>

              {/* Monthly */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1">Monthly</div>
                {editing?.tier === tier && editing?.field === 'monthly_price' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">{selectedCountry.symbol}</span>
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={savePrice}
                      onKeyDown={e => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditing(null); }}
                      className="w-full px-2 py-1 border border-purple-400 rounded text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(tier, 'monthly_price')}
                    className="text-2xl font-bold text-gray-900 hover:text-purple-700 transition-colors cursor-pointer"
                    disabled={saving.startsWith(tier)}
                  >
                    {selectedCountry.symbol}{displayPrice(monthly)}
                    <span className="text-xs text-gray-400 font-normal">/mo</span>
                  </button>
                )}
              </div>

              {/* Yearly */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Yearly</div>
                {editing?.tier === tier && editing?.field === 'yearly_price' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">{selectedCountry.symbol}</span>
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={savePrice}
                      onKeyDown={e => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditing(null); }}
                      className="w-full px-2 py-1 border border-purple-400 rounded text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(tier, 'yearly_price')}
                    className="text-2xl font-bold text-gray-900 hover:text-purple-700 transition-colors cursor-pointer"
                    disabled={saving.startsWith(tier)}
                  >
                    {selectedCountry.symbol}{displayPrice(yearly)}
                    <span className="text-xs text-gray-400 font-normal">/yr</span>
                  </button>
                )}
              </div>

              {yearly > 0 && monthly > 0 && (
                <div className="mt-3 text-xs text-emerald-600 font-medium">
                  Save {Math.round(100 - (yearly / (monthly * 12)) * 100)}% yearly
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Subscriptions ───────���───────────────────────────

function SubscriptionsTab({ showToast }: { showToast: (m: string) => void }) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [override, setOverride] = useState<Subscription | null>(null);
  const [overrideForm, setOverrideForm] = useState({ plan_tier: '', status: '' });
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filterStatus) params.set('status', filterStatus);
      if (filterTier) params.set('plan_tier', filterTier);

      const res = await fetch(`/api/admin/plans/subscriptions?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.subscriptions) {
        setSubs(data.subscriptions);
        setTotal(data.total || data.subscriptions.length);
      } else {
        setError(data.error || 'Failed to load');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterTier]);

  useEffect(() => { load(); }, [load]);

  async function saveOverride() {
    if (!override) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/plans/subscriptions/${override.hospital_id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(overrideForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Subscription updated');
        setOverride(null);
        load();
      } else {
        showToast('Error: ' + (data.error || 'Save failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  if (loading && subs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
        <span className="text-sm text-red-700 font-medium">{error}</span>
        <button onClick={load} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Statuses</option>
          {['trial', 'trialing', 'active', 'past_due', 'cancelled', 'expired'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterTier}
          onChange={e => { setFilterTier(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Plans</option>
          {TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hospital</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Trial Ends</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Period End</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => (
                <tr key={sub.hospital_id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{sub.hospital_name || sub.hospital_id}</div>
                    {sub.partner_email && <div className="text-xs text-gray-400">{sub.partner_email}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {TIER_LABELS[sub.plan_tier] || sub.plan_tier}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[sub.status] || 'bg-gray-100 text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(sub.trial_ends_at)}</td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(sub.current_period_end)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setOverride(sub);
                        setOverrideForm({ plan_tier: sub.plan_tier, status: sub.status });
                      }}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline px-3 py-1.5 rounded-md hover:bg-purple-50"
                    >
                      Override
                    </button>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Page {page} of {totalPages} ({total} total)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Override Modal */}
      {override && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOverride(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Override Subscription</h3>
            <p className="text-sm text-gray-500">{override.hospital_name || override.hospital_id}</p>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Plan Tier</label>
              <select
                value={overrideForm.plan_tier}
                onChange={e => setOverrideForm(prev => ({ ...prev, plan_tier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={overrideForm.status}
                onChange={e => setOverrideForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {['trial', 'trialing', 'active', 'past_due', 'cancelled', 'expired'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveOverride}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Override'}
              </button>
              <button
                onClick={() => setOverride(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
