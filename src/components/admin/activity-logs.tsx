"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface EmailLog {
  partner_id: string;
  email_type: string;
  subject: string;
  recipient: string;
  status: string;
  sent_at: number;
  owner_name: string | null;
  business_name: string | null;
}

// ── Constants ──────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  campaign: 'bg-purple-50 text-purple-700',
  welcome: 'bg-teal-50 text-teal-700',
  welcome_day3: 'bg-teal-50 text-teal-700',
  welcome_day7: 'bg-teal-50 text-teal-700',
  nudge_6h: 'bg-teal-50 text-teal-700',
  nudge_24h: 'bg-teal-50 text-teal-700',
  nudge_72h: 'bg-teal-50 text-teal-700',
  trial_expiring: 'bg-amber-50 text-amber-700',
  winback: 'bg-red-50 text-red-700',
  payment_failed: 'bg-red-50 text-red-700',
  payment_failed_reminder: 'bg-red-50 text-red-700',
  payment_pending: 'bg-amber-50 text-amber-700',
  payment_confirmed: 'bg-emerald-50 text-emerald-700',
  admin_invite: 'bg-blue-50 text-blue-700',
  verification: 'bg-blue-50 text-blue-700',
  verification_reminder: 'bg-blue-50 text-blue-700',
  account_ready: 'bg-emerald-50 text-emerald-700',
  plan_changed: 'bg-purple-50 text-purple-700',
  plan_upgraded_thanks: 'bg-purple-50 text-purple-700',
  password_reset: 'bg-gray-100 text-gray-700',
  first_login: 'bg-emerald-50 text-emerald-700',
};

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'trial_expiring', label: 'Trial Expiring' },
  { value: 'winback', label: 'Winback' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'nudge_6h', label: 'Nudge' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'verification', label: 'Verification' },
  { value: 'plan_changed', label: 'Plan Changed' },
];

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function formatDate(ts: number | null): string {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function ActivityLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filterType) params.set('type', filterType);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/campaigns/email-logs?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total || data.logs.length);
      } else {
        setError(data.error || 'Failed to load logs');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [page, filterType, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit) || 1;

  function handleSearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Every email sent by the platform — campaigns, triggers, and system</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {TYPE_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Email or name..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-52"
            />
            <button onClick={handleSearch} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800">
              Go
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 py-2">
          {total} total log{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={load} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
        </div>
      )}

      {/* Table */}
      {loading && logs.length === 0 ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Recipient</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.sent_at)}</td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 text-sm">{log.recipient}</div>
                      {log.owner_name && <div className="text-[10px] text-gray-400">{log.owner_name}{log.business_name ? ' \u2014 ' + log.business_name : ''}</div>}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-[250px] truncate">{log.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[log.email_type] || 'bg-gray-100 text-gray-600'}`}>
                        {log.email_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">No emails sent yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
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
