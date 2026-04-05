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
  { id: "HMT-0041", patient: "Rahul M.", address: "Flat 302, Gachibowli, Hyderabad", tests: ["CBC", "Lipid Profile"], timeSlot: "9:00 - 10:00 AM", lab: "LifeCare Diagnostics", distance: "2.3 km", amount: 120, status: "assigned", lat: 17.4401, lng: 78.3489 },
  { id: "HMT-0042", patient: "Priya S.", address: "H.No 5-4-12, Kondapur, Hyderabad", tests: ["Thyroid Profile"], timeSlot: "9:30 - 10:30 AM", lab: "CityLab Plus", distance: "3.1 km", amount: 80, status: "assigned", lat: 17.4575, lng: 78.3534 },
  { id: "HMT-0043", patient: "Kiran D.", address: "Plot 45, Madhapur, Hyderabad", tests: ["HbA1c", "FBS"], timeSlot: "10:00 - 11:00 AM", lab: "LifeCare Diagnostics", distance: "1.8 km", amount: 100, status: "assigned", lat: 17.4486, lng: 78.3908 },
  { id: "HMT-0044", patient: "Deepa R.", address: "Villa 12, Jubilee Hills, Hyderabad", tests: ["Full Body Checkup"], timeSlot: "10:30 - 11:30 AM", lab: "MedScan Labs", distance: "4.5 km", amount: 180, status: "collecting", lat: 17.4326, lng: 78.4071 },
  { id: "HMT-0045", patient: "Venkat P.", address: "Flat 501, Banjara Hills, Hyderabad", tests: ["Vitamin D", "B12"], timeSlot: "Yesterday", lab: "LifeCare Diagnostics", distance: "5.2 km", amount: 130, status: "delivered", lat: 17.4156, lng: 78.4347 },
  { id: "HMT-0046", patient: "Sita M.", address: "H.No 8-2-1, Ameerpet, Hyderabad", tests: ["CBC"], timeSlot: "Yesterday", lab: "CityLab Plus", distance: "2.0 km", amount: 60, status: "delivered", lat: 17.4375, lng: 78.4483 },
  { id: "HMT-0047", patient: "Arun K.", address: "Plot 78, Kukatpally, Hyderabad", tests: ["Lipid Profile", "LFT"], timeSlot: "Yesterday", lab: "MedScan Labs", distance: "6.3 km", amount: 150, status: "delivered", lat: 17.4849, lng: 78.3990 },
  { id: "HMT-0048", patient: "Meera J.", address: "Flat 203, HITEC City, Hyderabad", tests: ["Thyroid", "CBC"], timeSlot: "Yesterday", lab: "LifeCare Diagnostics", distance: "1.5 km", amount: 140, status: "delivered", lat: 17.4474, lng: 78.3762 },
  { id: "HMT-0049", patient: "Raj T.", address: "Villa 3, Nallagandla, Hyderabad", tests: ["Senior Citizen Panel"], timeSlot: "Apr 3", lab: "CityLab Plus", distance: "7.0 km", amount: 250, status: "delivered", lat: 17.4600, lng: 78.3100 },
  { id: "HMT-0050", patient: "Lakshmi V.", address: "H.No 3-5-8, Miyapur, Hyderabad", tests: ["CBC", "ESR"], timeSlot: "Apr 3", lab: "MedScan Labs", distance: "8.1 km", amount: 70, status: "delivered", lat: 17.4965, lng: 78.3534 },
];

const LABS = [
  { name: "LifeCare Diagnostics", address: "Plot 23, Gachibowli Main Road, Hyderabad", distance: "1.2 km", lat: 17.4412, lng: 78.3548 },
  { name: "CityLab Plus", address: "H.No 2-4-6, Kondapur Circle, Hyderabad", distance: "3.4 km", lat: 17.4580, lng: 78.3500 },
  { name: "MedScan Labs", address: "Building 5, HITEC City, Hyderabad", distance: "2.8 km", lat: 17.4474, lng: 78.3762 },
];

const WEEKLY_EARNINGS = [
  { day: "Mon", amount: 650 },
  { day: "Tue", amount: 520 },
  { day: "Wed", amount: 780 },
  { day: "Thu", amount: 430 },
  { day: "Fri", amount: 690 },
  { day: "Sat", amount: 880 },
  { day: "Sun", amount: 250 },
];

const PAYOUTS = [
  { date: "Mar 31, 2026", amount: 4200, status: "Paid" },
  { date: "Mar 24, 2026", amount: 3800, status: "Paid" },
  { date: "Mar 17, 2026", amount: 4500, status: "Paid" },
];

