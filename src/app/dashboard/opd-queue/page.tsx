"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

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
  token_type?: string;
  visit_type?: string;
  first_name?: string;
  last_name?: string;
  uhid?: string;
  phone?: string;
  gender?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse_rate?: number;
  temperature?: number;
  spo2?: number;
  weight_kg?: number;
  registered_at?: number;
  triaged_at?: number;
  called_at?: number;
  consultation_start_at?: number;
  consultation_end_at?: number;
  created_at?: number;
}

interface SearchPatient {
  patient_id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  uhid?: string;
}

type ToastType = "success" | "error";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

var COLUMNS = [
  { key: "registered", label: "Waiting", color: "border-blue-400", bg: "bg-blue-50", text: "text-blue-700", nextStatus: "triaged", nextLabel: "Send to Triage" },
  { key: "triaged", label: "In Triage", color: "border-amber-400", bg: "bg-amber-50", text: "text-amber-700", nextStatus: "consulting", nextLabel: "Send to Doctor" },
  { key: "consulting", label: "With Doctor", color: "border-purple-400", bg: "bg-purple-50", text: "text-purple-700", nextStatus: "completed", nextLabel: "Complete" },
  { key: "completed", label: "Completed", color: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", nextStatus: "", nextLabel: "" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayLabel(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function timeAgo(epoch: number | undefined): string {
  if (!epoch) return "";
  var mins = Math.round((Date.now() - epoch) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m ago";
}

function formatTime(epoch: number | undefined): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function OPDQueuePage() {
  var [tokens, setTokens] = useState<Token[]>([]);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [showIssueModal, setShowIssueModal] = useState(false);
  var refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(function() {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 4000);
    return function() { clearTimeout(t); };
  }, [toast]);

  var fetchQueue = useCallback(async function() {
    try {
      var res = await fetch("/api/opd");
      var json = await res.json();
      if (json.success && json.data) {
        setTokens(json.data.tokens || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(function() {
    fetchQueue();
    refreshRef.current = setInterval(fetchQueue, 30000);
    return function() { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [fetchQueue]);

  async function updateStatus(tokenId: string, newStatus: string) {
    try {
      var res = await fetch("/api/opd", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: tokenId, status: newStatus }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Status updated to " + newStatus, type: "success" });
        fetchQueue();
      } else {
        setToast({ message: json.message || "Failed to update", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    }
  }

  // Bucket tokens into columns. "called" maps to consulting column.
  function bucketStatus(status: string): string {
    if (status === "called") return "consulting";
    if (status === "exited") return "completed";
    return status;
  }

  var buckets: Record<string, Token[]> = { registered: [], triaged: [], consulting: [], completed: [] };
  for (var tk of tokens) {
    var b = bucketStatus(tk.status);
    if (buckets[b]) buckets[b].push(tk);
  }

  var total = tokens.length;
  var waiting = buckets.registered.length;
  var inTriage = buckets.triaged.length;
  var withDoc = buckets.consulting.length;
  var done = buckets.completed.length;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD Queue</h1>
          <p className="text-sm text-gray-500 mt-1">{todayLabel()}</p>
        </div>
        <button onClick={function() { setShowIssueModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Issue Token
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatPill label="Total" value={total} color="bg-gray-100 text-gray-700" />
        <StatPill label="Waiting" value={waiting} color="bg-blue-50 text-blue-700" />
        <StatPill label="In Triage" value={inTriage} color="bg-amber-50 text-amber-700" />
        <StatPill label="With Doctor" value={withDoc} color="bg-purple-50 text-purple-700" />
        <StatPill label="Completed" value={done} color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(function(i) {
            return <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/2 mb-3" /><div className="h-20 bg-gray-100 rounded" /></div>;
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && total === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No patients in queue today</p>
          <p className="text-gray-400 text-xs mt-1">Issue a token to get started.</p>
          <button onClick={function() { setShowIssueModal(true); }} className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">Issue Token</button>
        </div>
      )}

      {/* Kanban Columns */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(function(col) {
            var colTokens = buckets[col.key] || [];
            var isCompleted = col.key === "completed";
            return (
              <div key={col.key} className="flex flex-col">
                {/* Column Header */}
                <div className={"rounded-t-xl border-t-4 " + col.color + " bg-white border border-gray-200 border-t-0 px-4 py-3 flex items-center justify-between"}>
                  <div className="flex items-center gap-2">
                    <span className={"text-sm font-semibold " + col.text}>{col.label}</span>
                    <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + col.bg + " " + col.text}>{colTokens.length}</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-gray-50/50 border border-t-0 border-gray-200 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                  {colTokens.length === 0 && (
                    <div className="text-center text-xs text-gray-400 py-8">No patients</div>
                  )}
                  {colTokens.map(function(tk) {
                    var patientName = [tk.first_name, tk.last_name].filter(Boolean).join(" ") || "Patient";
                    var doctorName = [tk.doctor_first_name, tk.doctor_last_name].filter(Boolean).join(" ");
                    return (
                      <div key={tk.token_id} className={"rounded-lg border bg-white p-3 transition-all " + (isCompleted ? "border-gray-100" : "border-gray-200 shadow-sm")}>
                        {/* Token # + Priority */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={"text-lg font-bold " + (tk.token_type === "appointment" ? "text-blue-600" : "text-emerald-600")}>{tk.token_number}</span>
                          {tk.priority && tk.priority > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-bold">PRIORITY</span>
                          )}
                        </div>

                        {/* Patient Info */}
                        <div className="text-sm font-medium text-gray-900">{patientName}</div>
                        <div className="flex gap-2 mt-0.5 text-xs text-gray-500">
                          {tk.uhid && <span className="font-mono">{tk.uhid}</span>}
                          {tk.phone && <span>{tk.phone}</span>}
                        </div>

                        {/* Chief Complaint */}
                        {tk.chief_complaint && !isCompleted && (
                          <div className="mt-1.5 text-xs text-gray-500 italic truncate">{tk.chief_complaint}</div>
                        )}

                        {/* Vitals summary (in triage+) */}
                        {col.key !== "registered" && !isCompleted && tk.bp_systolic && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">BP: {tk.bp_systolic}/{tk.bp_diastolic}</span>
                            {tk.pulse_rate && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">HR: {tk.pulse_rate}</span>}
                            {tk.spo2 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">SpO2: {tk.spo2}%</span>}
                          </div>
                        )}

                        {/* Doctor name (with doctor / completed) */}
                        {doctorName && (col.key === "consulting" || isCompleted) && (
                          <div className="mt-1.5 text-xs text-purple-600 font-medium">Dr. {doctorName}</div>
                        )}

                        {/* Time info */}
                        <div className="mt-1.5 text-[10px] text-gray-400">
                          {isCompleted ? "Done " + formatTime(tk.consultation_end_at) : timeAgo(tk.registered_at || tk.created_at)}
                        </div>

                        {/* Action button */}
                        {col.nextStatus && tk.status !== "cancelled" && (
                          <button onClick={function() { updateStatus(tk.token_id, col.nextStatus); }}
                            className={"mt-2 w-full py-1.5 rounded-md text-xs font-medium transition-colors " + col.bg + " " + col.text + " border " + col.color + " hover:opacity-80"}>
                            {col.nextLabel} &rarr;
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Token Modal */}
      {showIssueModal && (
        <IssueTokenModal
          onClose={function() { setShowIssueModal(false); }}
          onSuccess={function(msg) { setToast({ message: msg, type: "success" }); setShowIssueModal(false); fetchQueue(); }}
          onError={function(msg) { setToast({ message: msg, type: "error" }); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Pill                                                          */
/* ------------------------------------------------------------------ */

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={"px-3 py-1.5 rounded-full text-xs font-medium " + color}>
      {label}: <span className="font-bold">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Token Modal                                                  */
/* ------------------------------------------------------------------ */

function IssueTokenModal({ onClose, onSuccess, onError }: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  var [mode, setMode] = useState<"walkin" | "appointment">("walkin");
  var [search, setSearch] = useState("");
  var [patients, setPatients] = useState<SearchPatient[]>([]);
  var [searching, setSearching] = useState(false);
  var [selectedPatient, setSelectedPatient] = useState<SearchPatient | null>(null);
  var [chiefComplaint, setChiefComplaint] = useState("");
  var [doctorId, setDoctorId] = useState("");
  var [submitting, setSubmitting] = useState(false);
  var debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Doctors list + today's appointments
  var [doctors, setDoctors] = useState<Array<{ user_id: string; first_name: string; last_name?: string }>>([]);
  var [todayAppts, setTodayAppts] = useState<Array<{ appointment_id: string; patient_id: string; doctor_id?: string; Patient?: { first_name?: string; last_name?: string; phone?: string; uhid?: string }; scheduled_time?: string; chief_complaint?: string; doctor?: { first_name?: string; last_name?: string } }>>([]);

  // Fetch doctors from staff API on mount
  useEffect(function() {
    fetch("/api/staff")
      .then(function(r) { return r.json(); })
      .then(function(json) {
        if (json.success && json.data) {
          var staff = Array.isArray(json.data) ? json.data : [];
          var docList = staff.filter(function(s: { role_name?: string; role_master_id?: number }) {
            return s.role_name === "DOCTOR" || s.role_master_id === 3;
          }).map(function(s: { user_id: string; first_name: string; last_name?: string }) {
            return { user_id: String(s.user_id), first_name: s.first_name, last_name: s.last_name };
          });
          setDoctors(docList);
        }
      })
      .catch(function() { /* silent */ });

    // Also fetch today's appointments for "From Appointment" mode
    fetch("/api/appointments?date=" + new Date().toISOString().slice(0, 10))
      .then(function(r) { return r.json(); })
      .then(function(json) {
        if (json.success && json.data) {
          var appts = json.data.appointments || json.data || [];
          setTodayAppts(appts.filter(function(a: { status: string }) { return a.status === "BOOKED"; }));
        }
      })
      .catch(function() { /* silent */ });
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setPatients([]); return; }
    debounceRef.current = setTimeout(async function() {
      setSearching(true);
      try {
        var res = await fetch("/api/patients?search=" + encodeURIComponent(value.trim()));
        var json = await res.json();
        if (json.success && json.data) {
          setPatients(Array.isArray(json.data) ? json.data : json.data.patients || []);
        }
      } catch { setPatients([]); }
      finally { setSearching(false); }
    }, 300);
  }

  async function handleIssue() {
    if (!selectedPatient) { onError("Select a patient first"); return; }
    if (!doctorId) { onError("Select a doctor"); return; }
    setSubmitting(true);
    try {
      var body: Record<string, string> = {
        patient_id: selectedPatient.patient_id,
        doctor_id: doctorId,
        token_type: mode === "appointment" ? "appointment" : "walkin",
        visit_type: "new",
        chief_complaint: chiefComplaint,
      };

      var res = await fetch("/api/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var json = await res.json();
      if (json.success && json.data?.token) {
        onSuccess("Token " + json.data.token.token_number + " issued for " + selectedPatient.first_name);
      } else {
        onError(json.message || "Failed to issue token");
      }
    } catch {
      onError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Issue Token</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-5">
          <button onClick={function() { setMode("walkin"); setSelectedPatient(null); setDoctorId(""); }}
            className={"flex-1 py-2 rounded-lg text-sm font-medium border transition-colors " + (mode === "walkin" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>
            Walk-in
          </button>
          <button onClick={function() { setMode("appointment"); setSelectedPatient(null); setDoctorId(""); }}
            className={"flex-1 py-2 rounded-lg text-sm font-medium border transition-colors " + (mode === "appointment" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>
            From Appointment
          </button>
        </div>

        {/* Appointment mode */}
        {mode === "appointment" && !selectedPatient && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {todayAppts.length === 0 && <div className="text-center text-sm text-gray-400 py-4">No booked appointments today</div>}
            {todayAppts.map(function(a) {
              var name = a.Patient ? (a.Patient.first_name || "") + " " + (a.Patient.last_name || "") : "Patient";
              var docName = a.doctor ? "Dr. " + (a.doctor.first_name || "") + " " + (a.doctor.last_name || "") : "";
              return (
                <button key={a.appointment_id} onClick={function() {
                  setSelectedPatient({ patient_id: a.patient_id, first_name: a.Patient?.first_name || "", last_name: a.Patient?.last_name, phone: a.Patient?.phone, uhid: a.Patient?.uhid });
                  if (a.chief_complaint) setChiefComplaint(a.chief_complaint);
                  if (a.doctor_id) setDoctorId(String(a.doctor_id));
                }} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">{name.trim()}</span>
                    <span className="text-xs text-gray-500">{a.scheduled_time || ""}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{a.Patient?.phone || ""} {docName ? "\u00B7 " + docName : ""} {a.chief_complaint ? "\u00B7 " + a.chief_complaint : ""}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Walk-in mode: patient search */}
        {mode === "walkin" && !selectedPatient && (
          <>
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input type="text" placeholder="Search patient by name or phone..." value={search} onChange={function(e) { handleSearch(e.target.value); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" autoFocus />
            </div>
            {searching && <div className="text-center text-sm text-gray-400 py-3">Searching...</div>}
            {!searching && patients.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {patients.map(function(p) {
                  return (
                    <button key={p.patient_id} onClick={function() { setSelectedPatient(p); }} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                      <div className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name || ""}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.phone || ""} {p.uhid ? "\u00B7 " + p.uhid : ""}</div>
                    </button>
                  );
                })}
              </div>
            )}
            {!searching && search.trim() && patients.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-2">No patients found</p>
                <Link href="/dashboard/patients/new" className="text-sm text-emerald-600 font-medium hover:underline">Register new patient</Link>
              </div>
            )}
          </>
        )}

        {/* Selected patient + form */}
        {selectedPatient && (
          <>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{selectedPatient.first_name} {selectedPatient.last_name || ""}</div>
                <div className="text-xs text-gray-500">{selectedPatient.phone} {selectedPatient.uhid ? "\u00B7 " + selectedPatient.uhid : ""}</div>
              </div>
              <button onClick={function() { setSelectedPatient(null); setDoctorId(""); }} className="text-xs text-gray-500 hover:text-red-500">Change</button>
            </div>

            <div className="space-y-4">
              {/* Doctor dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Doctor *</label>
                <select value={doctorId} onChange={function(e) { setDoctorId(e.target.value); }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select doctor</option>
                  {doctors.map(function(d) {
                    return <option key={d.user_id} value={d.user_id}>Dr. {d.first_name} {d.last_name || ""}</option>;
                  })}
                </select>
                {doctors.length === 0 && <p className="text-xs text-amber-600 mt-1">No doctors found. Book an appointment first to register doctors.</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Chief Complaint</label>
                <input type="text" value={chiefComplaint} onChange={function(e) { setChiefComplaint(e.target.value); }} placeholder="e.g., Fever, headache..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>

              <button onClick={handleIssue} disabled={submitting || !doctorId}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Issuing..." : "Issue Token"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
