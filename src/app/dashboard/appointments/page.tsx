"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Patient {
  patient_id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  uhid?: string;
  age?: number;
  gender?: string;
}

interface Appointment {
  appointment_id: string;
  patient_id: string;
  doctor_id?: string;
  type: string;
  scheduled_date: string;
  scheduled_time?: string;
  chief_complaint?: string;
  notes?: string;
  status: string;
  Patient?: Patient;
  doctor?: { first_name?: string; last_name?: string };
  created_at?: number;
}

type ToastType = "success" | "error";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateLabel(dateStr: string): string {
  var d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  var d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function statusColor(status: string): string {
  var s = status.toUpperCase();
  if (s === "BOOKED") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "CHECKED_IN" || s === "CHECKED-IN") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "IN_CONSULTATION" || s === "CONSULTING") return "bg-purple-50 text-purple-700 border-purple-200";
  if (s === "COMPLETED") return "bg-green-50 text-green-700 border-green-200";
  if (s === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AppointmentsPage() {
  var [selectedDate, setSelectedDate] = useState(todayStr());
  var [appointments, setAppointments] = useState<Appointment[]>([]);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [showBookModal, setShowBookModal] = useState(false);
  var [showSlotModal, setShowSlotModal] = useState(false);

  // Toast auto-dismiss
  useEffect(function() {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 4000);
    return function() { clearTimeout(t); };
  }, [toast]);

  var fetchAppointments = useCallback(async function(date: string) {
    setLoading(true);
    try {
      var res = await fetch("/api/appointments?date=" + date);
      var json = await res.json();
      if (json.success && json.data) {
        setAppointments(json.data.appointments || json.data || []);
      } else if (Array.isArray(json.data)) {
        setAppointments(json.data);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  function prevDay() { setSelectedDate(addDays(selectedDate, -1)); }
  function nextDay() { setSelectedDate(addDays(selectedDate, 1)); }
  function goToday() { setSelectedDate(todayStr()); }

  // Group by doctor
  var byDoctor: Record<string, { name: string; appointments: Appointment[] }> = {};
  for (var appt of appointments) {
    var docName = appt.doctor ? (appt.doctor.first_name || "") + " " + (appt.doctor.last_name || "") : "Unassigned";
    docName = docName.trim() || "Unassigned";
    if (!byDoctor[docName]) byDoctor[docName] = { name: docName, appointments: [] };
    byDoctor[docName].appointments.push(appt);
  }
  var doctorGroups = Object.values(byDoctor);

  async function cancelAppointment(appointmentId: string) {
    if (!confirm("Cancel this appointment?")) return;
    try {
      var res = await fetch("/api/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Appointment cancelled", type: "success" });
        fetchAppointments(selectedDate);
      } else {
        setToast({ message: json.message || "Failed to cancel", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">{appointments.length} appointments for this day</p>
        </div>
        <button onClick={function() { setShowSlotModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Book Appointment
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={prevDay} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-lg font-semibold text-gray-900">{formatDateLabel(selectedDate)}</div>
        <button onClick={nextDay} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        {selectedDate !== todayStr() && (
          <button onClick={goToday} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">Today</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(function(i) {
            return <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/4 mb-3" /><div className="h-4 bg-gray-100 rounded w-1/2 mb-2" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div>;
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No appointments for this date</p>
          <p className="text-gray-400 text-xs mt-1">Book an appointment to start accepting patients.</p>
          <button onClick={function() { setShowSlotModal(true); }} className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">Book Appointment</button>
        </div>
      )}

      {/* Doctor Groups */}
      {!loading && doctorGroups.map(function(group) {
        var booked = group.appointments.length;
        return (
          <div key={group.name} className="rounded-xl border border-gray-200 bg-white mb-4 overflow-hidden">
            {/* Doctor Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {group.name.split(" ").map(function(w) { return w.charAt(0); }).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Dr. {group.name}</div>
                  <div className="text-xs text-gray-500">{booked} patient{booked !== 1 ? "s" : ""} booked</div>
                </div>
              </div>
              <button onClick={function() { setShowBookModal(true); }} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">+ Book Patient</button>
            </div>

            {/* Appointment Rows */}
            <div className="divide-y divide-gray-50">
              {group.appointments.map(function(appt, idx) {
                var patientName = appt.Patient ? (appt.Patient.first_name + " " + (appt.Patient.last_name || "")).trim() : "Patient #" + (idx + 1);
                return (
                  <div key={appt.appointment_id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patientName}</div>
                        <div className="flex gap-2 mt-0.5">
                          {appt.scheduled_time && <span className="text-xs text-gray-500">{appt.scheduled_time}</span>}
                          {appt.chief_complaint && <span className="text-xs text-gray-400">&middot; {appt.chief_complaint}</span>}
                          {appt.type && appt.type !== "OPD" && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{appt.type}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + statusColor(appt.status)}>{appt.status}</span>
                      {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                        <button onClick={function() { cancelAppointment(appt.appointment_id); }} title="Cancel" className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Book Patient Modal */}
      {showBookModal && (
        <BookPatientModal
          selectedDate={selectedDate}
          onClose={function() { setShowBookModal(false); }}
          onSuccess={function(msg) { setToast({ message: msg, type: "success" }); setShowBookModal(false); fetchAppointments(selectedDate); }}
          onError={function(msg) { setToast({ message: msg, type: "error" }); }}
        />
      )}

      {/* Open Slot / Book Appointment Modal */}
      {showSlotModal && (
        <OpenSlotModal
          selectedDate={selectedDate}
          onClose={function() { setShowSlotModal(false); }}
          onSuccess={function(msg) { setToast({ message: msg, type: "success" }); setShowSlotModal(false); fetchAppointments(selectedDate); }}
          onError={function(msg) { setToast({ message: msg, type: "error" }); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Book Patient Modal                                                 */
/* ------------------------------------------------------------------ */

function BookPatientModal({ selectedDate, onClose, onSuccess, onError }: {
  selectedDate: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  var [search, setSearch] = useState("");
  var [patients, setPatients] = useState<Patient[]>([]);
  var [searching, setSearching] = useState(false);
  var [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  var [chiefComplaint, setChiefComplaint] = useState("");
  var [apptType, setApptType] = useState("OPD");
  var [time, setTime] = useState("09:00");
  var [submitting, setSubmitting] = useState(false);
  var debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        } else if (Array.isArray(json.patients)) {
          setPatients(json.patients);
        }
      } catch { setPatients([]); }
      finally { setSearching(false); }
    }, 300);
  }

  async function handleBook() {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      var res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.patient_id,
          scheduled_date: selectedDate,
          scheduled_time: time,
          type: apptType,
          chief_complaint: chiefComplaint,
          booked_via: "DASHBOARD",
        }),
      });
      var json = await res.json();
      if (json.success) {
        onSuccess("Appointment booked for " + selectedPatient.first_name);
      } else {
        onError(json.message || "Failed to book");
      }
    } catch {
      onError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Book Patient</h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {!selectedPatient ? (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="text" placeholder="Search patient by name or phone..." value={search} onChange={function(e) { handleSearch(e.target.value); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" autoFocus />
              </div>

              {/* Results */}
              {searching && <div className="text-center text-sm text-gray-400 py-4">Searching...</div>}
              {!searching && patients.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
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
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-2">No patients found</p>
                  <Link href="/dashboard/patients/new" className="text-sm text-emerald-600 font-medium hover:underline">Register new patient</Link>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected patient */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{selectedPatient.first_name} {selectedPatient.last_name || ""}</div>
                  <div className="text-xs text-gray-500">{selectedPatient.phone} {selectedPatient.uhid ? "\u00B7 " + selectedPatient.uhid : ""}</div>
                </div>
                <button onClick={function() { setSelectedPatient(null); }} className="text-xs text-gray-500 hover:text-red-500">Change</button>
              </div>

              {/* Booking form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Appointment Time</label>
                  <input type="time" value={time} onChange={function(e) { setTime(e.target.value); }} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <div className="flex gap-2">
                    {["OPD", "Follow-up", "Emergency"].map(function(t) {
                      return (
                        <button key={t} onClick={function() { setApptType(t); }}
                          className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (apptType === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Chief Complaint</label>
                  <input type="text" value={chiefComplaint} onChange={function(e) { setChiefComplaint(e.target.value); }} placeholder="e.g., Fever, headache..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <button onClick={handleBook} disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Open Slot / Quick Book Modal                                       */
/* ------------------------------------------------------------------ */

function OpenSlotModal({ selectedDate, onClose, onSuccess, onError }: {
  selectedDate: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  var [patientName, setPatientName] = useState("");
  var [patientPhone, setPatientPhone] = useState("");
  var [time, setTime] = useState("09:00");
  var [apptType, setApptType] = useState("OPD");
  var [chiefComplaint, setChiefComplaint] = useState("");
  var [date, setDate] = useState(selectedDate);
  var [submitting, setSubmitting] = useState(false);

  // Search existing patient by phone
  var [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  var debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePhoneChange(value: string) {
    setPatientPhone(value);
    setFoundPatient(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 10) {
      debounceRef.current = setTimeout(async function() {
        try {
          var res = await fetch("/api/patients?search=" + encodeURIComponent(value));
          var json = await res.json();
          var list = json.success && json.data ? (Array.isArray(json.data) ? json.data : json.data.patients || []) : [];
          if (list.length > 0) setFoundPatient(list[0]);
        } catch { /* silent */ }
      }, 300);
    }
  }

  async function handleSubmit() {
    if (!foundPatient && !patientPhone) {
      onError("Enter patient phone number");
      return;
    }
    setSubmitting(true);
    try {
      var body: Record<string, string> = {
        scheduled_date: date,
        scheduled_time: time,
        type: apptType,
        chief_complaint: chiefComplaint,
        booked_via: "DASHBOARD",
      };
      if (foundPatient) {
        body.patient_id = foundPatient.patient_id;
      } else {
        // If no patient found, we still need a patient_id. Show error.
        onError("Patient not found. Register the patient first.");
        setSubmitting(false);
        return;
      }

      var res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var json = await res.json();
      if (json.success) {
        onSuccess("Appointment booked successfully");
      } else {
        onError(json.message || "Failed to book");
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
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Patient Phone *</label>
            <input type="tel" value={patientPhone} onChange={function(e) { handlePhoneChange(e.target.value); }} placeholder="10-digit phone"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            {foundPatient && (
              <div className="mt-1 text-xs text-emerald-600 font-medium">Found: {foundPatient.first_name} {foundPatient.last_name || ""} ({foundPatient.uhid || foundPatient.phone})</div>
            )}
            {patientPhone.length >= 10 && !foundPatient && (
              <div className="mt-1 text-xs text-amber-600">Patient not found. <Link href="/dashboard/patients/new" className="text-emerald-600 underline">Register first</Link></div>
            )}
          </div>

          {!foundPatient && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Patient Name (for reference)</label>
              <input type="text" value={patientName} onChange={function(e) { setPatientName(e.target.value); }} placeholder="Name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input type="date" value={date} onChange={function(e) { setDate(e.target.value); }}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
              <input type="time" value={time} onChange={function(e) { setTime(e.target.value); }}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <div className="flex gap-2">
              {["OPD", "Follow-up", "Emergency"].map(function(t) {
                return (
                  <button key={t} onClick={function() { setApptType(t); }}
                    className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (apptType === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chief Complaint</label>
            <input type="text" value={chiefComplaint} onChange={function(e) { setChiefComplaint(e.target.value); }} placeholder="e.g., Fever, cough..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          </div>

          <button onClick={handleSubmit} disabled={submitting || (!foundPatient)}
            className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
