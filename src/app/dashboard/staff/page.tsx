"use client";

import { useState, useEffect, useCallback } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface StaffMember {
  user_id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role_name?: string;
  role_master_id?: number;
  is_active?: boolean;
  specialization?: string;
}

type ToastType = "success" | "error";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

var ROLES = [
  { id: 3, name: "DOCTOR", label: "Doctor" },
  { id: 5, name: "NURSE", label: "Nurse" },
  { id: 6, name: "RECEPTIONIST", label: "Receptionist" },
  { id: 8, name: "LAB_TECHNICIAN", label: "Lab Technician" },
  { id: 9, name: "PATHOLOGIST", label: "Pathologist" },
  { id: 10, name: "PHARMACIST", label: "Pharmacist" },
  { id: 7, name: "BILLING", label: "Billing Staff" },
  { id: 4, name: "MANAGER", label: "Manager" },
];

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function StaffPage() {
  var [staff, setStaff] = useState<StaffMember[]>([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [roleFilter, setRoleFilter] = useState("ALL");
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [showAddModal, setShowAddModal] = useState(false);

  useEffect(function() { if (!toast) return; var t = setTimeout(function() { setToast(null); }, 4000); return function() { clearTimeout(t); }; }, [toast]);

  var fetchStaff = useCallback(async function() {
    setLoading(true);
    try {
      var res = await fetch("/api/staff");
      var json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaff(json.data);
      } else {
        setStaff([]);
      }
    } catch { setStaff([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(function() { fetchStaff(); }, [fetchStaff]);

  // Filter
  var filtered = staff.filter(function(s) {
    var matchRole = roleFilter === "ALL" || s.role_name === roleFilter;
    var matchSearch = !search.trim() || (s.first_name + " " + (s.last_name || "") + " " + s.email).toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  var roleLabel = function(roleName?: string): string {
    var found = ROLES.find(function(r) { return r.name === roleName; });
    return found ? found.label : roleName || "Staff";
  };

  var roleBadgeColor = function(roleName?: string): string {
    if (roleName === "DOCTOR") return "bg-purple-50 text-purple-700 border-purple-200";
    if (roleName === "NURSE") return "bg-blue-50 text-blue-700 border-blue-200";
    if (roleName === "RECEPTIONIST") return "bg-amber-50 text-amber-700 border-amber-200";
    if (roleName === "LAB_TECHNICIAN" || roleName === "PATHOLOGIST") return "bg-cyan-50 text-cyan-700 border-cyan-200";
    if (roleName === "PHARMACIST") return "bg-pink-50 text-pink-700 border-pink-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}><span>{toast.type === "success" ? "\u2713" : "\u2717"}</span><span>{toast.message}</span></div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.length} staff member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={function() { setShowAddModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search by name or email..." value={search} onChange={function(e) { setSearch(e.target.value); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </div>
        <select value={roleFilter} onChange={function(e) { setRoleFilter(e.target.value); }}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
          <option value="ALL">All Roles</option>
          {ROLES.map(function(r) { return <option key={r.name} value={r.name}>{r.label}</option>; })}
        </select>
      </div>

      {/* Loading */}
      {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">{search || roleFilter !== "ALL" ? "No staff match your filters" : "No staff added yet"}</p>
          <p className="text-gray-400 text-xs mt-1">Add doctors, nurses, and other staff to get started.</p>
        </div>
      )}

      {/* Staff Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Role</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(function(s) {
                var name = (s.first_name + " " + (s.last_name || "")).trim();
                var initials = (s.first_name?.charAt(0) || "") + (s.last_name?.charAt(0) || "");
                return (
                  <tr key={s.user_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">{initials}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{s.role_name === "DOCTOR" ? "Dr. " : ""}{name}</div>
                          <div className="text-xs text-gray-500 md:hidden">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{s.phone_number || "\u2014"}</td>
                    <td className="px-4 py-3">
                      <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + roleBadgeColor(s.role_name)}>{roleLabel(s.role_name)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={"w-2 h-2 rounded-full inline-block " + (s.is_active !== false ? "bg-emerald-500" : "bg-gray-300")} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <AddStaffModal
          onClose={function() { setShowAddModal(false); }}
          onSuccess={function(msg) { setToast({ message: msg, type: "success" }); setShowAddModal(false); fetchStaff(); }}
          onError={function(msg) { setToast({ message: msg, type: "error" }); }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Add Staff Modal                                                    */
/* ================================================================== */

function AddStaffModal({ onClose, onSuccess, onError }: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  var [firstName, setFirstName] = useState("");
  var [lastName, setLastName] = useState("");
  var [email, setEmail] = useState("");
  var [phone, setPhone] = useState("");
  var [roleId, setRoleId] = useState("3");
  var [specialization, setSpecialization] = useState("");
  var [password, setPassword] = useState("");
  var [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!firstName.trim()) { onError("First name is required"); return; }
    if (!email.trim()) { onError("Email is required"); return; }
    if (!password.trim()) { onError("Password is required"); return; }
    setSaving(true);
    try {
      var res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          role_master_id: parseInt(roleId),
          password: password,
          specialization: specialization.trim() || undefined,
        }),
      });
      var json = await res.json();
      if (json.success) {
        onSuccess("Staff member " + firstName + " added successfully");
      } else {
        onError(json.message || "Failed to create staff");
      }
    } catch {
      onError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
              <input type="text" value={firstName} onChange={function(e) { setFirstName(e.target.value); }} placeholder="First name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
              <input type="text" value={lastName} onChange={function(e) { setLastName(e.target.value); }} placeholder="Last name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="email@hospital.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input type="tel" value={phone} onChange={function(e) { setPhone(e.target.value); }} placeholder="10-digit phone"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role *</label>
            <select value={roleId} onChange={function(e) { setRoleId(e.target.value); }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
              {ROLES.map(function(r) { return <option key={r.id} value={r.id}>{r.label}</option>; })}
            </select>
          </div>

          {roleId === "3" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Specialization</label>
              <input type="text" value={specialization} onChange={function(e) { setSpecialization(e.target.value); }} placeholder="e.g., General Medicine, Cardiology..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
            <input type="password" value={password} onChange={function(e) { setPassword(e.target.value); }} placeholder="Login password"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          </div>

          <button onClick={handleCreate} disabled={saving}
            className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Creating..." : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
