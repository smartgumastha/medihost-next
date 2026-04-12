"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Bill {
  id: string; hospital_id?: string; patient_id?: string; patient_name?: string;
  patient_display_name?: string; first_name?: string; last_name?: string;
  uhid?: string; mrn?: string; gender?: string; age?: number;
  bill_number?: string; items?: string | Array<{ item_name?: string; item_type?: string; quantity?: number; rate?: number; amount?: number }>;
  total?: number; discount?: number; net_total?: number; gst?: number;
  paid?: number; balance?: number; payment_status?: string; payment_mode?: string;
  doctor_name?: string; branch_name?: string; notes?: string;
  created_at?: number; updated_at?: number;
}

interface SearchPatient { patient_id: string; first_name: string; last_name?: string; phone?: string; uhid?: string; }

type ToastType = "success" | "error";
type Tab = "pending" | "today" | "receipts" | "eod";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatINR(n: number | string | undefined): string {
  var num = Number(n) || 0;
  return "\u20B9" + num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(epoch: number | undefined): string {
  if (!epoch) return "\u2014";
  return new Date(epoch).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + " " + new Date(epoch).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status: string | undefined): string {
  if (status === "paid") return "bg-green-50 text-green-700 border-green-200";
  if (status === "partial") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function parseItems(items: Bill["items"]): Array<{ item_name?: string; item_type?: string; quantity?: number; rate?: number; amount?: number }> {
  if (!items) return [];
  if (typeof items === "string") { try { return JSON.parse(items); } catch { return []; } }
  return items;
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function BillingDeskPage() {
  var [tab, setTab] = useState<Tab>("pending");
  var [bills, setBills] = useState<Bill[]>([]);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  var [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  var [saving, setSaving] = useState(false);
  var [showQuickBill, setShowQuickBill] = useState(false);

  // Payment collection state
  var [payAmount, setPayAmount] = useState("");
  var [payMode, setPayMode] = useState("cash");
  var [payRef, setPayRef] = useState("");

  // EOD
  var [eodData, setEodData] = useState<Record<string, unknown> | null>(null);

  useEffect(function() { if (!toast) return; var t = setTimeout(function() { setToast(null); }, 4000); return function() { clearTimeout(t); }; }, [toast]);

  var fetchBills = useCallback(async function(status?: string) {
    setLoading(true);
    try {
      var today = Date.now() - (Date.now() % 86400000);
      var qs = "from_date=" + today;
      if (status && status !== "all") qs += "&status=" + status;
      var res = await fetch("/api/billing-desk?" + qs);
      var json = await res.json();
      setBills(json.success ? (json.data || []) : []);
    } catch { setBills([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(function() {
    if (tab === "pending") fetchBills("unpaid");
    else if (tab === "today" || tab === "receipts") fetchBills();
    else if (tab === "eod") {
      fetchBills();
      fetch("/api/reports/eod").then(function(r) { return r.json(); }).then(function(j) { if (j.success && j.data) setEodData(j.data); }).catch(function() {});
    }
  }, [tab, fetchBills]);

  function refresh() {
    if (tab === "pending") fetchBills("unpaid");
    else fetchBills();
  }

  // Auto-charge: generate bill from orders
  async function generateBillFromOrders(patientId: string) {
    setSaving(true);
    try {
      var res = await fetch("/api/billing-desk/from-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Bill " + (json.data?.bill_number || "") + " generated", type: "success" });
        refresh();
      } else {
        setToast({ message: json.message || "Failed to generate bill", type: "error" });
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  // Collect payment
  async function collectPayment() {
    if (!selectedBill) return;
    var amount = parseFloat(payAmount) || 0;
    if (amount <= 0) { setToast({ message: "Enter valid amount", type: "error" }); return; }
    setSaving(true);
    try {
      var total = Number(selectedBill.net_total || selectedBill.total) || 0;
      var alreadyPaid = Number(selectedBill.paid) || 0;
      var newPaid = alreadyPaid + amount;
      var newBalance = Math.max(0, total - newPaid);
      var newStatus = newBalance <= 0 ? "paid" : "partial";

      var res = await fetch("/api/billing-desk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill_id: selectedBill.id,
          payment_mode: payMode,
          payment_status: newStatus,
          paid: newPaid,
          balance: newBalance,
          notes: payRef ? "Ref: " + payRef : "",
        }),
      });
      var json = await res.json();
      if (json.success) {
        setToast({ message: "Payment collected \u2014 " + formatINR(amount), type: "success" });
        setSelectedBill(null);
        refresh();
      } else {
        setToast({ message: json.message || "Failed", type: "error" });
      }
    } catch { setToast({ message: "Network error", type: "error" }); }
    finally { setSaving(false); }
  }

  function openBillDetail(bill: Bill) {
    setSelectedBill(bill);
    var bal = Number(bill.balance) || (Number(bill.net_total || bill.total) || 0) - (Number(bill.paid) || 0);
    setPayAmount(String(Math.max(0, bal)));
    setPayMode("cash");
    setPayRef("");
  }

  // Stats
  var todayTotal = bills.reduce(function(s, b) { return s + (b.payment_status === "paid" ? (Number(b.net_total || b.total) || 0) : 0); }, 0);
  var pendingCount = bills.filter(function(b) { return b.payment_status !== "paid"; }).length;
  var billCount = bills.length;
  var avgBill = billCount > 0 ? Math.round(todayTotal / Math.max(1, bills.filter(function(b) { return b.payment_status === "paid"; }).length)) : 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {toast && <div className={"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600")}><span>{toast.type === "success" ? "\u2713" : "\u2717"}</span><span>{toast.message}</span></div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Desk</h1>
          <p className="text-sm text-gray-500 mt-1">Patient billing and payment collection</p>
        </div>
        <button onClick={function() { setShowQuickBill(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Quick Bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today&apos;s Collection</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(todayTotal)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Bills</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{pendingCount}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bills Today</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{billCount}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Bill Value</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{formatINR(avgBill)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg border border-gray-200 bg-gray-50 mb-4 overflow-x-auto">
        {([["pending", "Pending"], ["today", "Today\u2019s Bills"], ["receipts", "Receipts"], ["eod", "End of Day"]] as [Tab, string][]).map(function(t) {
          return <button key={t[0]} onClick={function() { setTab(t[0]); }} className={"px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors " + (tab === t[0] ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>{t[1]}</button>;
        })}
      </div>

      {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>}

      {/* Pending */}
      {!loading && tab === "pending" && (
        <>
          {bills.length === 0 && <EmptyState text="No pending bills" sub="All bills are paid or no unbilled orders exist." />}
          {bills.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Bill #</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Total</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Paid</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Balance</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(function(b) {
                    var name = b.patient_display_name || b.patient_name || [b.first_name, b.last_name].filter(Boolean).join(" ") || "Patient";
                    var total = Number(b.net_total || b.total) || 0;
                    var paid = Number(b.paid) || 0;
                    var balance = total - paid;
                    return (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.bill_number || "#"}</td>
                        <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{name}</div><div className="text-xs text-gray-500">{b.uhid || b.mrn || ""}</div></td>
                        <td className="px-4 py-3 text-right hidden md:table-cell font-medium">{formatINR(total)}</td>
                        <td className="px-4 py-3 text-right hidden md:table-cell text-gray-500">{formatINR(paid)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">{formatINR(balance)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={function() { openBillDetail(b); }} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Collect</button>
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

      {/* Today's Bills */}
      {!loading && tab === "today" && (
        <>
          {bills.length === 0 && <EmptyState text="No bills generated today" sub="Bills will appear as patients are served." />}
          {bills.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Bill #</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Total</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Time</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(function(b) {
                    var name = b.patient_display_name || b.patient_name || [b.first_name, b.last_name].filter(Boolean).join(" ") || "Patient";
                    return (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.bill_number || "#"}</td>
                        <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{name}</div><div className="text-xs text-gray-500">{b.uhid || ""}</div></td>
                        <td className="px-4 py-3 text-right hidden md:table-cell font-semibold">{formatINR(b.net_total || b.total)}</td>
                        <td className="px-4 py-3 text-center"><span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + statusBadge(b.payment_status)}>{b.payment_status || "unpaid"}</span></td>
                        <td className="px-4 py-3 text-right hidden md:table-cell text-xs text-gray-500">{formatDate(b.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={function() { openBillDetail(b); }} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">View</button>
                            <button onClick={function() { window.print(); }} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">Print</button>
                          </div>
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

      {/* Receipts */}
      {!loading && tab === "receipts" && (
        <>
          {(() => { var paid = bills.filter(function(b) { return b.payment_status === "paid" || b.payment_status === "partial"; }); return paid.length === 0 ? <EmptyState text="No receipts today" sub="Receipts appear after payment collection." /> : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Bill #</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Patient</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount Paid</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-600">Mode</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden md:table-cell">Time</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-600">Print</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map(function(b) {
                    var name = b.patient_display_name || b.patient_name || "Patient";
                    return (
                      <tr key={b.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatINR(b.paid)}</td>
                        <td className="px-4 py-3 text-center"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{b.payment_mode || "cash"}</span></td>
                        <td className="px-4 py-3 text-right hidden md:table-cell text-xs text-gray-500">{formatDate(b.updated_at || b.created_at)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={function() { window.print(); }} className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50">Print</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ); })()}
        </>
      )}

      {/* End of Day */}
      {!loading && tab === "eod" && (
        <div className="space-y-4">
          {eodData ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">End of Day Reconciliation \u2014 {String(eodData.date || new Date().toISOString().slice(0, 10))}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div><div className="text-xs text-gray-500">Total Collection</div><div className="text-xl font-bold text-emerald-600">{formatINR(Number(eodData.total_collection))}</div></div>
                <div><div className="text-xs text-gray-500">Bill Count</div><div className="text-xl font-bold text-gray-900">{String(eodData.bill_count || 0)}</div></div>
                <div><div className="text-xs text-gray-500">Patients</div><div className="text-xl font-bold text-gray-900">{String(eodData.patient_count || 0)}</div></div>
                <div><div className="text-xs text-gray-500">Expected Cash</div><div className="text-xl font-bold text-blue-600">{formatINR(Number(eodData.expected_cash))}</div></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[["Cash", eodData.expected_cash], ["Card", eodData.card], ["UPI", eodData.upi], ["Insurance", eodData.insurance], ["Online", eodData.online]].map(function(m) {
                  return (
                    <div key={String(m[0])} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xs text-gray-500">{String(m[0])}</div>
                      <div className="text-sm font-bold text-gray-900">{formatINR(Number(m[1]))}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-400 text-sm">Loading EOD report...</p>
            </div>
          )}
        </div>
      )}

      {/* Bill Detail / Payment Collection Panel */}
      {selectedBill && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={function() { setSelectedBill(null); }} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Bill {selectedBill.bill_number}</h2>
                  <p className="text-sm text-gray-500">{selectedBill.patient_display_name || selectedBill.patient_name || "Patient"} \u00B7 {selectedBill.uhid || ""}</p>
                </div>
                <button onClick={function() { setSelectedBill(null); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* Line items */}
              {(() => {
                var items = parseItems(selectedBill.items);
                return items.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b"><tr><th className="text-left px-3 py-2 font-medium">Item</th><th className="text-right px-3 py-2 font-medium">Qty</th><th className="text-right px-3 py-2 font-medium">Rate</th><th className="text-right px-3 py-2 font-medium">Amount</th></tr></thead>
                      <tbody>
                        {items.map(function(item, i) {
                          return (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="px-3 py-2"><div className="text-gray-900">{item.item_name || "Item"}</div>{item.item_type && <div className="text-[10px] text-gray-400">{item.item_type}</div>}</td>
                              <td className="px-3 py-2 text-right">{item.quantity || 1}</td>
                              <td className="px-3 py-2 text-right">{formatINR(item.rate || 0)}</td>
                              <td className="px-3 py-2 text-right font-medium">{formatINR(item.amount || 0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null;
              })()}

              {/* Totals */}
              <div className="space-y-2 mb-5 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatINR(selectedBill.total)}</span></div>
                {Number(selectedBill.discount) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-600">-{formatINR(selectedBill.discount)}</span></div>}
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2"><span>Total</span><span>{formatINR(selectedBill.net_total || selectedBill.total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Paid</span><span className="text-emerald-600">{formatINR(selectedBill.paid)}</span></div>
                <div className="flex justify-between text-sm font-bold"><span>Balance Due</span><span className={Number(selectedBill.balance) > 0 || ((Number(selectedBill.net_total || selectedBill.total) || 0) - (Number(selectedBill.paid) || 0)) > 0 ? "text-red-600" : "text-emerald-600"}>{formatINR(Number(selectedBill.balance) || ((Number(selectedBill.net_total || selectedBill.total) || 0) - (Number(selectedBill.paid) || 0)))}</span></div>
              </div>

              {/* Payment Collection */}
              {selectedBill.payment_status !== "paid" && (
                <div className="space-y-4 mb-5 p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                  <h3 className="text-sm font-semibold text-gray-700">Collect Payment</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input type="number" value={payAmount} onChange={function(e) { setPayAmount(e.target.value); }} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Payment Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {["cash", "card", "upi", "insurance"].map(function(m) {
                        return <button key={m} onClick={function() { setPayMode(m); }} className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (payMode === m ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>;
                      })}
                    </div>
                  </div>
                  {(payMode === "card" || payMode === "upi") && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Reference / Transaction ID</label>
                      <input type="text" value={payRef} onChange={function(e) { setPayRef(e.target.value); }} placeholder="Transaction reference..." className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
                    </div>
                  )}
                  <button onClick={collectPayment} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? "Processing..." : "Collect Payment"}</button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={function() { window.print(); }} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">Print Bill</button>
                <button className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 text-gray-400 cursor-not-allowed">Send WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Bill Modal */}
      {showQuickBill && <QuickBillModal onClose={function() { setShowQuickBill(false); }} onSuccess={function(msg) { setToast({ message: msg, type: "success" }); setShowQuickBill(false); refresh(); }} onError={function(msg) { setToast({ message: msg, type: "error" }); }} />}
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function EmptyState({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
      <p className="text-gray-500 font-medium">{text}</p>
      <p className="text-gray-400 text-xs mt-1">{sub}</p>
    </div>
  );
}

function QuickBillModal({ onClose, onSuccess, onError }: { onClose: () => void; onSuccess: (msg: string) => void; onError: (msg: string) => void }) {
  var [search, setSearch] = useState("");
  var [patients, setPatients] = useState<SearchPatient[]>([]);
  var [selectedPatient, setSelectedPatient] = useState<SearchPatient | null>(null);
  var [items, setItems] = useState<Array<{ description: string; qty: string; rate: string }>>([{ description: "", qty: "1", rate: "" }]);
  var [saving, setSaving] = useState(false);
  var debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setPatients([]); return; }
    debounceRef.current = setTimeout(async function() {
      try {
        var res = await fetch("/api/patients?search=" + encodeURIComponent(val));
        var json = await res.json();
        if (json.success && json.data) setPatients(Array.isArray(json.data) ? json.data : json.data.patients || []);
      } catch { setPatients([]); }
    }, 300);
  }

  function addItem() { setItems(function(prev) { return [...prev, { description: "", qty: "1", rate: "" }]; }); }

  async function createBill() {
    if (!selectedPatient) { onError("Select a patient"); return; }
    var validItems = items.filter(function(it) { return it.description.trim() && parseFloat(it.rate) > 0; });
    if (validItems.length === 0) { onError("Add at least one item"); return; }
    setSaving(true);
    try {
      var billItems = validItems.map(function(it) {
        var q = parseInt(it.qty) || 1;
        var r = parseFloat(it.rate) || 0;
        return { item_name: it.description, quantity: q, rate: r, amount: q * r };
      });
      var total = billItems.reduce(function(s, i) { return s + i.amount; }, 0);

      var res = await fetch("/api/billing-desk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.patient_id,
          patient_name: selectedPatient.first_name + " " + (selectedPatient.last_name || ""),
          phone: selectedPatient.phone || "",
          items: JSON.stringify(billItems),
          total: total,
          net_total: total,
        }),
      });
      var json = await res.json();
      if (json.success) {
        onSuccess("Bill " + (json.data?.bill_number || "") + " created");
      } else {
        onError(json.message || "Failed to create bill");
      }
    } catch { onError("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Quick Bill</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {!selectedPatient ? (
          <div className="mb-4">
            <input type="text" placeholder="Search patient..." value={search} onChange={function(e) { handleSearch(e.target.value); }} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" autoFocus />
            {patients.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {patients.map(function(p) {
                  return <button key={p.patient_id} onClick={function() { setSelectedPatient(p); }} className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-emerald-300 text-sm"><span className="font-medium">{p.first_name} {p.last_name || ""}</span> <span className="text-xs text-gray-500">{p.phone} {p.uhid ? "\u00B7 " + p.uhid : ""}</span></button>;
                })}
              </div>
            )}
            {search.trim() && patients.length === 0 && <div className="text-center py-3"><p className="text-xs text-gray-400">No patients found</p><Link href="/dashboard/patients/new" className="text-xs text-emerald-600">Register new</Link></div>}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4 flex justify-between items-center">
              <div><div className="text-sm font-medium">{selectedPatient.first_name} {selectedPatient.last_name || ""}</div><div className="text-xs text-gray-500">{selectedPatient.uhid || selectedPatient.phone}</div></div>
              <button onClick={function() { setSelectedPatient(null); }} className="text-xs text-gray-500 hover:text-red-500">Change</button>
            </div>

            <div className="space-y-2 mb-4">
              {items.map(function(it, i) {
                return (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder="Description" value={it.description} onChange={function(e) { setItems(function(prev) { var n = [...prev]; n[i] = { ...n[i], description: e.target.value }; return n; }); }} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                    <input type="number" placeholder="Qty" value={it.qty} onChange={function(e) { setItems(function(prev) { var n = [...prev]; n[i] = { ...n[i], qty: e.target.value }; return n; }); }} className="w-16 px-2 py-2 rounded-lg border border-gray-200 text-sm" />
                    <input type="number" placeholder="Rate" value={it.rate} onChange={function(e) { setItems(function(prev) { var n = [...prev]; n[i] = { ...n[i], rate: e.target.value }; return n; }); }} className="w-24 px-2 py-2 rounded-lg border border-gray-200 text-sm" />
                    {items.length > 1 && <button onClick={function() { setItems(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }} className="text-gray-400 hover:text-red-500">&times;</button>}
                  </div>
                );
              })}
              <button onClick={addItem} className="text-xs text-emerald-600 font-medium">+ Add item</button>
            </div>

            <button onClick={createBill} disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">{saving ? "Creating..." : "Create Bill"}</button>
          </>
        )}
      </div>
    </div>
  );
}
