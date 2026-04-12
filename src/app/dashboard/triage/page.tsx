"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Token {
  token_id: string;
  token_number: string;
  patient_id: string;
  doctor_id?: string;
  status: string;
  chief_complaint?: string;
  priority?: number;
  first_name?: string;
  last_name?: string;
  uhid?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  age?: number;
  blood_group?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  spo2?: number;
  weight_kg?: number;
  registered_at?: number;
  created_at?: number;
}

interface VitalsForm {
  bp_systolic: string;
  bp_diastolic: string;
  pulse_rate: string;
  temperature: string;
  temp_unit: string;
  spo2: string;
  weight_kg: string;
  height_cm: string;
  respiratory_rate: string;
  blood_glucose: string;
  glucose_type: string;
  pain_score: number;
  chief_complaint: string;
  nurse_notes: string;
  priority: number;
}

type ToastType = "success" | "error";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(epoch: number | undefined): string {
  if (!epoch) return "";
  var mins = Math.round((Date.now() - epoch) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
}

function calcAge(dob: string | undefined, age: number | undefined): string {
  if (age) return age + "y";
  if (!dob) return "";
  var birth = new Date(dob);
  var today = new Date();
  var a = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) a--;
  return a + "y";
}

function capitalize(s: string | undefined): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function calcBMI(w: string, h: string): string {
  var wn = parseFloat(w);
  var hn = parseFloat(h);
  if (!wn || !hn || hn === 0) return "";
  return (wn / Math.pow(hn / 100, 2)).toFixed(1);
}

function painColor(score: number): string {
  if (score <= 3) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  return "bg-red-500";
}

var EMPTY_VITALS: VitalsForm = {
  bp_systolic: "", bp_diastolic: "", pulse_rate: "", temperature: "", temp_unit: "F",
  spo2: "", weight_kg: "", height_cm: "", respiratory_rate: "", blood_glucose: "",
  glucose_type: "random", pain_score: 0, chief_complaint: "", nurse_notes: "", priority: 0,
};

