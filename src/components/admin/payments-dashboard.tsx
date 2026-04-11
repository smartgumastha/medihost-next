"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface Stats {
  total_revenue: number;
  revenue_this_month: number;
  revenue_today: number;
  failed_payments: number;
  total_customers: number;
  active_subscribers: number;
  trial_users: number;
}

interface Payment {
  id: string;
  hospital_id: string;
  hospital_name: string;
  plan_tier: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id: string;
  created_at: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  hospital_id: string;
  hospital_name: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  created_at: number;
}

interface DomainEntry {
  domain: string;
  hospital_id: string;
  hospital_name: string;
  status: string;
  registered_at: number;
  expires_at: number;
  auto_renew: boolean;
}

interface PlanRevenue {
  plan_tier: string;
  total_revenue: number;
  subscriber_count: number;
}

interface MonthRevenue {
  month: string;
  revenue: number;
  new_subscribers: number;
  churned: number;
}

// ── Constants ──────────────────────────────────────────────

const TABS = ['Payments', 'Invoices', 'Domains'] as const;
type Tab = typeof TABS[number];

const PAYMENT_STATUS: Record<string, string> = {
  captured: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-amber-50 text-amber-700',
  pending: 'bg-blue-50 text-blue-700',
  created: 'bg-blue-50 text-blue-700',
};

const DOMAIN_STATUS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  expired: 'bg-red-50 text-red-700',
};

