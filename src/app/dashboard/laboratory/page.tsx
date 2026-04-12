"use client";

import { useState, useEffect, useCallback } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface LabOrder {
  order_id: string; patient_id: string; token_id?: string; item_id?: string;
  item_name: string; order_type?: string; status?: string; lis_status?: string;
  instructions?: string; ordered_by?: string; ordered_at?: number;
  sample_id?: string; result_id?: string; rate?: number; amount?: number;
  patient_first_name?: string; patient_last_name?: string; patient_phone?: string;
  patient_gender?: string; patient_dob?: string; uhid?: string;
  sample_type?: string; vacutainer_color?: string; parameters?: unknown[];
  dept_type?: string; category?: string; fasting_required?: boolean;
  collection_instructions?: string;
}

interface ResultParam {
  param_id?: string; param_name: string; param_value: string; unit?: string;
  normal_low?: number; normal_high?: number; normal_range_text?: string; flag: string;
  method?: string; sort_order?: number;
}

type ToastType = "success" | "error";
type ActiveTab = "pending" | "in_process" | "verification" | "completed";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatTime(epoch: number | undefined): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(epoch: number | undefined): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + " " + formatTime(epoch);
}

function urgencyColor(instr: string | undefined): string {
  if (!instr) return "";
  var u = instr.toUpperCase();
  if (u.includes("STAT")) return "bg-red-50 text-red-700 border-red-200";
  if (u.includes("URGENT")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function flagColor(flag: string): string {
  if (flag === "high" || flag === "critical_high") return "text-red-600 font-bold";
  if (flag === "low" || flag === "critical_low") return "text-blue-600 font-bold";
  return "text-green-600";
}

function flagLabel(flag: string): string {
  if (flag === "high") return "H";
  if (flag === "critical_high") return "HH";
  if (flag === "low") return "L";
  if (flag === "critical_low") return "LL";
  return "N";
}

function calcFlag(value: string, low: number | undefined, high: number | undefined): string {
  var v = parseFloat(value);
  if (isNaN(v)) return "normal";
  if (high != null && v > high) return "high";
  if (low != null && v < low) return "low";
  return "normal";
}

/* ================================================================== */
/*  Status-to-tab mapping                                              */
/* ================================================================== */

var TAB_STATUS: Record<ActiveTab, string> = {
  pending: "ordered",
  in_process: "sample_collected",
  verification: "result_entered",
  completed: "completed",
};

// Verification tab also needs tech_verified orders (awaiting pathologist)
var VERIFICATION_STATUSES = ["result_entered", "tech_verified"];

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function LaboratoryPage() {
  var [tab, setTab] = useState<ActiveTab>("pending");
  var [orders, setOrders] = useState<LabOrder[]>([]);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [collectModal, setCollectModal] = useState<LabOrder | null>(null);
  var [resultPanel, setResultPanel] = useState<LabOrder | null>(null);
  var [resultParams, setResultParams] = useState<ResultParam[]>([]);
  var [resultNotes, setResultNotes] = useState("");
  var [saving, setSaving] = useState(false);
  var [viewResult, setViewResult] = useState<{ result: Record<string, unknown>; parameters: ResultParam[]; patient: Record<string, string> } | null>(null);

  // Stats
  var [stats, setStats] = useState({ pending: 0, collected: 0, entered: 0, completed: 0 });

  useEffect(function() { if (!toast) return; var t = setTimeout(function() { setToast(null); }, 4000); return function() { clearTimeout(t); }; }, [toast]);

  var fetchOrders = useCallback(async function(status: string) {
    setLoading(true);
    try {
      if (status === "result_entered") {
        // Verification tab: fetch both result_entered and tech_verified
        var [r1, r2] = await Promise.all([
          fetch("/api/laboratory?endpoint=orders&status=result_entered").then(function(r) { return r.json(); }),
          fetch("/api/laboratory?endpoint=orders&status=tech_verified").then(function(r) { return r.json(); }),
        ]);
        var combined = [...(r1.success ? r1.data || [] : []), ...(r2.success ? r2.data || [] : [])];
        setOrders(combined);
      } else {
        var res = await fetch("/api/laboratory?endpoint=orders&status=" + status);
        var json = await res.json();
        setOrders(json.success ? (json.data || []) : []);
      }
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  // Fetch stats for all tabs
  var fetchStats = useCallback(async function() {
    try {
      var [r1, r2, r3, r3b, r4] = await Promise.all([
        fetch("/api/laboratory?endpoint=orders&status=ordered").then(function(r) { return r.json(); }),
        fetch("/api/laboratory?endpoint=orders&status=sample_collected").then(function(r) { return r.json(); }),
        fetch("/api/laboratory?endpoint=orders&status=result_entered").then(function(r) { return r.json(); }),
        fetch("/api/laboratory?endpoint=orders&status=tech_verified").then(function(r) { return r.json(); }),
        fetch("/api/laboratory?endpoint=orders&status=completed").then(function(r) { return r.json(); }),
      ]);
      setStats({
        pending: (r1.data || []).length,
        collected: (r2.data || []).length,
        entered: (r3.data || []).length + (r3b.data || []).length,
        completed: (r4.data || []).length,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(function() { fetchOrders(TAB_STATUS[tab]); }, [tab, fetchOrders]);
  useEffect(function() { fetchStats(); }, [fetchStats]);

  function refresh() { fetchOrders(TAB_STATUS[tab]); fetchStats(); }

  // Collect sample
  async function handleCollect(order: LabOrder, notes: string) {
    setSaving(true);
    try {
      var res = await fetch("/api/laboratory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _endpoint: "samples",
          order_id: order.order_id,
          patient_id: order.patient_id,
          sample_type: order.sample_type || null,
          vacutainer_color: order.vacutainer_color || null,
          priority: order.instructions?.toUpperCase().includes("STAT") ? "stat" : "routine",
          notes: notes,
        }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Sample collected: " + (json.data?.accession_number || ""), type: "success" });
        setCollectModal(null);
        refresh();
      } else {
        setToast({ message: json.message || "Failed", type: "error" });
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  // Open result entry
  function openResultEntry(order: LabOrder) {
    setResultPanel(order);
    setResultNotes("");
    // Build params from test_master parameters if available
    var testParams = Array.isArray(order.parameters) ? order.parameters : [];
    if (testParams.length > 0) {
      setResultParams(testParams.map(function(p: unknown, i: number) {
        var tp = p as Record<string, unknown>;
        return {
          param_name: String(tp.name || tp.param_name || "Parameter " + (i + 1)),
          param_value: "",
          unit: String(tp.unit || ""),
          normal_low: tp.normal_low != null ? Number(tp.normal_low) : undefined,
          normal_high: tp.normal_high != null ? Number(tp.normal_high) : undefined,
          normal_range_text: String(tp.normal_range || tp.normal_range_text || ""),
          flag: "normal",
          method: String(tp.method || ""),
          sort_order: i,
        };
      }));
    } else {
      // Default single param
      setResultParams([{ param_name: order.item_name || "Result", param_value: "", unit: "", flag: "normal", sort_order: 0 }]);
    }
  }

  // Save results
  async function handleSaveResults() {
    if (!resultPanel) return;
    setSaving(true);
    try {
      var params = resultParams.map(function(p) {
        return { ...p, flag: calcFlag(p.param_value, p.normal_low, p.normal_high) };
      });
      var res = await fetch("/api/laboratory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _endpoint: "results",
          sample_id: resultPanel.sample_id,
          order_id: resultPanel.order_id,
          patient_id: resultPanel.patient_id,
          test_id: resultPanel.item_id || resultPanel.order_id,
          test_name: resultPanel.item_name,
          department: resultPanel.dept_type || "",
          parameters: params,
          notes: resultNotes,
        }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Results submitted for verification", type: "success" });
        setResultPanel(null);
        refresh();
      } else {
        setToast({ message: json.message || "Failed", type: "error" });
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  // Verify result
  async function handleVerify(order: LabOrder, type: "tech" | "pathologist") {
    setSaving(true);
    try {
      var res = await fetch("/api/laboratory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _endpoint: "results/" + order.result_id + "/verify",
          _id: "",
          verifier_type: type,
        }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: type === "tech" ? "Tech verified" : "Report finalized", type: "success" });
        refresh();
      } else {
        setToast({ message: json.message || "Failed", type: "error" });
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  // View result
  async function handleViewResult(order: LabOrder) {
    try {
      var res = await fetch("/api/laboratory?endpoint=results/" + order.result_id);
      var json = await res.json();
      if (json.success && json.data) {
        setViewResult({ result: json.data.result, parameters: json.data.parameters || [], patient: json.data.patient || {} });
      }
    } catch { setToast({ message: "Failed to load result", type: "error" }); }
  }

  var patientName = function(o: LabOrder) { return [o.patient_first_name, o.patient_last_name].filter(Boolean).join(" ") || "Patient"; };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}><span>{toast.type === "success" ? "\u2713" : "\u2717"}</span><span>{toast.message}</span></div>}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laboratory (LIS)</h1>
        <p className="text-sm text-gray-500 mt-1">NABL-compliant lab workflow</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Pending Orders" value={stats.pending} color="text-blue-600" onClick={function() { setTab("pending"); }} active={tab === "pending"} />
        <StatCard label="Samples Collected" value={stats.collected} color="text-amber-600" onClick={function() { setTab("in_process"); }} active={tab === "in_process"} />
        <StatCard label="Awaiting Verification" value={stats.entered} color="text-purple-600" onClick={function() { setTab("verification"); }} active={tab === "verification"} />
        <StatCard label="Completed Today" value={stats.completed} color="text-emerald-600" onClick={function() { setTab("completed"); }} active={tab === "completed"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-50 mb-4 overflow-x-auto">
        {([["pending", "Pending Orders"], ["in_process", "In Process"], ["verification", "Verification"], ["completed", "Completed"]] as [ActiveTab, string][]).map(function(t) {
          return <button key={t[0]} onClick={function() { setTab(t[0]); }} className={"px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (tab === t[0] ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>{t[1]}</button>;
        })}
      </div>

      {/* Loading */}
      {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-.644.879a4.5 4.5 0 01-6.312 1.035L12 15.75l-.844.664a4.5 4.5 0 01-6.312-1.035L4.2 14.5" /></svg></div>
          <p className="text-gray-500 font-medium">{tab === "pending" ? "No pending lab orders" : tab === "in_process" ? "No samples awaiting results" : tab === "verification" ? "No results awaiting verification" : "No completed reports today"}</p>
          <p className="text-gray-400 text-xs mt-1">{tab === "pending" ? "Lab orders from doctor EMR will appear here." : "Process samples from previous stages."}</p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Test</th>
                  {tab === "pending" && <th className="text-left px-4 py-2.5 font-medium text-gray-600">Urgency</th>}
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">{tab === "pending" ? "Ordered" : "Time"}</th>
                  {tab !== "pending" && <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Sample Type</th>}
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(function(o) {
                  var isSTAT = (o.instructions || "").toUpperCase().includes("STAT");
                  return (
                    <tr key={o.order_id} className={"border-b border-gray-50 hover:bg-gray-50/50 " + (isSTAT && tab === "pending" ? "border-l-4 border-l-red-400" : "")}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{patientName(o)}</div>
                        <div className="text-xs text-gray-500">{o.uhid || ""} {o.patient_phone ? "\u00B7 " + o.patient_phone : ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{o.item_name}</div>
                        {o.dept_type && <div className="text-xs text-gray-400">{o.dept_type}{o.category ? " \u2022 " + o.category : ""}</div>}
                      </td>
                      {tab === "pending" && (
                        <td className="px-4 py-3">
                          <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + urgencyColor(o.instructions)}>{isSTAT ? "STAT" : (o.instructions || "").toUpperCase().includes("URGENT") ? "Urgent" : "Routine"}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatDate(o.ordered_at)}</td>
                      {tab !== "pending" && <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{o.sample_type || "\u2014"}</td>}
                      <td className="px-4 py-3 text-right">
                        {tab === "pending" && <button onClick={function() { setCollectModal(o); }} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">Collect Sample</button>}
                        {tab === "in_process" && <button onClick={function() { openResultEntry(o); }} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors">Enter Results</button>}
                        {tab === "verification" && (
                          <div className="flex gap-1 justify-end">
                            {o.lis_status === "result_entered" && <button onClick={function() { handleVerify(o, "tech"); }} disabled={saving} className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50">Tech Verify</button>}
                            {o.lis_status === "tech_verified" && <button onClick={function() { handleVerify(o, "pathologist"); }} disabled={saving} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">Pathologist Approve</button>}
                          </div>
                        )}
                        {tab === "completed" && (
                          <div className="flex gap-1 justify-end">
                            {o.result_id && <button onClick={function() { handleViewResult(o); }} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">View</button>}
                            <button onClick={function() { window.print(); }} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">Print</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collect Sample Modal */}
      {collectModal && <CollectSampleModal order={collectModal} saving={saving} onCollect={handleCollect} onClose={function() { setCollectModal(null); }} />}

      {/* Result Entry Panel */}
      {resultPanel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={function() { setResultPanel(null); }} />
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Enter Results</h2>
                  <p className="text-sm text-gray-500">{resultPanel.item_name} &mdash; {patientName(resultPanel)}</p>
                </div>
                <button onClick={function() { setResultPanel(null); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* Parameters table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Parameter</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Value</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Unit</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Reference</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultParams.map(function(p, i) {
                      var flag = calcFlag(p.param_value, p.normal_low, p.normal_high);
                      return (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-3 py-2 text-gray-900 font-medium">{p.param_name}</td>
                          <td className="px-3 py-2"><input type="text" value={p.param_value} onChange={function(e) { setResultParams(function(prev) { var n = [...prev]; n[i] = { ...n[i], param_value: e.target.value }; return n; }); }} className="px-2 py-1 rounded border border-gray-200 text-sm w-24" /></td>
                          <td className="px-3 py-2 text-xs text-gray-500">{p.unit || ""}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{p.normal_range_text || (p.normal_low != null && p.normal_high != null ? p.normal_low + " - " + p.normal_high : "\u2014")}</td>
                          <td className="px-3 py-2 text-center">{p.param_value && <span className={"text-xs font-bold " + flagColor(flag)}>{flagLabel(flag)}</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Interpretation</label>
                <textarea rows={3} value={resultNotes} onChange={function(e) { setResultNotes(e.target.value); }} placeholder="Clinical interpretation..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" />
              </div>

              <button onClick={handleSaveResults} disabled={saving} className="w-full py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50">{saving ? "Submitting..." : "Submit for Verification"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Result Modal */}
      {viewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={function() { setViewResult(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Lab Report</h2>
              <button onClick={function() { setViewResult(null); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium text-gray-900">{viewResult.patient.first_name} {viewResult.patient.last_name || ""}</span>
              <span className="ml-2 text-xs text-gray-500">{viewResult.patient.uhid}</span>
            </div>

            <div className="text-sm font-semibold text-gray-900 mb-2">{String(viewResult.result.test_name || "Lab Test")}</div>

            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr><th className="text-left px-3 py-2 font-medium">Parameter</th><th className="text-left px-3 py-2 font-medium">Value</th><th className="text-left px-3 py-2 font-medium">Reference</th><th className="text-center px-3 py-2 font-medium">Flag</th></tr></thead>
                <tbody>
                  {viewResult.parameters.map(function(p, i) {
                    return (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-3 py-2 text-gray-900">{p.param_name}</td>
                        <td className="px-3 py-2 font-medium">{p.param_value} {p.unit || ""}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{p.normal_range_text || (p.normal_low != null ? p.normal_low + "-" + p.normal_high : "")}</td>
                        <td className="px-3 py-2 text-center"><span className={"text-xs font-bold " + flagColor(p.flag)}>{flagLabel(p.flag)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button onClick={function() { window.print(); }} className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">Print Report</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function StatCard({ label, value, color, onClick, active }: { label: string; value: number; color: string; onClick: () => void; active: boolean }) {
  return (
    <button onClick={onClick} className={"rounded-xl border bg-white p-4 text-left transition-colors " + (active ? "border-emerald-400 ring-1 ring-emerald-200" : "border-gray-200 hover:border-gray-300")}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={"text-2xl font-bold mt-1 " + color}>{value}</div>
    </button>
  );
}

function CollectSampleModal({ order, saving, onCollect, onClose }: { order: LabOrder; saving: boolean; onCollect: (order: LabOrder, notes: string) => void; onClose: () => void }) {
  var [notes, setNotes] = useState("");
  var patientName = [order.patient_first_name, order.patient_last_name].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Collect Sample</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
            <div className="text-sm font-medium text-gray-900">{patientName}</div>
            <div className="text-xs text-gray-500">{order.uhid} &middot; {order.item_name}</div>
          </div>

          {order.sample_type && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sample:</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{order.sample_type}</span>
              {order.vacutainer_color && <span className="text-xs text-gray-500">({order.vacutainer_color} tube)</span>}
            </div>
          )}

          {order.fasting_required && (
            <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">Fasting required for this test</div>
          )}

          {order.collection_instructions && (
            <div className="text-xs text-gray-500">{order.collection_instructions}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Collection Notes</label>
            <input type="text" value={notes} onChange={function(e) { setNotes(e.target.value); }} placeholder="Any observations..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          </div>
        </div>

        <button onClick={function() { onCollect(order, notes); }} disabled={saving} className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "Collecting..." : "Confirm Collection"}</button>
      </div>
    </div>
  );
}
