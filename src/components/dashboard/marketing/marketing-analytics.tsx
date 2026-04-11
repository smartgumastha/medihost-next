"use client";

import { useState } from "react";

// ── KPI Data ──
const KPI_CARDS = [
  { label: "Total Leads", value: "247", change: "+18%", up: true, icon: "\uD83D\uDC65" },
  { label: "Appointments", value: "142", change: "+12%", up: true, icon: "\uD83D\uDCC5" },
  { label: "Conversion Rate", value: "57.5%", change: "+3.2%", up: true, icon: "\uD83D\uDCC8" },
  { label: "Revenue", value: "\u20B94,82,000", change: "+22%", up: true, icon: "\uD83D\uDCB0" },
  { label: "Avg. Cost/Lead", value: "\u20B9285", change: "-8%", up: true, icon: "\uD83C\uDFAF" },
  { label: "Google Rating", value: "4.6", change: "+0.2", up: true, icon: "\u2B50" },
];

const MONTHLY_REVENUE = [
  { month: "Nov", value: 285000 },
  { month: "Dec", value: 310000 },
  { month: "Jan", value: 340000 },
  { month: "Feb", value: 365000 },
  { month: "Mar", value: 420000 },
  { month: "Apr", value: 482000 },
];

const FUNNEL_STAGES = [
  { label: "Impressions", value: 12400, pct: 100 },
  { label: "Clicks", value: 1860, pct: 15 },
  { label: "Leads", value: 247, pct: 13.3 },
  { label: "Appointments", value: 142, pct: 57.5 },
  { label: "Conversions", value: 98, pct: 69 },
];

const SOURCE_DATA = [
  { source: "Google Ads", leads: 78, converted: 48, revenue: 168000, cost: 22000, roi: "663%" },
  { source: "Facebook", leads: 52, converted: 28, revenue: 98000, cost: 12000, roi: "717%" },
  { source: "Instagram", leads: 35, converted: 18, revenue: 63000, cost: 8000, roi: "688%" },
  { source: "WhatsApp", leads: 28, converted: 22, revenue: 77000, cost: 2000, roi: "3750%" },
  { source: "Walk-in", leads: 24, converted: 20, revenue: 70000, cost: 0, roi: "\u221E" },
  { source: "Referral", leads: 18, converted: 15, revenue: 52500, cost: 0, roi: "\u221E" },
  { source: "Website", leads: 12, converted: 7, revenue: 24500, cost: 5000, roi: "390%" },
];

const DOCTORS = [
  { name: "Dr. Anil Kumar", patients: 52, revenue: 182000, rating: 4.8, specialty: "Dermatology" },
  { name: "Dr. Priya Reddy", patients: 38, revenue: 133000, rating: 4.5, specialty: "Pediatrics" },
  { name: "Dr. Srinivas Rao", patients: 24, revenue: 84000, rating: 4.2, specialty: "General Medicine" },
];

const AI_INSIGHTS = [
  { icon: "\uD83D\uDCC8", text: "Google Ads leads increased 23% this month. Top keyword: 'skin specialist hyderabad' \u2014 consider increasing budget by \u20B95,000.", type: "positive" },
  { icon: "\u26A0\uFE0F", text: "Instagram engagement dropped 15% last week. Posting at 6 PM instead of 10 AM may improve reach based on your audience activity.", type: "warning" },
  { icon: "\uD83D\uDCA1", text: "WhatsApp has your highest conversion rate (78.6%) at the lowest cost. Consider running a WhatsApp-first campaign for your dental checkup package.", type: "suggestion" },
  { icon: "\uD83C\uDFAF", text: "32 leads haven't been contacted in 3+ days. Auto-follow-up via WhatsApp could recover ~40% based on industry benchmarks.", type: "action" },
];

// ── Simple Bar Chart ──
function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-600">{"\u20B9"}{(d.value / 1000).toFixed(0)}k</span>
          <div className="w-full bg-emerald-100 rounded-t-md relative overflow-hidden" style={{ height: `${(d.value / max) * 100}%` }}>
            <div className="absolute inset-0 bg-emerald-500 rounded-t-md" />
          </div>
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──
export function MarketingAnalytics() {
  const [period, setPeriod] = useState("month");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track performance across all marketing channels</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {["week", "month", "quarter"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${
                period === p ? "bg-white shadow-sm text-gray-700" : "text-gray-500"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{kpi.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
          <BarChart data={MONTHLY_REVENUE} />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {FUNNEL_STAGES.map((stage, i) => {
              const dropoff = i > 0 ? (100 - stage.pct).toFixed(1) : null;
              return (
                <div key={stage.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{stage.label}</span>
                    <span className="text-gray-600">{stage.value.toLocaleString()}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.max((stage.value / FUNNEL_STAGES[0].value) * 100, 5)}%`,
                      background: `hsl(${160 - i * 20}, 70%, ${45 + i * 5}%)`
                    }} />
                  </div>
                  {dropoff && (
                    <div className="text-xs text-red-400 mt-0.5 text-right">{"\u2193"} {dropoff}% dropoff</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Source Attribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-2 font-medium text-gray-600">Source</th>
                <th className="py-3 px-2 font-medium text-gray-600 text-right">Leads</th>
                <th className="py-3 px-2 font-medium text-gray-600 text-right">Converted</th>
                <th className="py-3 px-2 font-medium text-gray-600 text-right">Revenue</th>
                <th className="py-3 px-2 font-medium text-gray-600 text-right">Ad Spend</th>
                <th className="py-3 px-2 font-medium text-gray-600 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {SOURCE_DATA.map(row => (
                <tr key={row.source} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-800">{row.source}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.leads}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.converted}</td>
                  <td className="py-3 px-2 text-right text-gray-700 font-medium">{"\u20B9"}{(row.revenue / 1000).toFixed(0)}k</td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.cost > 0 ? `\u20B9${(row.cost / 1000).toFixed(0)}k` : "\u2014"}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      row.roi === "\u221E" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>{row.roi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Doctor Performance</h3>
          <div className="space-y-3">
            {DOCTORS.map(doc => (
              <div key={doc.name} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {doc.name.split(" ").pop()?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                  <div className="text-xs text-gray-400">{doc.specialty}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-700">{"\u20B9"}{(doc.revenue / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-gray-400">{doc.patients} patients {"\u00B7"} {"\u2B50"} {doc.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">{"\u2728"} AI Insights</h3>
          <div className="space-y-3">
            {AI_INSIGHTS.map((insight, i) => (
              <div key={i} className={`p-3 rounded-lg border text-sm ${
                insight.type === "positive" ? "bg-emerald-50 border-emerald-200" :
                insight.type === "warning" ? "bg-amber-50 border-amber-200" :
                insight.type === "action" ? "bg-red-50 border-red-200" :
                "bg-blue-50 border-blue-200"
              }`}>
                <span className="mr-2">{insight.icon}</span>
                {insight.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
