"use client";

import { useState, useEffect } from 'react';
import { getTokenFromClient } from '@/lib/auth';

const DEFAULT_STATS = [
  { label: 'Total Partners', value: '127', sub: '+5 today', border: 'border-t-emerald-500', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Trials', value: '34', sub: '8 expiring this week', border: 'border-t-blue-500', accent: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Revenue', value: '\u20B92,45,000', sub: '12 transactions', border: 'border-t-amber-500', accent: 'text-amber-600', bg: 'bg-amber-50' },
  { label: "Today's Signups", value: '3', sub: '2 never logged in', border: 'border-t-red-500', accent: 'text-red-600', bg: 'bg-red-50' },
];

const PLAN_DATA = [
  { plan: 'Starter', count: 65, color: 'bg-gray-400' },
  { plan: 'Professional', count: 32, color: 'bg-blue-500' },
  { plan: 'Business', count: 24, color: 'bg-purple-500' },
  { plan: 'Enterprise', count: 6, color: 'bg-amber-500' },
];

const SOURCE_DATA = [
  { source: 'Direct', count: 45, color: 'bg-emerald-500' },
  { source: 'Google', count: 32, color: 'bg-blue-500' },
  { source: 'Instagram', count: 28, color: 'bg-pink-500' },
  { source: 'Admin', count: 15, color: 'bg-gray-400' },
  { source: 'Other', count: 7, color: 'bg-gray-300' },
];

const FUNNEL_STAGES = [
  { label: 'Signed Up', count: 127 },
  { label: 'Verified', count: 98 },
  { label: 'Payment', count: 56 },
  { label: 'Onboarded', count: 42 },
  { label: 'Active', count: 38 },
];

const ATTENTION_ROWS = [
  { clinic: 'HealthPlus Clinic', email: 'info@healthplus.in', plan: 'Starter', signedUp: '2 days ago', source: 'Google', status: 'pending' },
  { clinic: 'Care & Cure Hospital', email: 'admin@carecure.com', plan: 'Professional', signedUp: '3 days ago', source: 'Direct', status: 'pending' },
  { clinic: 'MedLife Diagnostics', email: 'contact@medlife.co', plan: 'Starter', signedUp: '4 days ago', source: 'Instagram', status: 'warning' },
  { clinic: 'Sunrise Health Center', email: 'hello@sunrise.in', plan: 'Business', signedUp: '5 days ago', source: 'Admin', status: 'pending' },
  { clinic: 'Apollo Dental Studio', email: 'team@apollodental.in', plan: 'Starter', signedUp: '6 days ago', source: 'Google', status: 'warning' },
];

const PLAN_BADGE_COLORS: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-700',
  Professional: 'bg-blue-50 text-blue-700',
  Business: 'bg-purple-50 text-purple-700',
  Enterprise: 'bg-amber-50 text-amber-700',
};

const SOURCE_BADGE_COLORS: Record<string, string> = {
  Direct: 'bg-emerald-50 text-emerald-700',
  Google: 'bg-blue-50 text-blue-700',
  Instagram: 'bg-pink-50 text-pink-700',
  Admin: 'bg-gray-100 text-gray-700',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-400',
  warning: 'bg-red-500',
};

/* Funnel gradient steps: emerald -> teal -> cyan -> blue -> indigo */
const FUNNEL_COLORS = [
  'from-emerald-400 to-emerald-500',
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-blue-600',
];

