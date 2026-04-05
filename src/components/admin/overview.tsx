"use client";

import { useState, useEffect } from 'react';

const DEFAULT_STATS = [
  { label: 'Total Partners', value: '127', sub: '+5 today', color: 'bg-red-50 text-red-700' },
  { label: 'Active Trials', value: '34', sub: '8 expiring this week', color: 'bg-amber-50 text-amber-700' },
  { label: 'Revenue', value: '\u20B92,45,000', sub: '12 transactions', color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Today\'s Signups', value: '3', sub: '2 never logged in', color: 'bg-blue-50 text-blue-700' },
];

const PLAN_DATA = [
  { plan: 'Starter', count: 65, color: 'bg-gray-400' },
  { plan: 'Professional', count: 32, color: 'bg-blue-500' },
  { plan: 'Business', count: 24, color: 'bg-amber-500' },
  { plan: 'Enterprise', count: 6, color: 'bg-red-600' },
];

const SOURCE_DATA = [
  { source: 'Direct', count: 45, color: 'bg-red-500' },
  { source: 'Google', count: 32, color: 'bg-blue-500' },
  { source: 'Instagram', count: 28, color: 'bg-pink-500' },
  { source: 'Admin', count: 15, color: 'bg-gray-500' },
  { source: 'Other', count: 7, color: 'bg-gray-300' },
];

const FUNNEL_STAGES = [
  { label: 'Signed Up', count: 127, color: 'bg-red-200', text: 'text-red-800' },
  { label: 'Verified', count: 98, color: 'bg-red-300', text: 'text-red-900' },
  { label: 'Payment', count: 56, color: 'bg-red-400', text: 'text-white' },
  { label: 'Onboarded', count: 42, color: 'bg-red-500', text: 'text-white' },
  { label: 'Active', count: 38, color: 'bg-red-600', text: 'text-white' },
];

const ATTENTION_ROWS = [
  { clinic: 'HealthPlus Clinic', email: 'info@healthplus.in', plan: 'Starter', signedUp: '2 days ago', source: 'Google' },
  { clinic: 'Care & Cure Hospital', email: 'admin@carecure.com', plan: 'Professional', signedUp: '3 days ago', source: 'Direct' },
  { clinic: 'MedLife Diagnostics', email: 'contact@medlife.co', plan: 'Starter', signedUp: '4 days ago', source: 'Instagram' },
  { clinic: 'Sunrise Health Center', email: 'hello@sunrise.in', plan: 'Business', signedUp: '5 days ago', source: 'Admin' },
  { clinic: 'Apollo Dental Studio', email: 'team@apollodental.in', plan: 'Starter', signedUp: '6 days ago', source: 'Google' },
];

export function AdminOverview() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  /* ---- Fetch dashboard stats from API with mock fallback ---- */
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/proxy/api/presence/admin/dashboard', {
          headers: { 'x-admin-key': 'MediHost@2026' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.total_partners) {
            setStats([
              { label: 'Total Partners', value: String(data.total_partners), sub: data.today_signups ? `+${data.today_signups} today` : '+0 today', color: 'bg-red-50 text-red-700' },
              { label: 'Active Trials', value: String(data.active_trials || 0), sub: data.expiring_this_week ? `${data.expiring_this_week} expiring this week` : '0 expiring', color: 'bg-amber-50 text-amber-700' },
              { label: 'Revenue', value: data.revenue ? `\u20B9${data.revenue}` : '\u20B90', sub: data.transactions ? `${data.transactions} transactions` : '0 transactions', color: 'bg-emerald-50 text-emerald-700' },
              { label: "Today's Signups", value: String(data.today_signups || 0), sub: data.never_logged_in ? `${data.never_logged_in} never logged in` : '0 never logged in', color: 'bg-blue-50 text-blue-700' },
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide stats and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</div>
            <div className={`text-xs font-medium mt-2 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Partners by Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Partners by Plan</h3>
          <div className="space-y-3">
            {PLAN_DATA.map(item => (
              <div key={item.plan} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 font-medium">{item.plan}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${(item.count / maxPlan) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signups by Source */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Signups by Source</h3>
          <div className="space-y-3">
            {SOURCE_DATA.map(item => (
              <div key={item.source} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 font-medium">{item.source}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${(item.count / maxSource) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signup Funnel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Signup Funnel</h3>
        <div className="space-y-2">
          {FUNNEL_STAGES.map(stage => (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 font-medium">{stage.label}</div>
              <div className="flex-1">
                <div
                  className={`h-10 ${stage.color} rounded-lg flex items-center px-3`}
                  style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                >
                  <span className={`text-sm font-bold ${stage.text}`}>{stage.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Needs Attention Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Needs Attention</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Clinic</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Email</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Plan</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Signed Up</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Source</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {ATTENTION_ROWS.map(row => (
                <tr key={row.email} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{row.clinic}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{row.plan}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{row.signedUp}</td>
                  <td className="py-2.5 px-3 text-gray-500">{row.source}</td>
                  <td className="py-2.5 px-3">
                    <button className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline">View</button>
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
