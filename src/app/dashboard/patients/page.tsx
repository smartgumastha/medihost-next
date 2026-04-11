"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  address_line1?: string;
  address_line2?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_relation?: string;
  preferred_language?: string;
  occupation?: string;
  notes?: string;
  aadhar_number?: string;
  abha_id?: string;
  identifiers?: string;
  insurance_status?: string;
  first_visit_at?: number;
  last_visit_at?: number;
  total_visits?: number;
  registered_at?: number;
  created_at?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(epoch: number | undefined | null): string {
  if (!epoch) return "—";
  var d = new Date(epoch);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function calcAge(dob: string | undefined | null): string {
  if (!dob) return "—";
  var birth = new Date(dob);
  var today = new Date();
  var age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return String(age);
}

function capitalize(s: string | undefined | null): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PatientsPage() {
  var [patients, setPatients] = useState<Patient[]>([]);
  var [total, setTotal] = useState(0);
  var [page, setPage] = useState(1);
  var [search, setSearch] = useState("");
  var [loading, setLoading] = useState(true);
  var [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  var [sortField, setSortField] = useState<"name" | "date">("date");
  var [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  var debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  var limit = 25;

  var fetchPatients = useCallback(async function(searchQuery: string, pageNum: number) {
    setLoading(true);
    try {
      var params = new URLSearchParams({ page: String(pageNum), limit: String(limit) });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      var res = await fetch("/api/patients?" + params.toString());
      var json = await res.json();
      if (json.success && json.data) {
        setPatients(json.data.patients || []);
        setTotal(json.data.total || 0);
      } else if (Array.isArray(json.data)) {
        setPatients(json.data);
        setTotal(json.data.length);
      } else if (Array.isArray(json.patients)) {
        setPatients(json.patients);
        setTotal(json.total || json.patients.length);
      } else {
        setPatients([]);
        setTotal(0);
      }
    } catch {
      setPatients([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() {
    fetchPatients(search, page);
  }, [page, fetchPatients]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(function() {
      setPage(1);
      fetchPatients(value, 1);
    }, 300);
  }

  var sorted = [...patients].sort(function(a, b) {
    if (sortField === "name") {
      var nameA = (a.first_name + " " + a.last_name).toLowerCase();
      var nameB = (b.first_name + " " + b.last_name).toLowerCase();
      return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    var dateA = a.registered_at || a.created_at || 0;
    var dateB = b.registered_at || b.created_at || 0;
    return sortDir === "asc" ? dateA - dateB : dateB - dateA;
  });

  function toggleSort(field: "name" | "date") {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  var totalPages = Math.ceil(total / limit);

  // Stats
  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  var todayCount = patients.filter(function(p) { return (p.registered_at || p.created_at || 0) >= todayStart; }).length;
  var monthCount = patients.filter(function(p) { return (p.registered_at || p.created_at || 0) >= monthStart; }).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total patients registered</p>
        </div>
        <Link href="/dashboard/patients/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Register Patient
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Patients</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{total}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{todayCount}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Month</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{monthCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search by name, phone, or UHID..."
            value={search}
            onChange={function(e) { handleSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">UHID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={function() { toggleSort("name"); }}>
                Name {sortField === "name" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Age</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={function() { toggleSort("date"); }}>
                Last Visit {sortField === "date" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map(function(_, i) {
              return (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 8 }).map(function(_, j) {
                    return <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 1 ? "60%" : "40%" }} /></td>;
                  })}
                </tr>
              );
            })}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
                  </div>
                  <p className="text-gray-500 font-medium">No patients registered yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Register your first patient to get started.</p>
                </td>
              </tr>
            )}
            {!loading && sorted.map(function(p) {
              return (
                <tr key={p.patient_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-700 font-medium">{p.uhid || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{capitalize(p.gender)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.age || calcAge(p.dob)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.last_visit_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={function() { setSelectedPatient(p); }} title="View" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button title="Edit" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/><path d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                      </button>
                      <button title="Print" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {loading && Array.from({ length: 4 }).map(function(_, i) {
          return (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          );
        })}
        {!loading && sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">No patients registered yet.</p>
            <p className="text-xs mt-1">Register your first patient.</p>
          </div>
        )}
        {!loading && sorted.map(function(p) {
          return (
            <div key={p.patient_id} className="rounded-xl border border-gray-200 bg-white p-4" onClick={function() { setSelectedPatient(p); }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{p.first_name} {p.last_name}</div>
                  <div className="text-xs text-emerald-700 font-mono mt-0.5">{p.uhid}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{capitalize(p.gender)}</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{p.phone}</span>
                <span>{p.city || "—"}</span>
                <span>Age: {p.age || calcAge(p.dob)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={function() { setPage(page - 1); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">Prev</button>
            <button disabled={page >= totalPages} onClick={function() { setPage(page + 1); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Detail Slide-over */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={function() { setSelectedPatient(null); }} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Close button */}
            <button onClick={function() { setSelectedPatient(null); }} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors z-10">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div className="p-6">
              {/* Patient header */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg mb-3">
                  {selectedPatient.first_name.charAt(0)}{selectedPatient.last_name?.charAt(0) || ""}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPatient.first_name} {selectedPatient.middle_name || ""} {selectedPatient.last_name}</h2>
                <p className="text-sm text-emerald-700 font-mono mt-1">UHID: {selectedPatient.uhid}</p>
              </div>

              {/* Basic Info */}
              <DetailSection title="Basic Information">
                <DetailRow label="Gender" value={capitalize(selectedPatient.gender)} />
                <DetailRow label="Date of Birth" value={selectedPatient.dob || "—"} />
                <DetailRow label="Age" value={selectedPatient.age ? String(selectedPatient.age) : calcAge(selectedPatient.dob)} />
                <DetailRow label="Blood Group" value={selectedPatient.blood_group || "—"} />
                <DetailRow label="Phone" value={selectedPatient.phone || "—"} />
                <DetailRow label="Email" value={selectedPatient.email || "—"} />
              </DetailSection>

              {/* Address */}
              <DetailSection title="Address">
                <DetailRow label="Address" value={selectedPatient.address || [selectedPatient.address_line1, selectedPatient.address_line2].filter(Boolean).join(", ") || "—"} />
                <DetailRow label="City" value={selectedPatient.city || "—"} />
                <DetailRow label="State" value={selectedPatient.state || "—"} />
                <DetailRow label="Pincode" value={selectedPatient.pincode || "—"} />
              </DetailSection>

              {/* Emergency Contact */}
              <DetailSection title="Emergency Contact">
                <DetailRow label="Name" value={selectedPatient.emergency_contact_name || "—"} />
                <DetailRow label="Phone" value={selectedPatient.emergency_contact_phone || "—"} />
                <DetailRow label="Relation" value={selectedPatient.emergency_relation || "—"} />
              </DetailSection>

              {/* Identifiers */}
              <DetailSection title="Identifiers">
                {selectedPatient.aadhar_number && <DetailRow label="Aadhar" value={selectedPatient.aadhar_number} />}
                {selectedPatient.abha_id && <DetailRow label="ABHA ID" value={selectedPatient.abha_id} />}
                {selectedPatient.identifiers && (function() {
                  try {
                    var ids = JSON.parse(selectedPatient.identifiers);
                    return Object.entries(ids).map(function([key, val]) {
                      return <DetailRow key={key} label={key.replace(/_/g, " ")} value={String(val)} />;
                    });
                  } catch { return null; }
                })()}
                {!selectedPatient.aadhar_number && !selectedPatient.abha_id && !selectedPatient.identifiers && <p className="text-xs text-gray-400">None recorded</p>}
              </DetailSection>

              {/* Clinical */}
              <DetailSection title="Clinical">
                <DetailRow label="Preferred Language" value={selectedPatient.preferred_language || "—"} />
                <DetailRow label="Occupation" value={selectedPatient.occupation || "—"} />
                <DetailRow label="Notes" value={selectedPatient.notes || "—"} />
              </DetailSection>

              {/* Visit History */}
              <DetailSection title="Visit History">
                <DetailRow label="First Visit" value={formatDate(selectedPatient.first_visit_at)} />
                <DetailRow label="Last Visit" value={formatDate(selectedPatient.last_visit_at)} />
                <DetailRow label="Total Visits" value={selectedPatient.total_visits ? String(selectedPatient.total_visits) : "0"} />
                <DetailRow label="Registered" value={formatDate(selectedPatient.registered_at || selectedPatient.created_at)} />
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pb-1 border-b border-gray-100">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
