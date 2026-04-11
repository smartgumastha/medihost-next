"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Patient {
  patient_id: string;
  uhid: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  maiden_name?: string;
  gp_name?: string;
  phone: string;
  email?: string;
  gender: string;
  dob?: string;
  age?: number;
  blood_group?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_relation?: string;
  preferred_language?: string;
  occupation?: string;
  notes?: string;
  aadhar_number?: string;
  abha_id?: string;
  first_visit_at?: number;
  last_visit_at?: number;
  total_visits?: number;
  created_at?: number;
}

interface Visit {
  id: string;
  token_number?: string;
  status?: string;
  department?: string;
  doctor_name?: string;
  chief_complaint?: string;
  vitals?: Record<string, unknown>;
  notes?: string;
  created_at?: number;
}

interface Prescription {
  visit_record_id: string;
  doctor_id?: string;
  diagnosis?: string;
  subjective?: string;
  notes?: string;
  prescription?: { drug_name?: string; dosage?: string; duration?: string; frequency?: string }[];
  visit_date?: number;
  created_at?: number;
}

interface Bill {
  id: string;
  bill_number?: string;
  total?: number;
  discount?: number;
  net_total?: number;
  payment_status?: string;
  payment_mode?: string;
  created_at?: number;
}

interface Allergy {
  id: string;
  allergy_type?: string;
  allergen: string;
  reaction?: string;
  severity?: string;
  created_at?: number;
}

interface FollowUp {
  id: string;
  doctor_id?: string;
  follow_up_date?: string;
  status?: string;
  notes?: string;
}

