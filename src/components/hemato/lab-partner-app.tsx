"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */
type ToastType = "success" | "error";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      <span>{type === "success" ? "\u2713" : "\u2717"}</span>
      <span>{message}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_ORDERS = [
  { id: "HMT-0041", patient: "Rahul M.***", tests: ["CBC", "Lipid Profile"], phlebo: "Suresh K.", time: "9:00 AM", amount: 598, status: "new" },
  { id: "HMT-0042", patient: "Priya S.***", tests: ["Thyroid Profile"], phlebo: "Amit R.", time: "9:30 AM", amount: 399, status: "new" },
  { id: "HMT-0043", patient: "Kiran D.***", tests: ["HbA1c", "FBS"], phlebo: "Suresh K.", time: "10:00 AM", amount: 450, status: "new" },
  { id: "HMT-0044", patient: "Deepa R.***", tests: ["Full Body Checkup"], phlebo: "Amit R.", time: "10:30 AM", amount: 999, status: "accepted" },
  { id: "HMT-0045", patient: "Venkat P.***", tests: ["Vitamin D", "B12"], phlebo: "Suresh K.", time: "11:00 AM", amount: 799, status: "accepted" },
  { id: "HMT-0046", patient: "Sita M.***", tests: ["CBC"], phlebo: "Ravi T.", time: "8:00 AM", amount: 299, status: "inprogress", stage: "Sample Received" },
  { id: "HMT-0047", patient: "Arun K.***", tests: ["Lipid Profile", "LFT"], phlebo: "Amit R.", time: "8:30 AM", amount: 750, status: "inprogress", stage: "Accessioning" },
  { id: "HMT-0048", patient: "Meera J.***", tests: ["Thyroid", "CBC"], phlebo: "Ravi T.", time: "7:30 AM", amount: 698, status: "inprogress", stage: "Processing" },
  { id: "HMT-0049", patient: "Raj T.***", tests: ["Senior Citizen Panel"], phlebo: "Suresh K.", time: "7:00 AM", amount: 2499, status: "inprogress", stage: "Report Ready" },
  { id: "HMT-0050", patient: "Lakshmi V.***", tests: ["CBC", "ESR"], phlebo: "Ravi T.", time: "Yesterday", amount: 350, status: "completed" },
];

const MOCK_TESTS = [
  { name: "Complete Blood Count (CBC)", params: 24, mrp: 500, price: 299, discount: 40, category: "Hematology", active: true },
  { name: "Hemoglobin (Hb)", params: 1, mrp: 200, price: 99, discount: 50, category: "Hematology", active: true },
  { name: "ESR", params: 1, mrp: 150, price: 79, discount: 47, category: "Hematology", active: true },
  { name: "Blood Glucose Fasting", params: 1, mrp: 200, price: 99, discount: 50, category: "Biochemistry", active: true },
  { name: "HbA1c", params: 1, mrp: 600, price: 349, discount: 42, category: "Biochemistry", active: true },
  { name: "Lipid Profile", params: 8, mrp: 600, price: 299, discount: 50, category: "Biochemistry", active: true },
  { name: "Liver Function Test (LFT)", params: 12, mrp: 800, price: 449, discount: 44, category: "Biochemistry", active: false },
  { name: "Thyroid Profile (T3, T4, TSH)", params: 3, mrp: 700, price: 399, discount: 43, category: "Thyroid", active: true },
  { name: "TSH", params: 1, mrp: 350, price: 199, discount: 43, category: "Thyroid", active: true },
  { name: "Vitamin D (25-OH)", params: 1, mrp: 1200, price: 599, discount: 50, category: "Vitamins", active: true },
  { name: "Vitamin B12", params: 1, mrp: 800, price: 399, discount: 50, category: "Vitamins", active: true },
  { name: "Iron Studies", params: 4, mrp: 900, price: 499, discount: 44, category: "Vitamins", active: true },
];

const WEEKLY_DATA = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 9 },
  { day: "Wed", orders: 15 },
  { day: "Thu", orders: 8 },
  { day: "Fri", orders: 11 },
  { day: "Sat", orders: 18 },
  { day: "Sun", orders: 6 },
];

