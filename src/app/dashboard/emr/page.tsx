"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Token {
  token_id: string; token_number: string; patient_id: string; doctor_id?: string;
  status: string; chief_complaint?: string; priority?: number;
  first_name?: string; last_name?: string; uhid?: string; phone?: string;
  gender?: string; dob?: string; age?: number; blood_group?: string;
  doctor_first_name?: string; doctor_last_name?: string;
  bp_systolic?: number; bp_diastolic?: number; pulse_rate?: number;
  temperature?: number; spo2?: number; weight_kg?: number;
  registered_at?: number; created_at?: number;
}

interface DrugRow {
  name: string; generic?: string; dosage: string; frequency: string;
  duration: string; duration_unit: string; quantity: string; notes: string;
}

interface LabOrder { name: string; urgency: string; notes: string; }
interface RadOrder { modality: string; body_part: string; indication: string; urgency: string; }
interface Allergy { id: string; allergy_type?: string; allergen: string; reaction?: string; severity?: string; }
interface PastVisit { id: string; visit_date?: string; diagnosis_primary?: string; prescription?: unknown; created_at?: number; }

type ToastType = "success" | "error";
type Tab = "soap" | "rx" | "orders" | "history" | "allergies";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function timeAgo(epoch: number | undefined): string {
  if (!epoch) return "";
  var mins = Math.round((Date.now() - epoch) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return mins + "m";
  return Math.floor(mins / 60) + "h" + (mins % 60) + "m";
}

function calcAge(dob: string | undefined, age: number | undefined): string {
  if (age) return age + "y";
  if (!dob) return "";
  var b = new Date(dob); var t = new Date();
  var a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a + "y";
}

function capitalize(s: string | undefined): string { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

var DOSAGES = ["1-0-1", "1-1-1", "1-0-0", "0-0-1", "0-1-0", "1-1-0", "0-1-1", "SOS", "Once daily", "Twice daily", "Custom"];
var FREQUENCIES = ["After food", "Before food", "With food", "Empty stomach", "As directed"];
var DURATION_UNITS = ["days", "weeks", "months"];
var URGENCIES = ["Routine", "Urgent", "STAT"];
var MODALITIES = ["X-ray", "CT Scan", "MRI", "Ultrasound", "ECG", "Echo", "Other"];

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function EMRPage() {
  var [tokens, setTokens] = useState<Token[]>([]);
  var [loading, setLoading] = useState(true);
  var [selected, setSelected] = useState<Token | null>(null);
  var [tab, setTab] = useState<Tab>("soap");
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [saving, setSaving] = useState(false);
  var refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SOAP
  var [subjective, setSubjective] = useState("");
  var [assessment, setAssessment] = useState("");
  var [diagnoses, setDiagnoses] = useState<string[]>([]);
  var [diagInput, setDiagInput] = useState("");
  var [severity, setSeverity] = useState("Mild");
  var [plan, setPlan] = useState("");

  // Rx
  var [drugs, setDrugs] = useState<DrugRow[]>([]);
  var [drugSearch, setDrugSearch] = useState("");
  var [drugResults, setDrugResults] = useState<Array<{ id: string; name: string; generic?: string }>>([]);
  var [drugSearching, setDrugSearching] = useState(false);
  var drugDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Orders
  var [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  var [radOrders, setRadOrders] = useState<RadOrder[]>([]);
  var [testSearch, setTestSearch] = useState("");
  var [testResults, setTestResults] = useState<Array<{ id: string; test_name: string }>>([]);
  var [testSearching, setTestSearching] = useState(false);
  var testDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // History & Allergies (lazy)
  var [pastVisits, setPastVisits] = useState<PastVisit[]>([]);
  var [allergies, setAllergies] = useState<Allergy[]>([]);
  var [historyLoaded, setHistoryLoaded] = useState(false);
  var [allergiesLoaded, setAllergiesLoaded] = useState(false);

  useEffect(function() { if (!toast) return; var t = setTimeout(function() { setToast(null); }, 4000); return function() { clearTimeout(t); }; }, [toast]);

  var fetchQueue = useCallback(async function() {
    try {
      var res = await fetch("/api/emr");
      var json = await res.json();
      if (json.success && json.data) {
        var all = (json.data.tokens || []) as Token[];
        setTokens(all.filter(function(t) { return t.status === "consulting" || t.status === "called" || t.status === "triaged"; }));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(function() { fetchQueue(); refreshRef.current = setInterval(fetchQueue, 30000); return function() { if (refreshRef.current) clearInterval(refreshRef.current); }; }, [fetchQueue]);

  function selectPatient(tk: Token) {
    setSelected(tk);
    setTab("soap");
    setSubjective(tk.chief_complaint || "");
    setAssessment(""); setDiagnoses([]); setDiagInput(""); setSeverity("Mild"); setPlan("");
    setDrugs([]); setLabOrders([]); setRadOrders([]);
    setHistoryLoaded(false); setAllergiesLoaded(false);
    setPastVisits([]); setAllergies([]);
  }

  // Lazy load history
  useEffect(function() {
    if (tab === "history" && selected && !historyLoaded) {
      setHistoryLoaded(true);
      fetch("/api/patients/" + selected.patient_id + "/folder")
        .then(function(r) { return r.json(); })
        .then(function(j) { if (j.success && j.data) { setPastVisits(j.data.prescriptions || []); setAllergies(j.data.allergies || []); } })
        .catch(function() {});
    }
    if (tab === "allergies" && selected && !allergiesLoaded) {
      setAllergiesLoaded(true);
      fetch("/api/patients/" + selected.patient_id + "/folder")
        .then(function(r) { return r.json(); })
        .then(function(j) { if (j.success && j.data) { setAllergies(j.data.allergies || []); } })
        .catch(function() {});
    }
  }, [tab, selected, historyLoaded, allergiesLoaded]);

  // Drug search
  function searchDrugs(q: string) {
    setDrugSearch(q);
    if (drugDebounce.current) clearTimeout(drugDebounce.current);
    if (!q.trim()) { setDrugResults([]); return; }
    drugDebounce.current = setTimeout(async function() {
      setDrugSearching(true);
      try {
        var res = await fetch("/api/medicines/search?search=" + encodeURIComponent(q));
        var json = await res.json();
        setDrugResults(json.success ? (json.data || []).slice(0, 20) : []);
      } catch { setDrugResults([]); }
      finally { setDrugSearching(false); }
    }, 300);
  }

  function addDrug(name: string, generic?: string) {
    setDrugs(function(prev) { return [...prev, { name: name, generic: generic, dosage: "1-0-1", frequency: "After food", duration: "5", duration_unit: "days", quantity: "10", notes: "" }]; });
    setDrugSearch(""); setDrugResults([]);
  }

  function updateDrug(idx: number, key: keyof DrugRow, value: string) {
    setDrugs(function(prev) { var n = [...prev]; n[idx] = { ...n[idx], [key]: value }; return n; });
  }

  function removeDrug(idx: number) { setDrugs(function(prev) { return prev.filter(function(_, i) { return i !== idx; }); }); }

  // Test search
  function searchTests(q: string) {
    setTestSearch(q);
    if (testDebounce.current) clearTimeout(testDebounce.current);
    if (!q.trim()) { setTestResults([]); return; }
    testDebounce.current = setTimeout(async function() {
      setTestSearching(true);
      try {
        var res = await fetch("/api/investigations/search?search=" + encodeURIComponent(q));
        var json = await res.json();
        setTestResults(json.success ? (json.data || []).slice(0, 20) : []);
      } catch { setTestResults([]); }
      finally { setTestSearching(false); }
    }, 300);
  }

  function addLabOrder(name: string) {
    setLabOrders(function(prev) { return [...prev, { name: name, urgency: "Routine", notes: "" }]; });
    setTestSearch(""); setTestResults([]);
  }

  function addRadOrder() {
    setRadOrders(function(prev) { return [...prev, { modality: "X-ray", body_part: "", indication: "", urgency: "Routine" }]; });
  }

  function addDiagnosis() {
    if (diagInput.trim() && !diagnoses.includes(diagInput.trim())) {
      setDiagnoses(function(prev) { return [...prev, diagInput.trim()]; });
      setDiagInput("");
    }
  }

  // Save
  async function handleSave(complete: boolean) {
    if (!selected) return;
    setSaving(true);
    try {
      // 1. Save visit record
      var visitBody = {
        patient_id: selected.patient_id,
        doctor_id: selected.doctor_id || "",
        chief_complaint: subjective,
        diagnosis_primary: diagnoses[0] || assessment,
        diagnosis_secondary: diagnoses.slice(1).join(", "),
        severity: severity,
        examination_notes: "",
        advice: plan,
        prescription: drugs.map(function(d) { return { drug_name: d.name, generic: d.generic, dosage: d.dosage, frequency: d.frequency, duration: d.duration + " " + d.duration_unit, quantity: d.quantity, notes: d.notes }; }),
        lab_requests: labOrders,
        radiology_requests: radOrders,
        bp_systolic: selected.bp_systolic || 0,
        bp_diastolic: selected.bp_diastolic || 0,
        temperature: selected.temperature || 0,
        pulse: selected.pulse_rate || 0,
        spo2: selected.spo2 || 0,
        weight: selected.weight_kg || 0,
        status: complete ? "final" : "draft",
      };

      var vRes = await fetch("/api/emr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(visitBody) });
      var vJson = await vRes.json();
      if (!vJson.success) { setToast({ message: vJson.message || "Failed to save", type: "error" }); setSaving(false); return; }

      // 2. Submit orders if any
      if (labOrders.length > 0 || radOrders.length > 0) {
        var orderItems: Array<{ order_type: string; item_name: string; instructions?: string }> = [];
        for (var lo of labOrders) orderItems.push({ order_type: "lab", item_name: lo.name, instructions: lo.urgency + (lo.notes ? " - " + lo.notes : "") });
        for (var ro of radOrders) orderItems.push({ order_type: "radiology", item_name: ro.modality + " - " + ro.body_part, instructions: ro.indication + " | " + ro.urgency });
        if (orderItems.length > 0) {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token_id: selected.token_id, patient_id: selected.patient_id, orders: orderItems }),
          });
        }
      }

      // 3. Complete visit
      if (complete) {
        await fetch("/api/emr", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token_id: selected.token_id, status: "completed" }) });
      }

      setToast({ message: complete ? "Visit completed" : "Draft saved", type: "success" });
      fetchQueue();
      if (complete) {
        var remaining = tokens.filter(function(t) { return t.token_id !== selected?.token_id; });
        if (remaining.length > 0) selectPatient(remaining[0]); else { setSelected(null); }
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  var waitingCount = tokens.length;
  var drugAllergies = allergies.filter(function(a) { return a.allergy_type === "drug"; });

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}><span>{toast.type === "success" ? "\u2713" : "\u2717"}</span><span>{toast.message}</span></div>}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor EMR</h1>
        <p className="text-sm text-gray-500 mt-1">{waitingCount} patient{waitingCount !== 1 ? "s" : ""} in consultation queue</p>
      </div>

      {loading && <div className="grid grid-cols-1 lg:grid-cols-4 gap-4"><div className="rounded-xl border bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div><div className="lg:col-span-3 rounded-xl border bg-white p-4 animate-pulse"><div className="h-60 bg-gray-100 rounded" /></div></div>}

      {!loading && tokens.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-.644.879a4.5 4.5 0 01-6.312 1.035L12 15.75l-.844.664a4.5 4.5 0 01-6.312-1.035L4.2 14.5" /></svg></div>
          <p className="text-gray-500 font-medium">No patients in consultation queue</p>
          <p className="text-gray-400 text-xs mt-1">Patients will appear after triage sends them to the doctor.</p>
        </div>
      )}

      {!loading && tokens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Queue sidebar */}
          <div className="lg:col-span-3 xl:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{tokens.length}</span>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2 space-y-2">
                {tokens.map(function(tk) {
                  var isSel = selected?.token_id === tk.token_id;
                  var name = [tk.first_name, tk.last_name].filter(Boolean).join(" ") || "Patient";
                  var prio = tk.priority || 0;
                  return (
                    <button key={tk.token_id} onClick={function() { selectPatient(tk); }}
                      className={"w-full text-left p-3 rounded-lg border transition-colors " + (isSel ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200" : prio >= 3 ? "border-red-200 bg-red-50/50" : "border-gray-200 bg-white hover:border-gray-300")}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-purple-600">{tk.token_number}</span>
                        {prio >= 3 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">P{5 - prio}</span>}
                        {prio === 2 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">P3</span>}
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                      <div className="text-xs text-gray-500">{calcAge(tk.dob, tk.age)}/{capitalize(tk.gender)}{tk.blood_group ? " \u00B7 " + tk.blood_group : ""}</div>
                      {tk.bp_systolic && <div className="mt-1 flex gap-1 flex-wrap"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">BP {tk.bp_systolic}/{tk.bp_diastolic}</span>{tk.temperature ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">{tk.temperature}&deg;</span> : null}</div>}
                      {tk.chief_complaint && <div className="text-xs text-gray-400 mt-1 truncate italic">{tk.chief_complaint}</div>}
                      <div className="text-[10px] text-gray-400 mt-1">{timeAgo(tk.registered_at || tk.created_at)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* EMR Workspace */}
          <div className="lg:col-span-9 xl:col-span-9 flex flex-col">
            {!selected ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center flex-1"><p className="text-gray-400 text-sm">Select a patient from the queue</p></div>
            ) : (
              <>
                {/* Patient Header */}
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">{(selected.first_name || "P").charAt(0)}{(selected.last_name || "").charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-900">{selected.first_name} {selected.last_name || ""}</div>
                      <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
                        <span className="font-mono text-emerald-700">{selected.uhid}</span>
                        <span>{calcAge(selected.dob, selected.age)}/{capitalize(selected.gender)}</span>
                        {selected.blood_group && <span>{selected.blood_group}</span>}
                        <span>{selected.phone}</span>
                      </div>
                    </div>
                  </div>
                  {/* Drug allergy alert */}
                  {drugAllergies.length > 0 && (
                    <div className="mt-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      Drug Allergies: {drugAllergies.map(function(a) { return a.allergen; }).join(", ")}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-50 mb-3 overflow-x-auto">
                  {([["soap", "SOAP Notes"], ["rx", "Prescription"], ["orders", "Orders"], ["history", "History"], ["allergies", "Allergies"]] as [Tab, string][]).map(function(t) {
                    return <button key={t[0]} onClick={function() { setTab(t[0]); }} className={"px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (tab === t[0] ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>{t[1]}</button>;
                  })}
                </div>

                {/* Tab Content */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 flex-1 overflow-y-auto mb-3">

                  {/* SOAP */}
                  {tab === "soap" && (
                    <div className="space-y-5">
                      <div><label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">S — Subjective</label><textarea rows={3} value={subjective} onChange={function(e) { setSubjective(e.target.value); }} placeholder="Patient's complaints in their own words..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" /></div>

                      <div>
                        <label className="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">O — Objective (Vitals from Triage)</label>
                        <div className="flex flex-wrap gap-2">
                          {selected.bp_systolic && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">BP: {selected.bp_systolic}/{selected.bp_diastolic} mmHg</span>}
                          {selected.pulse_rate && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">Pulse: {selected.pulse_rate} bpm</span>}
                          {selected.temperature && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">Temp: {selected.temperature}&deg;</span>}
                          {selected.spo2 && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">SpO2: {selected.spo2}%</span>}
                          {selected.weight_kg && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">Wt: {selected.weight_kg} kg</span>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">A — Assessment / Diagnosis</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" value={diagInput} onChange={function(e) { setDiagInput(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") { e.preventDefault(); addDiagnosis(); } }} placeholder="Type diagnosis and press Enter..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                          <button onClick={addDiagnosis} className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200">Add</button>
                          <select value={severity} onChange={function(e) { setSeverity(e.target.value); }} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                            <option>Mild</option><option>Moderate</option><option>Severe</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diagnoses.map(function(d, i) {
                            return <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">{d}<button onClick={function() { setDiagnoses(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }} className="text-amber-400 hover:text-red-500">&times;</button></span>;
                          })}
                        </div>
                      </div>

                      <div><label className="block text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">P — Plan</label><textarea rows={3} value={plan} onChange={function(e) { setPlan(e.target.value); }} placeholder="Treatment plan, advice, instructions..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" /></div>
                    </div>
                  )}

                  {/* Prescription */}
                  {tab === "rx" && (
                    <div className="space-y-4">
                      {drugAllergies.length > 0 && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">Drug allergies: {drugAllergies.map(function(a) { return a.allergen; }).join(", ")}</div>}

                      {/* Drug search */}
                      <div className="relative">
                        <input type="text" value={drugSearch} onChange={function(e) { searchDrugs(e.target.value); }} placeholder="Search drug name..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                        {drugSearching && <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-400 shadow-lg z-10">Searching...</div>}
                        {drugResults.length > 0 && (
                          <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {drugResults.map(function(d) {
                              return <button key={d.id} onClick={function() { addDrug(d.name, d.generic); }} className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-sm border-b border-gray-50 last:border-0"><span className="font-medium">{d.name}</span>{d.generic && <span className="text-xs text-gray-400 ml-2">({d.generic})</span>}</button>;
                            })}
                          </div>
                        )}
                      </div>
                      <button onClick={function() { addDrug(drugSearch || "Custom Drug"); setDrugSearch(""); }} className="text-xs text-emerald-600 font-medium">+ Add custom drug</button>

                      {/* Drug table */}
                      {drugs.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b"><tr><th className="text-left px-3 py-2 font-medium">Drug</th><th className="text-left px-3 py-2 font-medium">Dosage</th><th className="text-left px-3 py-2 font-medium">Frequency</th><th className="text-left px-3 py-2 font-medium">Duration</th><th className="text-left px-3 py-2 font-medium">Qty</th><th className="text-left px-3 py-2 font-medium">Notes</th><th className="px-2 py-2"></th></tr></thead>
                            <tbody>
                              {drugs.map(function(d, i) {
                                return (
                                  <tr key={i} className="border-b border-gray-50">
                                    <td className="px-3 py-2"><div className="font-medium text-gray-900">{d.name}</div>{d.generic && <div className="text-gray-400 text-[10px]">{d.generic}</div>}</td>
                                    <td className="px-3 py-2"><select value={d.dosage} onChange={function(e) { updateDrug(i, "dosage", e.target.value); }} className="px-2 py-1 rounded border border-gray-200 text-xs w-20">{DOSAGES.map(function(ds) { return <option key={ds}>{ds}</option>; })}</select></td>
                                    <td className="px-3 py-2"><select value={d.frequency} onChange={function(e) { updateDrug(i, "frequency", e.target.value); }} className="px-2 py-1 rounded border border-gray-200 text-xs w-24">{FREQUENCIES.map(function(f) { return <option key={f}>{f}</option>; })}</select></td>
                                    <td className="px-3 py-2"><div className="flex gap-1"><input type="number" value={d.duration} onChange={function(e) { updateDrug(i, "duration", e.target.value); }} className="px-2 py-1 rounded border border-gray-200 text-xs w-12" /><select value={d.duration_unit} onChange={function(e) { updateDrug(i, "duration_unit", e.target.value); }} className="px-1 py-1 rounded border border-gray-200 text-xs">{DURATION_UNITS.map(function(u) { return <option key={u}>{u}</option>; })}</select></div></td>
                                    <td className="px-3 py-2"><input type="number" value={d.quantity} onChange={function(e) { updateDrug(i, "quantity", e.target.value); }} className="px-2 py-1 rounded border border-gray-200 text-xs w-14" /></td>
                                    <td className="px-3 py-2"><input type="text" value={d.notes} onChange={function(e) { updateDrug(i, "notes", e.target.value); }} placeholder="e.g., with warm water" className="px-2 py-1 rounded border border-gray-200 text-xs w-28" /></td>
                                    <td className="px-2 py-2"><button onClick={function() { removeDrug(i); }} className="text-gray-400 hover:text-red-500">&times;</button></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {drugs.length === 0 && <div className="text-center text-sm text-gray-400 py-6">No drugs added. Search above to add.</div>}
                    </div>
                  )}

                  {/* Orders */}
                  {tab === "orders" && (
                    <div className="space-y-6">
                      {/* Lab Orders */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Lab Orders</h3>
                        <div className="relative mb-2">
                          <input type="text" value={testSearch} onChange={function(e) { searchTests(e.target.value); }} placeholder="Search lab test..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                          {testSearching && <div className="absolute top-full mt-1 w-full bg-white border rounded-lg p-2 text-xs text-gray-400 shadow-lg z-10">Searching...</div>}
                          {testResults.length > 0 && (
                            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              {testResults.map(function(t) { return <button key={t.id} onClick={function() { addLabOrder(t.test_name); }} className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-sm border-b border-gray-50 last:border-0">{t.test_name}</button>; })}
                            </div>
                          )}
                        </div>
                        {labOrders.map(function(lo, i) {
                          return (
                            <div key={i} className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-900 flex-1">{lo.name}</span>
                              <select value={lo.urgency} onChange={function(e) { setLabOrders(function(prev) { var n = [...prev]; n[i] = { ...n[i], urgency: e.target.value }; return n; }); }} className="px-2 py-1 rounded border border-gray-200 text-xs">{URGENCIES.map(function(u) { return <option key={u}>{u}</option>; })}</select>
                              <button onClick={function() { setLabOrders(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }} className="text-gray-400 hover:text-red-500 text-sm">&times;</button>
                            </div>
                          );
                        })}
                        {labOrders.length === 0 && <p className="text-xs text-gray-400">No lab orders</p>}
                      </div>

                      {/* Radiology Orders */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-700">Radiology Orders</h3>
                          <button onClick={addRadOrder} className="text-xs text-emerald-600 font-medium">+ Add Imaging</button>
                        </div>
                        {radOrders.map(function(ro, i) {
                          return (
                            <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                              <select value={ro.modality} onChange={function(e) { setRadOrders(function(prev) { var n = [...prev]; n[i] = { ...n[i], modality: e.target.value }; return n; }); }} className="px-2 py-1.5 rounded border border-gray-200 text-xs">{MODALITIES.map(function(m) { return <option key={m}>{m}</option>; })}</select>
                              <input type="text" placeholder="Body part" value={ro.body_part} onChange={function(e) { setRadOrders(function(prev) { var n = [...prev]; n[i] = { ...n[i], body_part: e.target.value }; return n; }); }} className="px-2 py-1.5 rounded border border-gray-200 text-xs" />
                              <input type="text" placeholder="Indication" value={ro.indication} onChange={function(e) { setRadOrders(function(prev) { var n = [...prev]; n[i] = { ...n[i], indication: e.target.value }; return n; }); }} className="px-2 py-1.5 rounded border border-gray-200 text-xs" />
                              <div className="flex gap-1">
                                <select value={ro.urgency} onChange={function(e) { setRadOrders(function(prev) { var n = [...prev]; n[i] = { ...n[i], urgency: e.target.value }; return n; }); }} className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs">{URGENCIES.map(function(u) { return <option key={u}>{u}</option>; })}</select>
                                <button onClick={function() { setRadOrders(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }} className="text-gray-400 hover:text-red-500">&times;</button>
                              </div>
                            </div>
                          );
                        })}
                        {radOrders.length === 0 && <p className="text-xs text-gray-400">No radiology orders</p>}
                      </div>
                    </div>
                  )}

                  {/* History */}
                  {tab === "history" && (
                    <div className="space-y-3">
                      {pastVisits.length === 0 && <div className="text-center text-sm text-gray-400 py-8">No past visit records</div>}
                      {pastVisits.map(function(v) {
                        var rxList = Array.isArray(v.prescription) ? v.prescription as Array<{ drug_name?: string }> : [];
                        return (
                          <div key={v.id} className="rounded-lg border border-gray-200 p-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-gray-900">{v.diagnosis_primary || "Visit"}</span>
                              <span className="text-xs text-gray-400">{v.visit_date || (v.created_at ? new Date(v.created_at).toLocaleDateString() : "")}</span>
                            </div>
                            {rxList.length > 0 && <div className="text-xs text-gray-500">Rx: {rxList.map(function(r) { return r.drug_name || ""; }).filter(Boolean).join(", ")}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Allergies */}
                  {tab === "allergies" && (
                    <div className="space-y-3">
                      {allergies.length === 0 && <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 font-medium">No known allergies</div>}
                      {allergies.map(function(a) {
                        return (
                          <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200">
                            <div><span className="text-sm font-medium text-gray-900">{a.allergen}</span>{a.reaction && <span className="text-xs text-gray-500 ml-2">({a.reaction})</span>}</div>
                            <div className="flex gap-2 items-center">
                              {a.severity && <span className={"text-xs px-2 py-0.5 rounded-full " + (a.severity === "severe" || a.severity === "life_threatening" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{a.severity}</span>}
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{a.allergy_type || "other"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-0 rounded-xl border border-gray-200 bg-white px-5 py-3 flex gap-3 flex-wrap">
                  <button onClick={function() { handleSave(false); }} disabled={saving} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">{saving ? "Saving..." : "Save Draft"}</button>
                  <button onClick={function() { handleSave(true); }} disabled={saving} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? "Saving..." : "Save & Complete"}</button>
                  <button onClick={function() { window.print(); }} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Print Rx</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