const TUBES = [
  { name: "Purple EDTA", color: "bg-purple-500", forTest: "CBC, ESR" },
  { name: "Red SST", color: "bg-red-500", forTest: "Thyroid, LFT, Lipid" },
  { name: "Grey Fluoride", color: "bg-gray-400", forTest: "Glucose, HbA1c" },
];

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
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
function IconMap({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}
function IconEarnings({ active }: { active: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[#DC2626]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export function PhleboPartnerApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [tab, setTab] = useState<"home" | "orders" | "map" | "earnings">("home");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [orderSubTab, setOrderSubTab] = useState<"assigned" | "collecting" | "intransit" | "delivered">("assigned");
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [collectionFlow, setCollectionFlow] = useState<{ orderId: string; step: number } | null>(null);
  const [flowChecks, setFlowChecks] = useState({ identity: false, fasting: false, tubes: [false, false, false], labeled: false, coldChain: false });

  const showToast = useCallback((message: string, type: ToastType) => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const orderCounts = {
    assigned: orders.filter((o) => o.status === "assigned").length,
    collecting: orders.filter((o) => o.status === "collecting").length,
    intransit: orders.filter((o) => o.status === "intransit").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };
  const totalBadge = orderCounts.assigned + orderCounts.collecting + orderCounts.intransit;

  const maxEarning = Math.max(...WEEKLY_EARNINGS.map((d) => d.amount));

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
              <div className="text-xs text-gray-500">Phlebo Partner</div>
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
                  onClick={() => { if (otp.length === 6) { setLoggedIn(true); showToast("Welcome, Suresh!", "success"); } else { showToast("Enter 6-digit OTP", "error"); } }}
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

  /* ---- helpers ---- */
  const statusBadge = (s: string) => {
    const map: Record<string, string> = { assigned: "bg-blue-100 text-blue-700", collecting: "bg-yellow-100 text-yellow-700", intransit: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700" };
    const labels: Record<string, string> = { assigned: "Assigned", collecting: "Collecting", intransit: "In Transit", delivered: "Delivered" };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[s] || "bg-gray-100 text-gray-600"}`}>{labels[s] || s}</span>;
  };

  const navigateTo = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const startCollection = (orderId: string) => {
    setCollectionFlow({ orderId, step: 1 });
    setFlowChecks({ identity: false, fasting: false, tubes: [false, false, false], labeled: false, coldChain: false });
  };

  const filteredOrders = orders.filter((o) => o.status === orderSubTab);

  /* ---- Collection Flow Overlay ---- */
  const renderCollectionFlow = () => {
    if (!collectionFlow) return null;
    const order = orders.find((o) => o.id === collectionFlow.orderId);
    if (!order) return null;
    const { step } = collectionFlow;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
        <div className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {/* Progress */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Collection Flow</h3>
              <button onClick={() => setCollectionFlow(null)} className="text-gray-400 text-xl">{"\u2715"}</button>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? "bg-[#DC2626]" : "bg-gray-200"}`} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-500">
              <span className={step >= 1 ? "text-[#DC2626] font-medium" : ""}>Verify</span>
              <span className={step >= 2 ? "text-[#DC2626] font-medium" : ""}>Collect</span>
              <span className={step >= 3 ? "text-[#DC2626] font-medium" : ""}>Label</span>
              <span className={step >= 4 ? "text-[#DC2626] font-medium" : ""}>Confirm</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Step 1: Verify Patient */}
            {step === 1 && (
              <>
                <h4 className="font-semibold">Verify Patient</h4>
                <div className="text-sm text-gray-500">Patient: <span className="text-gray-900 font-medium">{order.patient}</span></div>
                <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                  <input type="checkbox" checked={flowChecks.identity} onChange={(e) => setFlowChecks({ ...flowChecks, identity: e.target.checked })} className="w-5 h-5 rounded accent-[#DC2626]" />
                  <span className="text-sm">Patient identity verified (ID/Aadhaar checked)</span>
                </label>
                <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                  <input type="checkbox" checked={flowChecks.fasting} onChange={(e) => setFlowChecks({ ...flowChecks, fasting: e.target.checked })} className="w-5 h-5 rounded accent-[#DC2626]" />
                  <span className="text-sm">Fasting status confirmed</span>
                </label>
                <button
                  disabled={!flowChecks.identity || !flowChecks.fasting}
                  onClick={() => setCollectionFlow({ ...collectionFlow, step: 2 })}
                  className="w-full h-12 bg-[#DC2626] text-white font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next: Collect Samples
                </button>
              </>
            )}

            {/* Step 2: Collect Samples */}
            {step === 2 && (
              <>
                <h4 className="font-semibold">Collect Samples</h4>
                <div className="text-sm text-gray-500 mb-2">Tests: {order.tests.join(", ")}</div>
                {TUBES.map((tube, i) => (
                  <label key={tube.name} className="flex items-center gap-3 min-h-[44px] cursor-pointer bg-gray-50 rounded-lg px-3">
                    <input
                      type="checkbox"
                      checked={flowChecks.tubes[i]}
                      onChange={(e) => { const t = [...flowChecks.tubes]; t[i] = e.target.checked; setFlowChecks({ ...flowChecks, tubes: t }); }}
                      className="w-5 h-5 rounded accent-[#DC2626]"
                    />
                    <div className={`w-4 h-4 rounded-full ${tube.color}`} />
                    <div>
                      <div className="text-sm font-medium">{tube.name}</div>
                      <div className="text-xs text-gray-500">{tube.forTest}</div>
                    </div>
                  </label>
                ))}
                <button
                  disabled={!flowChecks.tubes.some(Boolean)}
                  onClick={() => setCollectionFlow({ ...collectionFlow, step: 3 })}
                  className="w-full h-12 bg-[#DC2626] text-white font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next: Label &amp; Pack
                </button>
              </>
            )}

            {/* Step 3: Label & Pack */}
            {step === 3 && (
              <>
                <h4 className="font-semibold">Label &amp; Pack</h4>
                <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                  <input type="checkbox" checked={flowChecks.labeled} onChange={(e) => setFlowChecks({ ...flowChecks, labeled: e.target.checked })} className="w-5 h-5 rounded accent-[#DC2626]" />
                  <span className="text-sm">All tubes labeled with patient ID and barcode</span>
                </label>
                <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                  <input type="checkbox" checked={flowChecks.coldChain} onChange={(e) => setFlowChecks({ ...flowChecks, coldChain: e.target.checked })} className="w-5 h-5 rounded accent-[#DC2626]" />
                  <span className="text-sm">Samples packed in cold chain bag</span>
                </label>
                <button
                  disabled={!flowChecks.labeled || !flowChecks.coldChain}
                  onClick={() => setCollectionFlow({ ...collectionFlow, step: 4 })}
                  className="w-full h-12 bg-[#DC2626] text-white font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next: Confirm
                </button>
              </>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <>
                <h4 className="font-semibold">Confirm Collection</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Order</span><span className="font-medium">#{order.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="font-medium">{order.patient}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tests</span><span className="font-medium">{order.tests.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tubes</span><span className="font-medium">{flowChecks.tubes.filter(Boolean).length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lab</span><span className="font-medium">{order.lab}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Timestamp</span><span className="font-medium">{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
                </div>
                <button
                  onClick={() => {
                    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "intransit" } : o));
                    setCollectionFlow(null);
                    showToast("Collection confirmed! Head to lab.", "success");
                  }}
                  className="w-full h-12 bg-[#DC2626] text-white font-medium rounded-lg text-sm"
                >
                  Confirm Collection
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---- Current assignment for home tab ---- */
  const currentAssignment = orders.find((o) => o.status === "assigned");
  const upcomingCollections = orders.filter((o) => o.status === "assigned").slice(1, 3);

  /* ---- App Shell ---- */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col max-w-[414px] mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {renderCollectionFlow()}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626] flex items-center justify-center font-bold text-white text-sm">H</div>
            <span className="font-semibold text-sm">Phlebo Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[72px]">

        {/* ====== HOME ====== */}
        {tab === "home" && (
          <div className="p-4 space-y-4">
            {/* Online/Offline Toggle */}
            <div className={`rounded-2xl p-6 text-center ${isOnline ? "bg-green-50 border-2 border-green-200" : "bg-gray-100 border-2 border-gray-200"}`}>
              <button
                onClick={() => { setIsOnline(!isOnline); showToast(isOnline ? "You are now offline" : "You are now online!", isOnline ? "error" : "success"); }}
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all ${isOnline ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <div className="mt-3 font-bold text-lg">{isOnline ? "You're Online" : "You're Offline"}</div>
              <div className="text-sm text-gray-500">{isOnline ? "Accepting new assignments" : "Tap to go online"}</div>
            </div>

            {/* Today's Summary */}
            {isOnline && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Collections", value: "4", color: "text-[#DC2626]" },
                    { label: "Pending", value: "3", color: "text-yellow-600" },
                    { label: "Earnings", value: "\u20B9950", color: "text-green-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Current Assignment */}
                {currentAssignment && (
                  <div className="bg-white rounded-xl shadow-sm border-2 border-[#DC2626]/20 overflow-hidden">
                    <div className="bg-[#DC2626] text-white px-4 py-2 text-sm font-medium">Current Assignment</div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold">{currentAssignment.patient}</div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{currentAssignment.distance}</span>
                      </div>
                      <div className="text-sm text-gray-500">{currentAssignment.tests.join(", ")}</div>
                      <div className="text-sm"><span className="text-gray-400">Address:</span> {currentAssignment.address}</div>
                      <div className="text-sm"><span className="text-gray-400">Time:</span> {currentAssignment.timeSlot}</div>
                      <div className="text-sm"><span className="text-gray-400">Lab:</span> {currentAssignment.lab}</div>
                      <div className="flex gap-2">
                        <button onClick={() => navigateTo(currentAssignment.lat, currentAssignment.lng)} className="flex-1 h-11 border border-[#DC2626] text-[#DC2626] font-medium rounded-lg text-sm">Navigate</button>
                        <button onClick={() => startCollection(currentAssignment.id)} className="flex-1 h-11 bg-[#DC2626] text-white font-medium rounded-lg text-sm">Start Collection</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                {upcomingCollections.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-gray-700">Upcoming</h3>
                    {upcomingCollections.map((o) => (
                      <div key={o.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{o.patient}</div>
                          <div className="text-xs text-gray-500">{o.tests.join(", ")} &middot; {o.timeSlot}</div>
                        </div>
                        <span className="text-xs text-gray-400">{o.distance}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick stats */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-sm mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">This Week</span><span className="font-medium">22 collections</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Week Earnings</span><span className="font-medium text-green-600">{"\u20B9"}4,200</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">This Month</span><span className="font-medium">95 collections</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Month Earnings</span><span className="font-medium text-green-600">{"\u20B9"}18,500</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ====== ORDERS ====== */}
        {tab === "orders" && (
          <div className="p-4 space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["assigned", "collecting", "intransit", "delivered"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderSubTab(s)}
                  className={`flex-1 text-[10px] font-medium py-2 rounded-md transition ${orderSubTab === s ? "bg-white text-[#DC2626] shadow-sm" : "text-gray-500"}`}
                >
                  {s === "intransit" ? "Transit" : s.charAt(0).toUpperCase() + s.slice(1)} ({orderCounts[s]})
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 && <div className="text-center text-gray-400 py-12 text-sm">No orders</div>}
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">#{o.id}</span>
                  {statusBadge(o.status)}
                </div>
                <div className="text-sm font-medium">{o.patient}</div>
                <div className="text-xs text-gray-500">{o.address}</div>
                <div className="text-sm"><span className="text-gray-400">Tests:</span> {o.tests.join(", ")}</div>
                <div className="flex items-center justify-between text-sm">
                  <span><span className="text-gray-400">Time:</span> {o.timeSlot}</span>
                  <span><span className="text-gray-400">Lab:</span> {o.lab}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-green-600">Earned: {"\u20B9"}{o.amount}</span>
                  <span className="text-xs text-gray-400">{o.distance}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {o.status === "assigned" && (
                    <>
                      <button onClick={() => navigateTo(o.lat, o.lng)} className="flex-1 h-10 border border-[#DC2626] text-[#DC2626] text-sm font-medium rounded-lg">Navigate</button>
                      <button onClick={() => startCollection(o.id)} className="flex-1 h-10 bg-[#DC2626] text-white text-sm font-medium rounded-lg">Start</button>
                    </>
                  )}
                  {o.status === "collecting" && (
                    <button onClick={() => startCollection(o.id)} className="flex-1 h-10 bg-yellow-500 text-white text-sm font-medium rounded-lg">Mark Collected</button>
                  )}
                  {o.status === "intransit" && (
                    <>
                      <button onClick={() => { const lab = LABS.find((l) => l.name === o.lab); if (lab) navigateTo(lab.lat, lab.lng); }} className="flex-1 h-10 border border-purple-500 text-purple-600 text-sm font-medium rounded-lg">Navigate to Lab</button>
                      <button onClick={() => { setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: "delivered" } : x)); showToast("Samples delivered!", "success"); }} className="flex-1 h-10 bg-green-600 text-white text-sm font-medium rounded-lg">Mark Delivered</button>
                    </>
                  )}
                  {o.status === "delivered" && (
                    <button onClick={() => showToast("Order details viewed", "success")} className="flex-1 h-10 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg">View Details</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== MAP ====== */}
        {tab === "map" && (
          <div className="p-4 space-y-4">
            {/* Today's Route */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white px-4 py-3">
                <h3 className="font-bold">Today&apos;s Route</h3>
                <div className="text-sm text-white/70">{orderCounts.assigned + orderCounts.collecting} stops remaining</div>
              </div>
              <div className="p-4 space-y-0">
                {orders.filter((o) => o.status === "assigned" || o.status === "collecting").map((o, i, arr) => (
                  <div key={o.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${o.status === "collecting" ? "bg-yellow-500" : "bg-[#DC2626]"}`}>{i + 1}</div>
                      {i < arr.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium text-sm">{o.patient}</div>
                      <div className="text-xs text-gray-500">{o.address}</div>
                      <div className="text-xs text-gray-400 mt-1">{o.tests.join(", ")} &middot; {o.timeSlot}</div>
                    </div>
                    <button onClick={() => navigateTo(o.lat, o.lng)} className="text-xs text-[#DC2626] font-medium self-start mt-1">Navigate</button>
                  </div>
                ))}
                {orderCounts.assigned + orderCounts.collecting === 0 && <div className="text-sm text-gray-400 text-center py-4">No pending stops</div>}
              </div>
            </div>

            {/* Connected Labs */}
            <h3 className="font-semibold text-sm text-gray-700">Connected Labs</h3>
            {LABS.map((lab) => (
              <div key={lab.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626] font-bold text-sm">
                  {lab.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{lab.name}</div>
                  <div className="text-xs text-gray-500">{lab.address}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{lab.distance}</div>
                </div>
                <button onClick={() => navigateTo(lab.lat, lab.lng)} className="h-9 px-3 border border-[#DC2626] text-[#DC2626] text-xs font-medium rounded-lg">Navigate</button>
              </div>
            ))}
          </div>
        )}

        {/* ====== EARNINGS ====== */}
        {tab === "earnings" && (
          <div className="p-4 space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Today", value: "\u20B9950", sub: "5 collections", color: "bg-green-50 border-green-200" },
                { label: "This Week", value: "\u20B94,200", sub: "22 collections", color: "bg-blue-50 border-blue-200" },
                { label: "This Month", value: "\u20B918,500", sub: "95 collections", color: "bg-purple-50 border-purple-200" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
                  <div className="text-sm text-gray-500">{s.label}</div>
                  <div className="text-2xl font-bold mt-1">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-sm mb-4">7-Day Breakdown</h3>
              <div className="flex items-end gap-2 h-32">
                {WEEKLY_EARNINGS.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-gray-500">{"\u20B9"}{d.amount}</div>
                    <div className="w-full rounded-t overflow-hidden" style={{ height: `${(d.amount / maxEarning) * 100}%` }}>
                      <div className="w-full h-full bg-[#DC2626] opacity-80 rounded-t" />
                    </div>
                    <div className="text-[10px] text-gray-500">{d.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending payout */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-yellow-800 font-medium">Pending Payout</div>
                  <div className="text-2xl font-bold text-yellow-900 mt-1">{"\u20B9"}12,300</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-yellow-600">Next payout</div>
                  <div className="text-sm font-medium text-yellow-800">Apr 7, 2026</div>
                </div>
              </div>
            </div>

            {/* Payment history */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 font-semibold text-sm">Payment History</div>
              {PAYOUTS.map((p) => (
                <div key={p.date} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.date}</div>
                    <span className="text-xs text-green-600 font-medium">{p.status}</span>
                  </div>
                  <div className="font-bold text-sm">{"\u20B9"}{p.amount.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-around z-40 max-w-[414px] mx-auto">
        {([
          { key: "home", label: "Home", Icon: IconHome, badge: 0 },
          { key: "orders", label: "Orders", Icon: IconOrders, badge: totalBadge },
          { key: "map", label: "Map", Icon: IconMap, badge: 0 },
          { key: "earnings", label: "Earnings", Icon: IconEarnings, badge: 0 },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] justify-center relative">
            <t.Icon active={tab === t.key} />
            {t.badge > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{t.badge}</span>
            )}
            <span className={`text-[10px] font-medium ${tab === t.key ? "text-[#DC2626]" : "text-gray-400"}`}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
