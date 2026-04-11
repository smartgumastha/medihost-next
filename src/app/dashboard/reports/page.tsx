"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Summary {
  total_collection: number;
  bill_count: number;
  patient_count: number;
  cash: number;
  card: number;
  upi: number;
  insurance: number;
  online: number;
  other: number;
}

interface DailyRow {
  date: string;
  total: number;
  cash: number;
  card: number;
  upi: number;
  count: number;
}

interface DoctorRow {
  doctor_name: string;
  total: number;
  count: number;
}

interface BranchRow {
  branch_name: string;
  total: number;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatINR(n: number | string): string {
  var num = Number(n) || 0;
  return "\u20B9" + num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function todayMs(): number {
  var d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function quickRange(label: string): [number, number] {
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var todayEnd = today.getTime() + 24 * 60 * 60 * 1000;

  if (label === "today") return [today.getTime(), todayEnd];
  if (label === "yesterday") return [today.getTime() - 86400000, today.getTime()];
  if (label === "week") {
    var dayOfWeek = today.getDay() || 7;
    var weekStart = today.getTime() - (dayOfWeek - 1) * 86400000;
    return [weekStart, todayEnd];
  }
  if (label === "month") {
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return [monthStart, todayEnd];
  }
  if (label === "lastmonth") {
    var lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    var lmEnd = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return [lmStart, lmEnd];
  }
  return [today.getTime(), todayEnd];
}

function toDateInput(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function fromDateInput(s: string): number {
  return new Date(s).getTime();
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  var [startDate, setStartDate] = useState(todayMs());
  var [endDate, setEndDate] = useState(todayMs() + 86400000);
  var [loading, setLoading] = useState(false);
  var [summary, setSummary] = useState<Summary | null>(null);
  var [daily, setDaily] = useState<DailyRow[]>([]);
  var [byDoctor, setByDoctor] = useState<DoctorRow[]>([]);
  var [byBranch, setByBranch] = useState<BranchRow[]>([]);
  var [activeQuick, setActiveQuick] = useState("today");
  var [dailySort, setDailySort] = useState<"date" | "total">("date");
  var [dailySortDir, setDailySortDir] = useState<"asc" | "desc">("desc");
  var [dailyPage, setDailyPage] = useState(1);
  var dailyPerPage = 15;

  var fetchReport = useCallback(async function(start: number, end: number) {
    setLoading(true);
    try {
      var params = new URLSearchParams({ start_date: String(start), end_date: String(end) });
      var res = await fetch("/api/reports/collection?" + params.toString());
      var json = await res.json();
      if (json.success && json.data) {
        setSummary(json.data.summary || null);
        setDaily(json.data.daily || []);
        setByDoctor(json.data.by_doctor || []);
        setByBranch(json.data.by_branch || []);
      } else {
        setSummary(null);
        setDaily([]);
        setByDoctor([]);
        setByBranch([]);
      }
    } catch {
      setSummary(null);
      setDaily([]);
      setByDoctor([]);
      setByBranch([]);
    } finally {
      setLoading(false);
      setDailyPage(1);
    }
  }, []);

  function handleQuick(label: string) {
    setActiveQuick(label);
    var [s, e] = quickRange(label);
    setStartDate(s);
    setEndDate(e);
    fetchReport(s, e);
  }

  function handleGenerate() {
    setActiveQuick("");
    fetchReport(startDate, endDate);
  }

  var totalCollection = Number(summary?.total_collection) || 0;
  var billCount = Number(summary?.bill_count) || 0;
  var patientCount = Number(summary?.patient_count) || 0;
  var avgBill = billCount > 0 ? Math.round(totalCollection / billCount) : 0;

  // Payment mode breakdown
  var modes = summary ? [
    { label: "Cash", amount: Number(summary.cash) || 0, color: "bg-green-500" },
    { label: "Card", amount: Number(summary.card) || 0, color: "bg-blue-500" },
    { label: "UPI", amount: Number(summary.upi) || 0, color: "bg-purple-500" },
    { label: "Insurance", amount: Number(summary.insurance) || 0, color: "bg-amber-500" },
    { label: "Online", amount: Number(summary.online) || 0, color: "bg-cyan-500" },
    { label: "Other", amount: Number(summary.other) || 0, color: "bg-gray-400" },
  ].filter(function(m) { return m.amount > 0; }) : [];

  // Daily sort
  var sortedDaily = [...daily].sort(function(a, b) {
    if (dailySort === "total") return dailySortDir === "asc" ? Number(a.total) - Number(b.total) : Number(b.total) - Number(a.total);
    return dailySortDir === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
  var dailyPages = Math.ceil(sortedDaily.length / dailyPerPage);
  var pagedDaily = sortedDaily.slice((dailyPage - 1) * dailyPerPage, dailyPage * dailyPerPage);

  function toggleDailySort(field: "date" | "total") {
    if (dailySort === field) setDailySortDir(dailySortDir === "asc" ? "desc" : "asc");
    else { setDailySort(field); setDailySortDir("desc"); }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collection Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Daily revenue and payment summary</p>
        </div>
        <button onClick={function() { window.print(); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors print:hidden">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"/></svg>
          Print
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 print:hidden">
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: "Today", key: "today" },
            { label: "Yesterday", key: "yesterday" },
            { label: "This Week", key: "week" },
            { label: "This Month", key: "month" },
            { label: "Last Month", key: "lastmonth" },
          ].map(function(q) {
            return (
              <button key={q.key} onClick={function() { handleQuick(q.key); }}
                className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (activeQuick === q.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300")}>
                {q.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input type="date" value={toDateInput(startDate)} onChange={function(e) { setStartDate(fromDateInput(e.target.value)); setActiveQuick(""); }}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input type="date" value={toDateInput(endDate - 1)} onChange={function(e) { setEndDate(fromDateInput(e.target.value) + 86400000); setActiveQuick(""); }}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <button onClick={handleGenerate} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(function(i) { return <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse"><div className="h-3 bg-gray-100 rounded w-1/2 mb-3" /><div className="h-7 bg-gray-100 rounded w-3/4" /></div>; })}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Collection</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(totalCollection)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bills</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{billCount}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patients</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{patientCount}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Bill Value</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{formatINR(avgBill)}</div>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          {modes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Mode Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {modes.map(function(m) {
                  var pct = totalCollection > 0 ? Math.round((m.amount / totalCollection) * 100) : 0;
                  return (
                    <div key={m.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                      <span className={"w-2.5 h-2.5 rounded-full " + m.color} />
                      <span className="text-sm font-medium text-gray-700">{m.label}</span>
                      <span className="text-sm font-bold text-gray-900">{formatINR(m.amount)}</span>
                      <span className="text-xs text-gray-400">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Breakdown Table */}
          {daily.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Daily Breakdown</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 cursor-pointer select-none" onClick={function() { toggleDailySort("date"); }}>Date {dailySort === "date" ? (dailySortDir === "asc" ? "\u2191" : "\u2193") : ""}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 cursor-pointer select-none" onClick={function() { toggleDailySort("total"); }}>Total {dailySort === "total" ? (dailySortDir === "asc" ? "\u2191" : "\u2193") : ""}</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Cash</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Card</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">UPI</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Bills</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDaily.map(function(row) {
                    return (
                      <tr key={row.date} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{row.date}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatINR(row.total)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600 hidden md:table-cell">{formatINR(row.cash)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600 hidden md:table-cell">{formatINR(row.card)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600 hidden md:table-cell">{formatINR(row.upi)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{row.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {dailyPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Page {dailyPage} of {dailyPages}</span>
                  <div className="flex gap-2">
                    <button disabled={dailyPage <= 1} onClick={function() { setDailyPage(dailyPage - 1); }} className="px-2.5 py-1 rounded border border-gray-200 text-xs disabled:opacity-40">Prev</button>
                    <button disabled={dailyPage >= dailyPages} onClick={function() { setDailyPage(dailyPage + 1); }} className="px-2.5 py-1 rounded border border-gray-200 text-xs disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Doctor-wise */}
          {byDoctor.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Doctor-wise Collection</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Doctor</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Bills</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {byDoctor.map(function(row) {
                    var avg = Number(row.count) > 0 ? Math.round(Number(row.total) / Number(row.count)) : 0;
                    return (
                      <tr key={row.doctor_name} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{row.doctor_name}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatINR(row.total)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{row.count}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{formatINR(avg)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Branch-wise (only if >1 branch) */}
          {byBranch.length > 1 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Branch-wise Collection</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Branch</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Bills</th>
                  </tr>
                </thead>
                <tbody>
                  {byBranch.map(function(row) {
                    return (
                      <tr key={row.branch_name} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{row.branch_name}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatINR(row.total)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{row.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !summary && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="text-gray-300 mb-3">
            <svg className="mx-auto" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
          </div>
          <p className="text-gray-500 font-medium">No collection data</p>
          <p className="text-gray-400 text-xs mt-1">Select a date range and click Generate Report</p>
        </div>
      )}

      {/* Print styles */}
      <style>{`@media print { .print\\:hidden { display: none !important; } body { font-size: 12px; } }`}</style>
    </div>
  );
}