interface LabReport {
  id: string;
  order_type?: string;
  order_details?: { name?: string; status?: string };
  status?: string;
  notes?: string;
  created_at?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(epoch: number | undefined | null): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(n: number | string | undefined | null): string {
  var num = Number(n) || 0;
  return "\u20B9" + num.toLocaleString("en-IN");
}

function calcAge(dob: string | undefined | null): string {
  if (!dob) return "\u2014";
  var birth = new Date(dob);
  var today = new Date();
  var age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return String(age) + "y";
}

function capitalize(s: string | undefined | null): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

var TABS = ["Overview", "Visits", "Reports", "Prescriptions", "Bills", "Documents"];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function PatientFolderPage({ params }: { params: Promise<{ id: string }> }) {
  var { id } = use(params);
  var [loading, setLoading] = useState(true);
  var [patient, setPatient] = useState<Patient | null>(null);
  var [visits, setVisits] = useState<Visit[]>([]);
  var [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  var [bills, setBills] = useState<Bill[]>([]);
  var [allergies, setAllergies] = useState<Allergy[]>([]);
  var [followups, setFollowups] = useState<FollowUp[]>([]);
  var [reports, setReports] = useState<LabReport[]>([]);
  var [tab, setTab] = useState("Overview");

  useEffect(function() {
    async function load() {
      setLoading(true);
      try {
        var res = await fetch("/api/patients/" + id + "/folder");
        var json = await res.json();
        if (json.success && json.data) {
          setPatient(json.data.patient || null);
          setVisits(json.data.visits || []);
          setPrescriptions(json.data.prescriptions || []);
          setBills(json.data.bills || []);
          setAllergies(json.data.allergies || []);
          setFollowups(json.data.upcoming_followups || []);
          setReports(json.data.reports || []);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto text-center py-20">
        <p className="text-gray-500">Patient not found</p>
        <Link href="/dashboard/patients" className="text-emerald-600 text-sm mt-2 inline-block">Back to patients</Link>
      </div>
    );
  }

  var fullName = [patient.first_name, patient.middle_name, patient.last_name, patient.suffix].filter(Boolean).join(" ");
  var ageStr = patient.age ? patient.age + "y" : calcAge(patient.dob);
  var outstandingBills = bills.filter(function(b) { return b.payment_status !== "paid"; });
  var outstandingBalance = outstandingBills.reduce(function(sum, b) { return sum + (Number(b.net_total || b.total) || 0); }, 0);
  var nextFollowup = followups.length > 0 ? followups[0] : null;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/patients" className="hover:text-emerald-600 transition-colors">Patients</Link>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">{fullName}</span>
      </div>

      {/* Patient Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl flex-shrink-0">
            {patient.first_name.charAt(0)}{(patient.last_name || "").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
              <span className="font-mono text-emerald-700">{patient.uhid}</span>
              <span>{ageStr} / {capitalize(patient.gender)}</span>
              {patient.blood_group && <span>{patient.blood_group}</span>}
              <span>{patient.phone}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">Edit</button>
          </div>
        </div>
        {/* Allergy badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allergies.length === 0 && (
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">No known allergies</span>
          )}
          {allergies.map(function(a) {
            return (
              <span key={a.id} className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {a.allergen} {a.severity ? "(" + a.severity + ")" : ""}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-50 mb-6 overflow-x-auto">
        {TABS.map(function(t) {
          return (
            <button key={t} onClick={function() { setTab(t); }}
              className={"px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              {t}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Visits</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{patient.total_visits || visits.length || 0}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Last Visit</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{formatDate(patient.last_visit_at)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</div>
              <div className={"text-xl font-bold mt-1 " + (outstandingBalance > 0 ? "text-red-600" : "text-emerald-600")}>{formatINR(outstandingBalance)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Next Follow-up</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{nextFollowup ? nextFollowup.follow_up_date : "\u2014"}</div>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Recent Visits</h3>
              {visits.length > 5 && <button onClick={function() { setTab("Visits"); }} className="text-xs text-emerald-600 font-medium">View all</button>}
            </div>
            {visits.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No visits recorded</div>}
            {visits.slice(0, 5).map(function(v) {
              return (
                <div key={v.id} className="px-5 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{v.doctor_name || "Doctor"}</div>
                    <div className="text-xs text-gray-500">{v.chief_complaint || v.department || "General"}</div>
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(v.created_at)}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Bills */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Recent Bills</h3>
              {bills.length > 5 && <button onClick={function() { setTab("Bills"); }} className="text-xs text-emerald-600 font-medium">View all</button>}
            </div>
            {bills.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No bills</div>}
            {bills.slice(0, 5).map(function(b) {
              return (
                <div key={b.id} className="px-5 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{b.bill_number || "#"}</div>
                    <div className="text-xs text-gray-500">{formatDate(b.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatINR(b.net_total || b.total)}</div>
                    <span className={"text-xs px-1.5 py-0.5 rounded-full " + (b.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{b.payment_status || "pending"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visits Tab */}
      {tab === "Visits" && (
        <div className="space-y-3">
          {visits.length === 0 && <EmptyState text="No visits recorded" />}
          {visits.map(function(v) {
            return (
              <div key={v.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{v.doctor_name || "Doctor"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{v.department || "General"} &middot; Token #{v.token_number || "\u2014"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{formatDate(v.created_at)}</div>
                    <span className={"text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block " + (v.status === "completed" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>{v.status || "open"}</span>
                  </div>
                </div>
                {v.chief_complaint && <div className="mt-2 text-sm text-gray-700"><span className="text-gray-400">CC:</span> {v.chief_complaint}</div>}
                {v.vitals && Object.keys(v.vitals).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(v.vitals).map(function([k, val]) {
                      return <span key={k} className="text-xs px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-600">{k}: {String(val)}</span>;
                    })}
                  </div>
                )}
                {v.notes && <div className="mt-2 text-xs text-gray-500 italic">{v.notes}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Reports Tab */}
      {tab === "Reports" && (
        <div className="space-y-3">
          {reports.length === 0 && <EmptyState text="No lab reports" />}
          {reports.map(function(r) {
            var name = r.order_details?.name || "Lab Test";
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatDate(r.created_at)}</div>
                </div>
                <span className={"text-xs px-2 py-0.5 rounded-full " + (r.status === "completed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{r.status || "pending"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescriptions Tab */}
      {tab === "Prescriptions" && (
        <div className="space-y-3">
          {prescriptions.length === 0 && <EmptyState text="No prescriptions" />}
          {prescriptions.map(function(p) {
            var drugs = Array.isArray(p.prescription) ? p.prescription : [];
            return (
              <div key={p.visit_record_id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-semibold text-gray-900">{p.diagnosis || "Visit"}</div>
                  <div className="text-xs text-gray-400">{formatDate(p.created_at || p.visit_date)}</div>
                </div>
                {p.subjective && <div className="text-xs text-gray-500 mb-2">{p.subjective}</div>}
                {drugs.length > 0 && (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-1.5 font-medium text-gray-600">Drug</th>
                          <th className="text-left px-3 py-1.5 font-medium text-gray-600">Dosage</th>
                          <th className="text-left px-3 py-1.5 font-medium text-gray-600">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.map(function(d, idx) {
                          return (
                            <tr key={idx} className="border-t border-gray-50">
                              <td className="px-3 py-1.5 text-gray-900">{d.drug_name || "\u2014"}</td>
                              <td className="px-3 py-1.5 text-gray-600">{d.dosage || "\u2014"} {d.frequency || ""}</td>
                              <td className="px-3 py-1.5 text-gray-600">{d.duration || "\u2014"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bills Tab */}
      {tab === "Bills" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {bills.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No bills</div>}
          {bills.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Bill #</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(function(b) {
                  return (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{b.bill_number || "#"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{formatDate(b.created_at)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatINR(b.net_total || b.total)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={"text-xs px-2 py-0.5 rounded-full " + (b.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{b.payment_status || "pending"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button className="text-xs text-emerald-600 font-medium hover:underline">Print</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {tab === "Documents" && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
          </div>
          <p className="text-gray-500 font-medium">Upload documents coming soon</p>
          <p className="text-xs text-gray-400 mt-1">Attach lab reports, prescriptions, and other files to this patient record</p>
          <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-8 text-gray-300 text-sm">
            Drop files here or click to upload
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