var PRIORITY_OPTIONS = [
  { value: 0, label: "Routine (P5)", color: "text-gray-600" },
  { value: 1, label: "Soon (P4)", color: "text-blue-600" },
  { value: 2, label: "Urgent (P3)", color: "text-amber-600" },
  { value: 3, label: "Very Urgent (P2)", color: "text-orange-600" },
  { value: 4, label: "Emergency (P1)", color: "text-red-600" },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TriagePage() {
  var [tokens, setTokens] = useState<Token[]>([]);
  var [loading, setLoading] = useState(true);
  var [selected, setSelected] = useState<Token | null>(null);
  var [vitals, setVitals] = useState<VitalsForm>({ ...EMPTY_VITALS });
  var [saving, setSaving] = useState(false);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(function() {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 4000);
    return function() { clearTimeout(t); };
  }, [toast]);

  var fetchQueue = useCallback(async function() {
    try {
      var res = await fetch("/api/triage");
      var json = await res.json();
      if (json.success && json.data) {
        var all = (json.data.tokens || []) as Token[];
        // Show registered (waiting) and triaged (in triage) tokens
        setTokens(all.filter(function(t) { return t.status === "registered" || t.status === "triaged"; }));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(function() {
    fetchQueue();
    refreshRef.current = setInterval(fetchQueue, 30000);
    return function() { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [fetchQueue]);

  function selectPatient(tk: Token) {
    setSelected(tk);
    setVitals({
      ...EMPTY_VITALS,
      chief_complaint: tk.chief_complaint || "",
      bp_systolic: tk.bp_systolic ? String(tk.bp_systolic) : "",
      bp_diastolic: tk.bp_diastolic ? String(tk.bp_diastolic) : "",
      pulse_rate: tk.pulse_rate ? String(tk.pulse_rate) : "",
      temperature: tk.temperature ? String(tk.temperature) : "",
      spo2: tk.spo2 ? String(tk.spo2) : "",
      weight_kg: tk.weight_kg ? String(tk.weight_kg) : "",
      priority: tk.priority || 0,
    });
  }

  function setV<K extends keyof VitalsForm>(key: K, value: VitalsForm[K]) {
    setVitals(function(prev) { return { ...prev, [key]: value }; });
  }

  async function saveVitals(sendToDoctor: boolean) {
    if (!selected) return;
    setSaving(true);
    try {
      // Save vitals
      var body: Record<string, unknown> = {
        token_id: selected.token_id,
        patient_id: selected.patient_id,
        bp_systolic: vitals.bp_systolic ? Number(vitals.bp_systolic) : null,
        bp_diastolic: vitals.bp_diastolic ? Number(vitals.bp_diastolic) : null,
        pulse_rate: vitals.pulse_rate ? Number(vitals.pulse_rate) : null,
        temperature: vitals.temperature ? Number(vitals.temperature) : null,
        temp_unit: vitals.temp_unit,
        spo2: vitals.spo2 ? Number(vitals.spo2) : null,
        weight_kg: vitals.weight_kg ? Number(vitals.weight_kg) : null,
        height_cm: vitals.height_cm ? Number(vitals.height_cm) : null,
        respiratory_rate: vitals.respiratory_rate ? Number(vitals.respiratory_rate) : null,
        blood_glucose: vitals.blood_glucose ? Number(vitals.blood_glucose) : null,
        chief_complaint: vitals.chief_complaint,
        nurse_notes: vitals.nurse_notes,
      };

      var res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var json = await res.json();

      if (!json.success) {
        setToast({ message: json.message || "Failed to save vitals", type: "error" });
        setSaving(false);
        return;
      }

      // If send to doctor, update status
      if (sendToDoctor) {
        await fetch("/api/triage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_id: selected.token_id, status: "consulting" }),
        });
      }

      setToast({ message: sendToDoctor ? "Vitals saved, sent to doctor" : "Vitals saved as draft", type: "success" });

      // Auto-select next patient
      fetchQueue();
      var savedId = selected?.token_id;
      var remaining = tokens.filter(function(t) { return t.token_id !== savedId && t.status === "registered"; });
      if (remaining.length > 0) {
        selectPatient(remaining[0]);
      } else {
        setSelected(null);
        setVitals({ ...EMPTY_VITALS });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  // Alerts
  var alerts: { text: string; severity: "red" | "amber" }[] = [];
  if (vitals.bp_systolic && Number(vitals.bp_systolic) >= 180 && vitals.bp_diastolic && Number(vitals.bp_diastolic) >= 120) {
    alerts.push({ text: "Hypertensive Crisis \u2014 notify doctor immediately", severity: "red" });
  }
  if (vitals.spo2 && Number(vitals.spo2) < 90) {
    alerts.push({ text: "Low oxygen saturation \u2014 immediate attention required", severity: "red" });
  }
  if (vitals.temperature && vitals.temp_unit === "F" && Number(vitals.temperature) > 103) {
    alerts.push({ text: "High fever (>" + "103\u00B0F)", severity: "amber" });
  }
  if (vitals.temperature && vitals.temp_unit === "C" && Number(vitals.temperature) > 39.4) {
    alerts.push({ text: "High fever (>" + "39.4\u00B0C)", severity: "amber" });
  }
  if (vitals.pain_score >= 8) {
    alerts.push({ text: "Severe pain (score " + vitals.pain_score + "/10)", severity: "amber" });
  }

  var bmi = calcBMI(vitals.weight_kg, vitals.height_cm);
  var waitingCount = tokens.filter(function(t) { return t.status === "registered"; }).length;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}>
          <span>{toast.type === "success" ? "\u2713" : "\u2717"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nurse Triage</h1>
        <p className="text-sm text-gray-500 mt-1">{waitingCount} patient{waitingCount !== 1 ? "s" : ""} waiting for triage</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-60 bg-gray-100 rounded" /></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && tokens.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No patients waiting for triage</p>
          <p className="text-gray-400 text-xs mt-1">Patients will appear here when sent from OPD Queue.</p>
        </div>
      )}

      {/* Main Layout */}
      {!loading && tokens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Patient Queue List (left) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{tokens.length}</span>
              </div>

              {/* Mobile: horizontal scroll, Desktop: vertical list */}
              <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto flex lg:flex-col overflow-x-auto lg:overflow-x-hidden gap-2 p-2">
                {tokens.map(function(tk) {
                  var isSelected = selected?.token_id === tk.token_id;
                  var patientName = [tk.first_name, tk.last_name].filter(Boolean).join(" ") || "Patient";
                  var ageGender = [calcAge(tk.dob, tk.age), capitalize(tk.gender)].filter(Boolean).join("/");
                  var isWaiting = tk.status === "registered";
                  return (
                    <button key={tk.token_id} onClick={function() { selectPatient(tk); }}
                      className={"flex-shrink-0 lg:flex-shrink w-64 lg:w-full text-left p-3 rounded-lg border transition-colors " + (isSelected ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200" : "border-gray-200 bg-white hover:border-gray-300")}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={"text-base font-bold " + (isWaiting ? "text-blue-600" : "text-amber-600")}>{tk.token_number}</span>
                        <span className={"text-[10px] px-1.5 py-0.5 rounded-full font-medium " + (isWaiting ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600")}>{isWaiting ? "Waiting" : "Triaged"}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{patientName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{ageGender}{tk.uhid ? " \u00B7 " + tk.uhid : ""}</div>
                      {tk.chief_complaint && <div className="text-xs text-gray-400 mt-1 truncate italic">{tk.chief_complaint}</div>}
                      <div className="text-[10px] text-gray-400 mt-1">Waiting {timeAgo(tk.registered_at || tk.created_at)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vitals Form (right) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {!selected ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-400 text-sm">Select a patient from the queue to record vitals</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Patient Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                      {(selected.first_name || "P").charAt(0)}{(selected.last_name || "").charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900">{selected.first_name} {selected.last_name || ""}</div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {selected.uhid && <span className="font-mono">{selected.uhid}</span>}
                        <span>{calcAge(selected.dob, selected.age)}/{capitalize(selected.gender)}</span>
                        {selected.blood_group && <span>{selected.blood_group}</span>}
                        <span className="text-emerald-600 font-medium">{selected.token_number}</span>
                      </div>
                    </div>
                  </div>
                  {selected.doctor_first_name && (
                    <div className="text-xs text-purple-600 font-medium">Dr. {selected.doctor_first_name} {selected.doctor_last_name || ""}</div>
                  )}
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="px-5 py-2 space-y-1">
                    {alerts.map(function(a, i) {
                      return (
                        <div key={i} className={"flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium " + (a.severity === "red" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                          <span>{a.severity === "red" ? "\u26A0" : "\u26A0"}</span>
                          <span>{a.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vitals Grid */}
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Blood Pressure */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Blood Pressure <span className="text-gray-400">mmHg</span></label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Sys" value={vitals.bp_systolic} onChange={function(e) { setV("bp_systolic", e.target.value); }} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                        <span className="flex items-center text-gray-400">/</span>
                        <input type="number" placeholder="Dia" value={vitals.bp_diastolic} onChange={function(e) { setV("bp_diastolic", e.target.value); }} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                      </div>
                    </div>

                    {/* Pulse Rate */}
                    <VitalInput label="Pulse Rate" unit="bpm" value={vitals.pulse_rate} onChange={function(v) { setV("pulse_rate", v); }} />

                    {/* Temperature */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Temperature</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.1" placeholder="Temp" value={vitals.temperature} onChange={function(e) { setV("temperature", e.target.value); }} className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                        <select value={vitals.temp_unit} onChange={function(e) { setV("temp_unit", e.target.value); }} className="px-2 py-2.5 rounded-lg border border-gray-200 text-sm">
                          <option value="F">&deg;F</option>
                          <option value="C">&deg;C</option>
                        </select>
                      </div>
                    </div>

                    {/* SpO2 */}
                    <VitalInput label="SpO2" unit="%" value={vitals.spo2} onChange={function(v) { setV("spo2", v); }} />

                    {/* Weight */}
                    <VitalInput label="Weight" unit="kg" value={vitals.weight_kg} onChange={function(v) { setV("weight_kg", v); }} />

                    {/* Height */}
                    <VitalInput label="Height" unit="cm" value={vitals.height_cm} onChange={function(v) { setV("height_cm", v); }} />

                    {/* BMI */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">BMI <span className="text-gray-400">(auto)</span></label>
                      <input type="text" readOnly value={bmi} className="w-full px-3 py-2.5 rounded-lg border border-gray-100 text-sm bg-gray-50 text-gray-600" />
                    </div>

                    {/* Blood Glucose */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Blood Sugar <span className="text-gray-400">mg/dL</span></label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Value" value={vitals.blood_glucose} onChange={function(e) { setV("blood_glucose", e.target.value); }} className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                        <select value={vitals.glucose_type} onChange={function(e) { setV("glucose_type", e.target.value); }} className="px-2 py-2.5 rounded-lg border border-gray-200 text-sm">
                          <option value="fasting">Fasting</option>
                          <option value="pp">PP</option>
                          <option value="random">Random</option>
                        </select>
                      </div>
                    </div>

                    {/* Respiratory Rate */}
                    <VitalInput label="Respiratory Rate" unit="/min" value={vitals.respiratory_rate} onChange={function(v) { setV("respiratory_rate", v); }} />
                  </div>

                  {/* Pain Score */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Pain Score: <span className="font-bold text-gray-900">{vitals.pain_score}/10</span></label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">0</span>
                      <div className="flex-1 relative">
                        <input type="range" min="0" max="10" value={vitals.pain_score} onChange={function(e) { setV("pain_score", Number(e.target.value)); }}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: "linear-gradient(to right, #22c55e, #eab308, #ef4444)" }} />
                      </div>
                      <span className="text-xs text-gray-400">10</span>
                      <span className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + painColor(vitals.pain_score)}>{vitals.pain_score}</span>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Chief Complaint</label>
                    <textarea rows={2} value={vitals.chief_complaint} onChange={function(e) { setV("chief_complaint", e.target.value); }} placeholder="Presenting complaints..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITY_OPTIONS.map(function(opt) {
                        var isActive = vitals.priority === opt.value;
                        return (
                          <button key={opt.value} onClick={function() { setV("priority", opt.value); }}
                            className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (isActive ? (opt.value >= 3 ? "bg-red-600 text-white border-red-600" : opt.value >= 2 ? "bg-amber-600 text-white border-amber-600" : "bg-emerald-600 text-white border-emerald-600") : "bg-white border-gray-200 " + opt.color)}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nurse Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nurse Notes</label>
                    <textarea rows={2} value={vitals.nurse_notes} onChange={function(e) { setV("nurse_notes", e.target.value); }} placeholder="Observations, allergies noted..."
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={function() { saveVitals(true); }} disabled={saving}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? "Saving..." : "Save & Send to Doctor"}
                    </button>
                    <button onClick={function() { saveVitals(false); }} disabled={saving}
                      className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function VitalInput({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label} <span className="text-gray-400">{unit}</span></label>
      <input type="number" step="any" value={value} onChange={function(e) { onChange(e.target.value); }} placeholder={label}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
    </div>
  );
}