export function AdminOverview() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  /* ---- Fetch dashboard stats from API with mock fallback ---- */
  useEffect(() => {
    async function loadStats() {
      try {
        var token = getTokenFromClient();
        const res = await fetch('/api/admin/dashboard', {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.total_partners) {
            setStats([
              { label: 'Total Partners', value: String(data.total_partners), sub: data.today_signups ? `+${data.today_signups} today` : '+0 today', border: 'border-t-emerald-500', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Active Trials', value: String(data.active_trials || 0), sub: data.expiring_this_week ? `${data.expiring_this_week} expiring this week` : '0 expiring', border: 'border-t-blue-500', accent: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Revenue', value: data.revenue ? `\u20B9${data.revenue}` : '\u20B90', sub: data.transactions ? `${data.transactions} transactions` : '0 transactions', border: 'border-t-amber-500', accent: 'text-amber-600', bg: 'bg-amber-50' },
              { label: "Today's Signups", value: String(data.today_signups || 0), sub: data.never_logged_in ? `${data.never_logged_in} never logged in` : '0 never logged in', border: 'border-t-red-500', accent: 'text-red-600', bg: 'bg-red-50' },
            ]);
          }
        }
      } catch {
        // Keep mock stats as default
      }
    }
    loadStats();
  }, []);

  const maxSource = Math.max(...SOURCE_DATA.map(s => s.count));
  const maxPlan = Math.max(...PLAN_DATA.map(p => p.count));
  const maxFunnel = FUNNEL_STAGES[0].count;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide stats and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`bg-white rounded-xl border border-gray-200 border-t-[3px] ${stat.border} p-5 shadow-sm`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</div>
            <div className={`text-xs font-medium mt-2 ${stat.accent}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Partners by Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Partners by Plan</h3>
          <div className="space-y-3.5">
            {PLAN_DATA.map(item => (
              <div key={item.plan} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 font-medium">{item.plan}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2.5 transition-all duration-500`}
                    style={{ width: `${Math.max((item.count / maxPlan) * 100, 12)}%` }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signups by Source */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Signups by Source</h3>
          <div className="space-y-3.5">
            {SOURCE_DATA.map(item => (
              <div key={item.source} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 font-medium">{item.source}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2.5 transition-all duration-500`}
                    style={{ width: `${Math.max((item.count / maxSource) * 100, 12)}%` }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signup Funnel — Horizontal */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6">Signup Funnel</h3>
        <div className="flex items-end gap-1 justify-center">
          {FUNNEL_STAGES.map((stage, i) => {
            const widthPct = (stage.count / maxFunnel) * 100;
            return (
              <div key={stage.label} className="flex flex-col items-center flex-1">
                <span className="text-lg font-bold text-gray-900 mb-2">{stage.count}</span>
                <div
                  className={`w-full bg-gradient-to-r ${FUNNEL_COLORS[i]} rounded-lg transition-all duration-500`}
                  style={{ height: `${Math.max(widthPct * 0.8, 16)}px` }}
                />
                <span className="text-[11px] font-medium text-gray-500 mt-2 text-center">{stage.label}</span>
                {i < FUNNEL_STAGES.length - 1 && (
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {Math.round((FUNNEL_STAGES[i + 1].count / stage.count) * 100)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs Attention Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden border-l-[3px] border-l-red-500">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-bold text-gray-800">Needs Attention</h3>
          <p className="text-xs text-gray-500 mt-0.5">Partners requiring follow-up</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clinic</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Signed Up</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source</th>
                <th className="text-left py-2.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {ATTENTION_ROWS.map(row => (
                <tr key={row.email} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[row.status] || 'bg-gray-300'}`} />
                  </td>
                  <td className="py-3 px-5 font-semibold text-gray-900">{row.clinic}</td>
                  <td className="py-3 px-5 text-gray-500">{row.email}</td>
                  <td className="py-3 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_BADGE_COLORS[row.plan] || 'bg-gray-100 text-gray-700'}`}>{row.plan}</span>
                  </td>
                  <td className="py-3 px-5 text-gray-500">{row.signedUp}</td>
                  <td className="py-3 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SOURCE_BADGE_COLORS[row.source] || 'bg-gray-100 text-gray-700'}`}>{row.source}</span>
                  </td>
                  <td className="py-3 px-5">
                    <button className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline transition-colors px-3 py-1.5 rounded-md hover:bg-red-50">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
