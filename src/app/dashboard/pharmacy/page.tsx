"use client";

import { useState, useEffect, useCallback } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface RxToken {
  token_id: string; patient_id: string; token_number: string; status: string;
  first_name?: string; last_name?: string; uhid?: string; phone?: string;
  gender?: string; age?: number; dob?: string; blood_group?: string;
  doctor_first_name?: string; doctor_last_name?: string;
  chief_complaint?: string; created_at?: number;
}

interface DrugItem {
  drug_name: string; generic?: string; dosage: string; frequency: string;
  duration: string; quantity: string; notes?: string;
}

interface Medicine {
  id: string; name: string; generic?: string; category?: string; form?: string;
  strength?: string; unit?: string; price?: number; gst_percent?: number;
  stock_qty?: number; reorder_level?: number; expiry_date?: string;
}

type ToastType = "success" | "error";
type Tab = "pending" | "dispensed" | "inventory";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatTime(epoch: number | undefined): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatINR(n: number): string {
  return "\u20B9" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function PharmacyPage() {
  var [tab, setTab] = useState<Tab>("pending");
  var [tokens, setTokens] = useState<RxToken[]>([]);
  var [dispensedTokens, setDispensedTokens] = useState<RxToken[]>([]);
  var [inventory, setInventory] = useState<Medicine[]>([]);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [selectedToken, setSelectedToken] = useState<RxToken | null>(null);
  var [prescription, setPrescription] = useState<DrugItem[]>([]);
  var [invSearch, setInvSearch] = useState("");
  var [saving, setSaving] = useState(false);

  // Dispense state
  var [dispenseQtys, setDispenseQtys] = useState<Record<number, string>>({});
  var [discount, setDiscount] = useState("0");
  var [paymentMode, setPaymentMode] = useState("cash");

  useEffect(function() { if (!toast) return; var t = setTimeout(function() { setToast(null); }, 4000); return function() { clearTimeout(t); }; }, [toast]);

  var fetchPending = useCallback(async function() {
    setLoading(true);
    try {
      var res = await fetch("/api/pharmacy?type=tokens");
      var json = await res.json();
      if (json.success && json.data) {
        var all = (json.data.tokens || []) as RxToken[];
        // Completed visits have prescriptions ready for pharmacy
        setTokens(all.filter(function(t) { return t.status === "completed"; }));
        setDispensedTokens(all.filter(function(t) { return t.status === "exited"; }));
      }
    } catch { setTokens([]); }
    finally { setLoading(false); }
  }, []);

  var fetchInventory = useCallback(async function() {
    setLoading(true);
    try {
      var qs = invSearch ? "?search=" + encodeURIComponent(invSearch) : "";
      var res = await fetch("/api/pharmacy?type=inventory" + (qs ? "&" + qs.slice(1) : ""));
      var json = await res.json();
      setInventory(json.success ? (json.data || []) : []);
    } catch { setInventory([]); }
    finally { setLoading(false); }
  }, [invSearch]);

  useEffect(function() {
    if (tab === "pending" || tab === "dispensed") fetchPending();
    if (tab === "inventory") fetchInventory();
  }, [tab, fetchPending, fetchInventory]);

  function selectForDispense(tk: RxToken) {
    setSelectedToken(tk);
    // Fetch visit record to get prescription
    fetch("/api/patients/" + tk.patient_id + "/folder")
      .then(function(r) { return r.json(); })
      .then(function(j) {
        if (j.success && j.data && j.data.prescriptions && j.data.prescriptions.length > 0) {
          var latest = j.data.prescriptions[0];
          var drugs = Array.isArray(latest.prescription) ? latest.prescription as DrugItem[] : [];
          setPrescription(drugs);
          var qtys: Record<number, string> = {};
          drugs.forEach(function(d, i) { qtys[i] = d.quantity || "1"; });
          setDispenseQtys(qtys);
        } else {
          setPrescription([]);
          setDispenseQtys({});
        }
      })
      .catch(function() { setPrescription([]); });
  }

  function calcSubtotal(): number {
    var total = 0;
    prescription.forEach(function(_, i) {
      var qty = parseInt(dispenseQtys[i]) || 0;
      total += qty * 10; // placeholder unit price
    });
    return total;
  }

  async function handleDispense(createBill: boolean) {
    if (!selectedToken) return;
    setSaving(true);
    try {
      // Create pharmacy orders for dispensed drugs
      var orderItems = prescription.map(function(d, i) {
        return {
          order_type: "pharmacy",
          item_name: d.drug_name || d.generic || "Drug",
          quantity: parseInt(dispenseQtys[i]) || 1,
          rate: 10,
          instructions: [d.dosage, d.frequency, d.duration].filter(Boolean).join(" | "),
        };
      });

      if (orderItems.length > 0) {
        var res = await fetch("/api/pharmacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_id: selectedToken.token_id,
            patient_id: selectedToken.patient_id,
            orders: orderItems,
          }),
        });
        var json = await res.json();
        if (!json.success) {
          setToast({ message: json.message || "Failed to dispense", type: "error" });
          setSaving(false);
          return;
        }
      }

      // Update token status to exited
      await fetch("/api/opd", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: selectedToken.token_id, status: "exited" }),
      });

      setToast({ message: createBill ? "Dispensed & billed" : "Dispensed successfully", type: "success" });
      setSelectedToken(null);
      setPrescription([]);
      fetchPending();
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  var subtotal = calcSubtotal();
  var discountAmt = parseFloat(discount) || 0;
  var gst = Math.round(subtotal * 0.12 * 100) / 100;
  var grandTotal = subtotal - discountAmt + gst;
  var lowStockCount = inventory.filter(function(m) { return (m.stock_qty || 0) <= (m.reorder_level || 5); }).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}><span>{toast.type === "success" ? "\u2713" : "\u2717"}</span><span>{toast.message}</span></div>}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
        <p className="text-sm text-gray-500 mt-1">Dispense prescriptions and manage stock</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button onClick={function() { setTab("pending"); }} className={"rounded-xl border bg-white p-4 text-left transition-colors " + (tab === "pending" ? "border-emerald-400 ring-1 ring-emerald-200" : "border-gray-200")}>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Rx</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{tokens.length}</div>
        </button>
        <button onClick={function() { setTab("dispensed"); }} className={"rounded-xl border bg-white p-4 text-left transition-colors " + (tab === "dispensed" ? "border-emerald-400 ring-1 ring-emerald-200" : "border-gray-200")}>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dispensed Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{dispensedTokens.length}</div>
        </button>
        <button onClick={function() { setTab("inventory"); }} className={"rounded-xl border bg-white p-4 text-left transition-colors " + (tab === "inventory" ? "border-emerald-400 ring-1 ring-emerald-200" : "border-gray-200")}>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inventory Items</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{inventory.length || "\u2014"}</div>
        </button>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low Stock Alerts</div>
          <div className={"text-2xl font-bold mt-1 " + (lowStockCount > 0 ? "text-amber-600" : "text-emerald-600")}>{lowStockCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-50 mb-4 overflow-x-auto">
        {([["pending", "Pending Rx"], ["dispensed", "Dispensed"], ["inventory", "Inventory"]] as [Tab, string][]).map(function(t) {
          return <button key={t[0]} onClick={function() { setTab(t[0]); }} className={"px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (tab === t[0] ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>{t[1]}</button>;
        })}
      </div>

      {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>}

      {/* Pending Rx */}
      {!loading && tab === "pending" && (
        <>
          {tokens.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5" /></svg></div>
              <p className="text-gray-500 font-medium">No pending prescriptions</p>
              <p className="text-gray-400 text-xs mt-1">Prescriptions from doctor EMR will appear here.</p>
            </div>
          )}
          {tokens.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Token</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Doctor</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Complaint</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Time</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(function(tk) {
                    var name = [tk.first_name, tk.last_name].filter(Boolean).join(" ") || "Patient";
                    var doc = [tk.doctor_first_name, tk.doctor_last_name].filter(Boolean).join(" ");
                    return (
                      <tr key={tk.token_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3"><span className="text-sm font-bold text-purple-600">{tk.token_number}</span></td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{name}</div>
                          <div className="text-xs text-gray-500">{tk.uhid} {calcAge(tk.dob, tk.age) ? "\u00B7 " + calcAge(tk.dob, tk.age) + "/" + capitalize(tk.gender) : ""}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{doc ? "Dr. " + doc : "\u2014"}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500 max-w-[200px] truncate">{tk.chief_complaint || "\u2014"}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatTime(tk.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={function() { selectForDispense(tk); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">Dispense</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Dispensed */}
      {!loading && tab === "dispensed" && (
        <>
          {dispensedTokens.length === 0 && <div className="rounded-xl border border-gray-200 bg-white p-16 text-center"><p className="text-gray-400 text-sm">No dispensed prescriptions today</p></div>}
          {dispensedTokens.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Token</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Doctor</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Time</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensedTokens.map(function(tk) {
                    var name = [tk.first_name, tk.last_name].filter(Boolean).join(" ") || "Patient";
                    var doc = [tk.doctor_first_name, tk.doctor_last_name].filter(Boolean).join(" ");
                    return (
                      <tr key={tk.token_id} className="border-b border-gray-50">
                        <td className="px-4 py-3"><span className="text-sm font-bold text-emerald-600">{tk.token_number}</span></td>
                        <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{name}</div><div className="text-xs text-gray-500">{tk.uhid}</div></td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{doc ? "Dr. " + doc : "\u2014"}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatTime(tk.created_at)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={function() { window.print(); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">Print Receipt</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Inventory */}
      {!loading && tab === "inventory" && (
        <div>
          <div className="mb-4">
            <input type="text" placeholder="Search drug name..." value={invSearch} onChange={function(e) { setInvSearch(e.target.value); }}
              className="w-full max-w-md px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
          {inventory.length === 0 && <div className="rounded-xl border border-gray-200 bg-white p-16 text-center"><p className="text-gray-400 text-sm">No medicines in inventory</p></div>}
          {inventory.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Drug</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Form</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Price</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">GST</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(function(m) {
                    return (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{m.name}</div>
                          {m.generic && <div className="text-xs text-gray-400">{m.generic}{m.strength ? " " + m.strength : ""}</div>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{m.category || "\u2014"}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{m.form || "\u2014"} {m.unit ? "(" + m.unit + ")" : ""}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{m.price ? formatINR(m.price) : "\u2014"}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">{m.gst_percent || 12}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 italic">Simplified view \u2014 full inventory management with batch tracking coming soon.</div>
            </div>
          )}
        </div>
      )}

      {/* Low stock banner */}
      {lowStockCount > 0 && tab !== "inventory" && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="text-sm text-amber-700 font-medium">{lowStockCount} drug{lowStockCount !== 1 ? "s" : ""} below reorder level</div>
          <button onClick={function() { setTab("inventory"); }} className="text-xs text-amber-700 font-semibold underline">View Inventory</button>
        </div>
      )}

      {/* Dispense Panel */}
      {selectedToken && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={function() { setSelectedToken(null); }} />
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Dispense Prescription</h2>
                  <p className="text-sm text-gray-500">{selectedToken.first_name} {selectedToken.last_name || ""} \u00B7 {selectedToken.uhid} \u00B7 {calcAge(selectedToken.dob, selectedToken.age)}/{capitalize(selectedToken.gender)}</p>
                </div>
                <button onClick={function() { setSelectedToken(null); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {prescription.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">No prescription found for this visit. The doctor may not have added drugs.</div>
              )}

              {prescription.length > 0 && (
                <>
                  {/* Drugs table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Drug</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Dosage</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Duration</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.map(function(d, i) {
                          return (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="px-3 py-2">
                                <div className="font-medium text-gray-900">{d.drug_name || d.generic || "Drug"}</div>
                                {d.generic && d.drug_name && <div className="text-[10px] text-gray-400">{d.generic}</div>}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600">{d.dosage} {d.frequency}</td>
                              <td className="px-3 py-2 text-xs text-gray-600">{d.duration}</td>
                              <td className="px-3 py-2 text-right">
                                <input type="number" value={dispenseQtys[i] || ""} onChange={function(e) { setDispenseQtys(function(prev) { return { ...prev, [i]: e.target.value }; }); }}
                                  className="w-16 px-2 py-1 rounded border border-gray-200 text-sm text-right" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-5 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatINR(subtotal)}</span></div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">Discount</span>
                      <input type="number" value={discount} onChange={function(e) { setDiscount(e.target.value); }} className="w-20 px-2 py-1 rounded border border-gray-200 text-sm text-right" />
                    </div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">GST (12%)</span><span>{formatINR(gst)}</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2"><span>Grand Total</span><span className="text-emerald-700">{formatINR(grandTotal)}</span></div>
                  </div>

                  {/* Payment mode */}
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Payment Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {["cash", "card", "upi", "insurance", "add_to_bill"].map(function(m) {
                        return <button key={m} onClick={function() { setPaymentMode(m); }} className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (paymentMode === m ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>{m === "add_to_bill" ? "Add to Bill" : m.charAt(0).toUpperCase() + m.slice(1)}</button>;
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button onClick={function() { handleDispense(true); }} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? "Processing..." : "Dispense & Bill"}</button>
                    <button onClick={function() { handleDispense(false); }} disabled={saving} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Dispense Only</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