const TIER_LABELS: Record<string, string> = { free: 'Free', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise' };
const TIER_BAR_COLORS: Record<string, string> = { free: 'bg-gray-400', growth: 'bg-blue-500', professional: 'bg-purple-500', enterprise: 'bg-amber-500' };

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function inr(paise: number): string {
  return '\u20B9' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(ts: number | null): string {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function PaymentsDashboard() {
  const [tab, setTab] = useState<Tab>('Payments');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments & Revenue</h1>
        <p className="text-sm text-gray-500 mt-1">Track revenue, payments, invoices, and domains</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            style={tab === t ? { backgroundColor: '#534AB7' } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Payments' && <PaymentsTab />}
      {tab === 'Invoices' && <InvoicesTab />}
      {tab === 'Domains' && <DomainsTab />}
    </div>
  );
}

// ── Tab 1: Payments ────────────────────────────────────────

function PaymentsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [byPlan, setByPlan] = useState<PlanRevenue[]>([]);
  const [byMonth, setByMonth] = useState<MonthRevenue[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const limit = 20;

  // Load stats + charts (independent, don't block each other)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/plans/payments/stats', { headers: authHeaders() });
        const data = await res.json();
        if (data.total_revenue !== undefined) setStats(data);
      } catch { /* graceful */ }
      finally { setStatsLoading(false); }
    })();

    (async () => {
      try {
        const res = await fetch('/api/admin/plans/revenue/by-plan', { headers: authHeaders() });
        const data = await res.json();
        if (data.data) setByPlan(data.data);
      } catch { /* graceful */ }
    })();

    (async () => {
      try {
        const res = await fetch('/api/admin/plans/revenue/by-month', { headers: authHeaders() });
        const data = await res.json();
        if (data.data) setByMonth(data.data);
      } catch { /* graceful */ }
    })();
  }, []);

  // Load payments table
  const loadPayments = useCallback(async () => {
    setPaymentsError('');
    setPaymentsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/admin/plans/payments?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
        setTotal(data.total || data.payments.length);
      } else {
        setPaymentsError(data.error || 'Failed to load payments');
      }
    } catch {
      setPaymentsError('Network error');
    } finally {
      setPaymentsLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const totalPages = Math.ceil(total / limit) || 1;

  // Stats cards config
  const statCards = stats ? [
    { label: 'Total Revenue', value: inr(stats.total_revenue), border: 'border-t-emerald-500', accent: 'text-emerald-600' },
    { label: 'This Month', value: inr(stats.revenue_this_month), border: 'border-t-blue-500', accent: 'text-blue-600' },
    { label: 'Today', value: inr(stats.revenue_today), border: 'border-t-purple-500', accent: 'text-purple-600' },
    { label: 'Active Subscribers', value: String(stats.active_subscribers || 0), border: 'border-t-emerald-500', accent: 'text-emerald-600' },
    { label: 'Trial Users', value: String(stats.trial_users || 0), border: 'border-t-amber-500', accent: 'text-amber-600' },
    { label: 'Failed Payments', value: String(stats.failed_payments || 0), border: stats.failed_payments > 0 ? 'border-t-red-500' : 'border-t-gray-400', accent: stats.failed_payments > 0 ? 'text-red-600' : 'text-gray-600' },
  ] : null;

  const maxPlanRev = Math.max(...byPlan.map(p => p.total_revenue), 1);
  const maxMonthRev = Math.max(...byMonth.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading
          ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : statCards
            ? statCards.map(s => (
                <div key={s.label} className={`bg-white rounded-xl border border-gray-200 border-t-[3px] ${s.border} p-4 shadow-sm`}>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{s.value}</div>
                </div>
              ))
            : [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 border-t-[3px] border-t-gray-300 p-4 shadow-sm">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">—</div>
                  <div className="text-xl font-bold text-gray-300 mt-1">{i < 3 ? '\u20B90' : '0'}</div>
                </div>
              ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Revenue by Plan</h3>
          {byPlan.length > 0 ? (
            <div className="space-y-3.5">
              {byPlan.map(item => (
                <div key={item.plan_tier} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-600 font-medium">{TIER_LABELS[item.plan_tier] || item.plan_tier}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                    <div
                      className={`h-full ${TIER_BAR_COLORS[item.plan_tier] || 'bg-gray-400'} rounded-full flex items-center justify-end pr-2.5 transition-all duration-500`}
                      style={{ width: `${Math.max((item.total_revenue / maxPlanRev) * 100, 12)}%` }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow-sm">{inr(item.total_revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Monthly Trend</h3>
          {byMonth.length > 0 ? (
            <div className="flex items-end gap-1 justify-center" style={{ height: 160 }}>
              {byMonth.slice(-12).map(item => {
                const heightPct = (item.revenue / maxMonthRev) * 100;
                return (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-bold text-gray-600 mb-1">{inr(item.revenue)}</span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 mt-1.5 truncate w-full text-center">{item.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Statuses</option>
          {['captured', 'paid', 'failed', 'refunded', 'pending', 'created'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      {paymentsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm text-red-700 font-medium">{paymentsError}</span>
          <button onClick={loadPayments} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
        </div>
      )}

      {paymentsLoading && payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hospital</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Razorpay ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{p.hospital_name || p.hospital_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {TIER_LABELS[p.plan_tier] || p.plan_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{inr(p.amount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{p.razorpay_payment_id || '\u2014'}</td>
                  </tr>
                ))}
                {payments.length === 0 && !paymentsLoading && (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {payments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Invoices ────────────────────────────────────────

function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/plans/invoices', { headers: authHeaders() });
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      } else {
        setError(data.error || 'Failed to load invoices');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Invoice #</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hospital</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tax</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-mono font-bold text-gray-900">{inv.invoice_number}</td>
                <td className="py-3 px-4 text-gray-700">{inv.hospital_name || inv.hospital_id}</td>
                <td className="py-3 px-4 text-gray-600">{inr(inv.amount)}</td>
                <td className="py-3 px-4 text-gray-500">{inr(inv.tax_amount)}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{inr(inv.total_amount)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(inv.created_at)}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Domains ─────────────────────────────────────────

function DomainsTab() {
  const [domains, setDomains] = useState<DomainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/plans/domains', { headers: authHeaders() });
      const data = await res.json();
      if (data.domains) {
        setDomains(data.domains);
      } else {
        setError(data.error || 'Failed to load domains');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Domain</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hospital</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Registered</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Expires</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Auto-Renew</th>
            </tr>
          </thead>
          <tbody>
            {domains.map(d => (
              <tr key={d.domain} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-mono font-bold text-gray-900">{d.domain}</td>
                <td className="py-3 px-4 text-gray-700">{d.hospital_name || d.hospital_id}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${DOMAIN_STATUS[d.status] || 'bg-gray-100 text-gray-600'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.registered_at)}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(d.expires_at)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block h-5 w-9 rounded-full ${d.auto_renew ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                      d.auto_renew ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                    }`} />
                  </span>
                </td>
              </tr>
            ))}
            {domains.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No domains registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