const CATEGORIES = ["All", "Hematology", "Biochemistry", "Thyroid", "Vitamins"];

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function IconDashboard({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function IconOrders({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function IconMenu({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function IconStore({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0A2.25 2.25 0 015.25 7.5h13.5A2.25 2.25 0 0121 9.349" />
    </svg>
  );
}
function IconMore({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export function LabPartnerApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [tab, setTab] = useState<"dashboard" | "orders" | "menu" | "storefront" | "more">("dashboard");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [orderSubTab, setOrderSubTab] = useState<"new" | "accepted" | "inprogress" | "completed">("new");
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [tests, setTests] = useState(MOCK_TESTS);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");
  const [storeName, setStoreName] = useState("LifeCare Diagnostics");
  const [storeTagline, setStoreTagline] = useState("Trusted diagnostics since 2015");
  const [storeHours, setStoreHours] = useState("7:00 AM - 9:00 PM");
  const [storeContact, setStoreContact] = useState("+91 98765 43210");
  const [homeCollection, setHomeCollection] = useState(true);
  const [moreSection, setMoreSection] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  /* ---- Login ---- */
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center font-bold text-white text-lg">H</div>
            <div>
              <div className="font-bold text-lg text-gray-900">Hemato</div>
              <div className="text-xs text-gray-500">Lab Partner</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#DC2626]/30 focus-within:border-[#DC2626]">
                <span className="px-3 text-sm text-gray-500 bg-gray-50 h-12 flex items-center border-r border-gray-300">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter mobile number"
                  className="flex-1 h-12 px-3 text-sm outline-none bg-white text-gray-900"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                onClick={() => { if (phone.length === 10) { setOtpSent(true); showToast("OTP sent!", "success"); } else { showToast("Enter 10-digit number", "error"); } }}
                className="w-full h-12 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium rounded-lg transition text-sm"
              >
                Send OTP
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    className="w-full h-12 border border-gray-300 rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/30 focus:border-[#DC2626] text-gray-900 bg-white"
                  />
                </div>
                <button
                  onClick={() => { if (otp.length === 6) { setLoggedIn(true); showToast("Welcome back!", "success"); } else { showToast("Enter 6-digit OTP", "error"); } }}
                  className="w-full h-12 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium rounded-lg transition text-sm"
                >
                  Verify &amp; Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Status badge helper ---- */
  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-100 text-blue-700",
      accepted: "bg-yellow-100 text-yellow-700",
      inprogress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
    };
    const labels: Record<string, string> = { new: "New", accepted: "Accepted", inprogress: "In Progress", completed: "Completed" };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[s] || "bg-gray-100 text-gray-600"}`}>{labels[s] || s}</span>;
  };

  const filteredOrders = orders.filter((o) => o.status === orderSubTab);
  const orderCounts = { new: orders.filter((o) => o.status === "new").length, accepted: orders.filter((o) => o.status === "accepted").length, inprogress: orders.filter((o) => o.status === "inprogress").length, completed: orders.filter((o) => o.status === "completed").length };

  const filteredTests = tests.filter((t) => {
    const matchCat = menuCategory === "All" || t.category === menuCategory;
    const matchSearch = !menuSearch || t.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const maxWeekly = Math.max(...WEEKLY_DATA.map((d) => d.orders));

  /* ---- App Shell ---- */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-white text-sm">H</div>
            <span className="font-semibold text-sm">Lab Partner</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[72px]">

        {/* ====== DASHBOARD ====== */}
        {tab === "dashboard" && (
          <div className="p-4 space-y-4">
            {/* Welcome */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg">{storeName}</h2>
              <p className="text-sm text-gray-500">{today}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Today's Orders", value: "8", color: "text-[#DC2626]" },
                { label: "Pending", value: "3", color: "text-yellow-600" },
                { label: "Revenue", value: "\u20B94,250", color: "text-green-600" },
                { label: "Rating", value: "4.6 \u2605", color: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Online toggle */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold">Accepting Orders</div>
                <div className="text-xs text-gray-500">{isOnline ? "You are visible to patients" : "You are hidden from search"}</div>
              </div>
              <button
                onClick={() => { setIsOnline(!isOnline); showToast(isOnline ? "You are now offline" : "You are now online!", isOnline ? "error" : "success"); }}
                className={`w-14 h-8 rounded-full transition-colors relative ${isOnline ? "bg-green-500" : "bg-red-400"}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow absolute top-1 transition-all ${isOnline ? "right-1" : "left-1"}`} />
              </button>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 font-semibold text-sm">Recent Orders</div>
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">#{o.id}</div>
                    <div className="text-xs text-gray-500">{o.patient} &middot; {o.tests.join(", ")}</div>
                  </div>
                  {statusBadge(o.status)}
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="font-semibold text-sm mb-4">Weekly Orders</div>
              <div className="flex items-end gap-2 h-32">
                {WEEKLY_DATA.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">{d.orders}</div>
                    <div className="w-full bg-[#DC2626]/20 rounded-t" style={{ height: `${(d.orders / maxWeekly) * 100}%` }}>
                      <div className="w-full h-full bg-[#DC2626] rounded-t opacity-80" />
                    </div>
                    <div className="text-xs text-gray-500">{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====== ORDERS ====== */}
        {tab === "orders" && (
          <div className="p-4 space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["new", "accepted", "inprogress", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderSubTab(s)}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition ${orderSubTab === s ? "bg-white text-[#DC2626] shadow-sm" : "text-gray-500"}`}
                >
                  {s === "inprogress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)} ({orderCounts[s]})
                </button>
              ))}
            </div>

            {/* Order cards */}
            {filteredOrders.length === 0 && <div className="text-center text-gray-400 py-12 text-sm">No orders in this category</div>}
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">#{o.id}</span>
                  {statusBadge(o.status)}
                </div>
                <div className="text-sm"><span className="text-gray-500">Patient:</span> {o.patient}</div>
                <div className="text-sm"><span className="text-gray-500">Tests:</span> {o.tests.join(", ")}</div>
                <div className="flex items-center justify-between text-sm">
                  <span><span className="text-gray-500">Phlebo:</span> {o.phlebo}</span>
                  <span><span className="text-gray-500">Time:</span> {o.time}</span>
                </div>
                <div className="text-sm font-semibold">{"\u20B9"}{o.amount}</div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {o.status === "new" && (
                    <>
                      <button onClick={() => { setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: "accepted" } : x)); showToast("Order accepted", "success"); }} className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg">Accept</button>
                      <button onClick={() => { setOrders((prev) => prev.filter((x) => x.id !== o.id)); showToast("Order rejected", "error"); }} className="flex-1 h-10 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg">Reject</button>
                    </>
                  )}
                  {o.status === "accepted" && (
                    <button onClick={() => { setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: "inprogress", stage: "Sample Received" } : x)); showToast("Phlebo en route", "success"); }} className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg">Phlebo En Route</button>
                  )}
                  {o.status === "inprogress" && (
                    <div className="w-full space-y-2">
                      <div className="text-xs text-gray-500">Stage: <span className="font-medium text-purple-600">{(o as typeof o & {stage?: string}).stage}</span></div>
                      {(() => {
                        const stages = ["Sample Received", "Accessioning", "Processing", "Report Ready"];
                        const currentIdx = stages.indexOf((o as typeof o & {stage?: string}).stage || "");
                        if (currentIdx < stages.length - 1) {
                          const next = stages[currentIdx + 1];
                          return <button onClick={() => { setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, stage: next } : x)); showToast(`Moved to ${next}`, "success"); }} className="w-full h-10 bg-purple-600 text-white text-sm font-medium rounded-lg">{next}</button>;
                        }
                        return <button onClick={() => { setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: "completed" } : x)); showToast("Report sent!", "success"); }} className="w-full h-10 bg-green-600 text-white text-sm font-medium rounded-lg">Send Report</button>;
                      })()}
                    </div>
                  )}
                  {o.status === "completed" && (
                    <>
                      <button onClick={() => showToast("Report opened", "success")} className="flex-1 h-10 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg">View Report</button>
                      <button onClick={() => showToast("Report sent via WhatsApp", "success")} className="flex-1 h-10 bg-green-600 text-white text-sm font-medium rounded-lg">Send Report</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== MENU ====== */}
        {tab === "menu" && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search tests..."
                className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/30 focus:border-[#DC2626] bg-white"
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setMenuCategory(c)}
                  className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition ${menuCategory === c ? "bg-[#DC2626] text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Test items */}
            {filteredTests.map((t, i) => (
              <div key={t.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.params} parameter{t.params > 1 ? "s" : ""}</div>
                  </div>
                  <button
                    onClick={() => { setTests((prev) => prev.map((x, j) => j === i ? { ...x, active: !x.active } : x)); }}
                    className={`w-10 h-6 rounded-full transition relative ${t.active ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${t.active ? "right-1" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 line-through">{"\u20B9"}{t.mrp}</span>
                  <input
                    type="number"
                    value={t.price}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTests((prev) => prev.map((x, j) => j === i ? { ...x, price: val, discount: Math.round((1 - val / x.mrp) * 100) } : x));
                    }}
                    className="w-20 h-8 border border-gray-300 rounded px-2 text-sm font-semibold text-[#DC2626] outline-none focus:ring-1 focus:ring-[#DC2626]"
                  />
                  <span className="text-xs text-green-600 font-medium">{t.discount}% off</span>
                </div>
              </div>
            ))}

            <button onClick={() => showToast("Custom package builder coming soon", "success")} className="w-full h-12 border-2 border-dashed border-[#DC2626]/30 text-[#DC2626] font-medium rounded-xl text-sm">+ Add Custom Package</button>
          </div>
        )}

        {/* ====== STOREFRONT ====== */}
        {tab === "storefront" && (
          <div className="p-4 space-y-4">
            {/* Preview */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-32 bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-end p-4">
                <div>
                  <div className="text-white font-bold text-lg">{storeName}</div>
                  <div className="text-white/70 text-sm">{storeTagline}</div>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4 text-xs text-gray-500">
                <span>4.6 {"\u2605"}</span>
                <span>{storeHours}</span>
                <span>{homeCollection ? "Home Collection" : "Walk-in Only"}</span>
              </div>
            </div>

            {/* Edit fields */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-sm">Edit Storefront</h3>
              {[
                { label: "Display Name", value: storeName, set: setStoreName },
                { label: "Tagline", value: storeTagline, set: setStoreTagline },
                { label: "Hours", value: storeHours, set: setStoreHours },
                { label: "Contact", value: storeContact, set: setStoreContact },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/30 focus:border-[#DC2626] bg-white text-gray-900" />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm">Home Collection</span>
                <button onClick={() => setHomeCollection(!homeCollection)} className={`w-10 h-6 rounded-full transition relative ${homeCollection ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${homeCollection ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            <button onClick={() => showToast("Storefront preview opened", "success")} className="w-full h-12 bg-[#DC2626] text-white font-medium rounded-xl text-sm">View Live Storefront</button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-yellow-600 text-lg">{"\u2B50"}</span>
              <div>
                <div className="text-sm font-medium text-yellow-800">Starter Plan</div>
                <div className="text-xs text-yellow-600">Upgrade to unlock premium features</div>
              </div>
            </div>
          </div>
        )}

        {/* ====== MORE ====== */}
        {tab === "more" && (
          <div className="p-4 space-y-2">
            {/* Profile header */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626] font-bold text-lg">LC</div>
              <div>
                <div className="font-bold">{storeName}</div>
                <div className="text-xs text-gray-500">{storeContact}</div>
              </div>
            </div>

            {[
              { key: "profile", label: "Profile", icon: "\uD83D\uDC64", detail: "Lab details, address, NABL certificate" },
              { key: "bank", label: "Bank Details", icon: "\uD83C\uDFE6", detail: "Settlement account & UPI" },
              { key: "reports", label: "Reports", icon: "\uD83D\uDCCA", detail: "Revenue, orders, patient analytics" },
              { key: "documents", label: "Documents", icon: "\uD83D\uDCC4", detail: "Licenses, certificates, agreements" },
              { key: "help", label: "Help & Support", icon: "\uD83D\uDCAC", detail: "Chat with us on WhatsApp" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "help") { showToast("Opening WhatsApp...", "success"); return; }
                  setMoreSection(moreSection === item.key ? null : item.key);
                }}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.detail}</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ))}

            {moreSection === "reports" && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                <h4 className="font-semibold text-sm">Summary Stats</h4>
                {[
                  { label: "Total Orders", value: "342" },
                  { label: "Total Revenue", value: "\u20B91,23,450" },
                  { label: "Avg. Order Value", value: "\u20B9361" },
                  { label: "Repeat Patients", value: "47%" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { setLoggedIn(false); setOtpSent(false); setOtp(""); setPhone(""); }}
              className="w-full h-12 border border-red-200 text-[#DC2626] font-medium rounded-xl text-sm mt-4"
            >
              Logout
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-around z-40">
        {([
          { key: "dashboard", label: "Dashboard", Icon: IconDashboard },
          { key: "orders", label: "Orders", Icon: IconOrders },
          { key: "menu", label: "Menu", Icon: IconMenu },
          { key: "storefront", label: "Storefront", Icon: IconStore },
          { key: "more", label: "More", Icon: IconMore },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] justify-center">
            <t.Icon active={tab === t.key} />
            <span className={`text-[10px] font-medium ${tab === t.key ? "text-[#DC2626]" : "text-gray-400"}`}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
