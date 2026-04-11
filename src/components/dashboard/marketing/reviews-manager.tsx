"use client";

import { useState, useCallback } from "react";

// ── Types ──
interface Review {
  id: string;
  platform: "google" | "facebook" | "practo" | "medihost";
  author: string;
  rating: number;
  text: string;
  date: string;
  replied: boolean;
  aiReply: string;
  actualReply: string;
}

interface ReviewRequest {
  id: string;
  patient: string;
  phone: string;
  visitDate: string;
  sentAt: string;
  status: "sent" | "opened" | "reviewed";
}

const PLATFORM_META: Record<string, { icon: string; label: string; color: string }> = {
  google: { icon: "\uD83D\uDD0D", label: "Google", color: "bg-amber-100 text-amber-700" },
  facebook: { icon: "\uD83D\uDCD8", label: "Facebook", color: "bg-blue-100 text-blue-700" },
  practo: { icon: "\uD83D\uDFE2", label: "Practo", color: "bg-green-100 text-green-700" },
  medihost: { icon: "\uD83C\uDFE5", label: "MediHost", color: "bg-emerald-100 text-emerald-700" },
};

const DEMO_REVIEWS: Review[] = [
  { id: "1", platform: "google", author: "Priya Sharma", rating: 5, text: "Excellent doctor! Very thorough examination and explained everything clearly. The clinic is clean and well-maintained. Highly recommend for anyone looking for quality healthcare.", date: "2026-04-10", replied: false, aiReply: "Thank you so much, Priya! We're glad Dr. Kumar could provide you with a thorough consultation. Your kind words about our clinic mean a lot to our team. We look forward to serving you again!", actualReply: "" },
  { id: "2", platform: "google", author: "Rajesh Kumar", rating: 4, text: "Good experience overall. Waited about 20 minutes but the consultation was worth it. Doctor was knowledgeable and prescribed appropriate tests.", date: "2026-04-09", replied: true, aiReply: "", actualReply: "Thank you for your feedback, Rajesh! We're working on reducing wait times and appreciate your patience." },
  { id: "3", platform: "facebook", author: "Anitha Reddy", rating: 5, text: "Been visiting this clinic for 3 years now. Always a pleasant experience. Staff is courteous and the doctor remembers my history.", date: "2026-04-08", replied: false, aiReply: "Dear Anitha, thank you for being a loyal patient for 3 years! It's wonderful to hear that our team consistently delivers a positive experience. Your trust in us is truly appreciated!", actualReply: "" },
  { id: "4", platform: "practo", author: "Mohammed Irfan", rating: 2, text: "Long waiting time. Had to wait over an hour despite having an appointment. The doctor was good but the management needs improvement.", date: "2026-04-07", replied: false, aiReply: "Dear Mohammed, we sincerely apologize for the extended wait. We understand how valuable your time is. We're implementing a new queue management system to prevent this. We'd love to make it up to you on your next visit.", actualReply: "" },
  { id: "5", platform: "medihost", author: "Lakshmi Devi", rating: 5, text: "The online booking through MediHost was so convenient! Got an appointment within hours and the whole process was smooth.", date: "2026-04-06", replied: false, aiReply: "Thank you, Lakshmi! We're thrilled that our MediHost integration made your booking experience seamless. Technology-enabled healthcare is what we strive for!", actualReply: "" },
  { id: "6", platform: "google", author: "Suresh Babu", rating: 3, text: "Average experience. Doctor is good but the clinic could use better infrastructure. Parking is also an issue.", date: "2026-04-05", replied: false, aiReply: "Thank you for your honest feedback, Suresh. We're actively working on infrastructure improvements and exploring parking solutions for our patients. Your input helps us improve!", actualReply: "" },
];

const DEMO_REQUESTS: ReviewRequest[] = [
  { id: "1", patient: "Kavitha Rao", phone: "+91 98765 43210", visitDate: "2026-04-10", sentAt: "2026-04-10T18:00", status: "reviewed" },
  { id: "2", patient: "Venkat Reddy", phone: "+91 87654 32109", visitDate: "2026-04-10", sentAt: "2026-04-10T17:30", status: "opened" },
  { id: "3", patient: "Deepa Nair", phone: "+91 76543 21098", visitDate: "2026-04-09", sentAt: "2026-04-09T19:00", status: "sent" },
  { id: "4", patient: "Arjun Prasad", phone: "+91 65432 10987", visitDate: "2026-04-09", sentAt: "2026-04-09T18:30", status: "sent" },
];

function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? "text-amber-400" : "text-gray-200"}>{"\u2605"}</span>
      ))}
    </span>
  );
}

// ── Tab: Reviews ──
function ReviewsTab({ reviews, onApproveReply }: { reviews: Review[]; onApproveReply: (id: string, reply: string) => void }) {
  const [filter, setFilter] = useState<"all" | "unreplied" | "negative">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const filtered = reviews.filter(r => {
    if (filter === "unreplied") return !r.replied;
    if (filter === "negative") return r.rating <= 3;
    return true;
  });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-700">Avg: <span className="text-amber-600">{avgRating}</span> <Stars rating={Math.round(Number(avgRating))} /></span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{reviews.length} total</span>
          <span className="text-red-500">{reviews.filter(r => !r.replied).length} unreplied</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unreplied", "negative"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
              filter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "negative" ? "\u26A0\uFE0F Negative" : f === "unreplied" ? "\uD83D\uDCAC Unreplied" : "All"}
          </button>
        ))}
      </div>

      {/* Review cards */}
      {filtered.map(review => (
        <div key={review.id} className={`p-4 rounded-lg border ${
          review.rating <= 2 ? "border-red-200 bg-red-50" : review.replied ? "border-gray-200" : "border-amber-200 bg-amber-50"
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white">
                {review.author[0]}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">{review.author}</div>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PLATFORM_META[review.platform].color}`}>
                    {PLATFORM_META[review.platform].icon} {PLATFORM_META[review.platform].label}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{review.text}</p>

          {review.replied ? (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-400 mb-1">{"\u2705"} Your reply</div>
              <p className="text-sm text-gray-600">{review.actualReply}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {editingId === review.id ? (
                <div>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { onApproveReply(review.id, editText); setEditingId(null); }}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                      Publish Reply
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="text-xs text-emerald-600 mb-1 font-medium">{"\u2728"} AI-suggested reply</div>
                  <p className="text-sm text-gray-700">{review.aiReply}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => onApproveReply(review.id, review.aiReply)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                      {"\u2713"} Approve & Publish
                    </button>
                    <button onClick={() => { setEditingId(review.id); setEditText(review.aiReply); }}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50">
                      {"\u270F\uFE0F"} Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: Request Reviews ──
function RequestTab({ requests }: { requests: ReviewRequest[] }) {
  const [autoRequest, setAutoRequest] = useState(true);

  return (
    <div className="space-y-6">
      {/* Auto-request toggle */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div>
          <div className="font-medium text-sm text-gray-800">Auto-request reviews via WhatsApp</div>
          <div className="text-xs text-gray-500 mt-0.5">Send review link 2 hours after patient visit</div>
        </div>
        <button onClick={() => setAutoRequest(!autoRequest)}
          className={`w-12 h-6 rounded-full transition-all ${autoRequest ? "bg-emerald-500" : "bg-gray-300"}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoRequest ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* QR Code */}
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3">
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`w-4 h-4 ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? "bg-gray-800" : "bg-white"}`} />
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700">Scan to leave a review</p>
        <p className="text-xs text-gray-400 mt-1">Print this QR code and display at your reception</p>
        <button className="mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          {"\uD83D\uDCE5"} Download QR Code
        </button>
      </div>

      {/* Recent requests */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-3">Recent Review Requests</h4>
        <div className="space-y-2">
          {requests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                  {req.patient[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{req.patient}</div>
                  <div className="text-xs text-gray-400">Visit: {new Date(req.visitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                req.status === "reviewed" ? "bg-emerald-100 text-emerald-700" :
                req.status === "opened" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {req.status === "reviewed" ? "\u2705 Reviewed" : req.status === "opened" ? "\uD83D\uDC40 Opened" : "\uD83D\uDCE4 Sent"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Sentiment ──
function SentimentTab({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const neutral = reviews.filter(r => r.rating === 3).length;
  const negative = reviews.filter(r => r.rating <= 2).length;

  const keywords = [
    { word: "doctor", count: 5, sentiment: "positive" as const },
    { word: "waiting", count: 3, sentiment: "negative" as const },
    { word: "clean", count: 2, sentiment: "positive" as const },
    { word: "staff", count: 3, sentiment: "positive" as const },
    { word: "parking", count: 1, sentiment: "negative" as const },
    { word: "convenient", count: 2, sentiment: "positive" as const },
  ];

  const doctors = [
    { name: "Dr. Anil Kumar", rating: 4.8, reviews: 42 },
    { name: "Dr. Priya Reddy", rating: 4.5, reviews: 28 },
    { name: "Dr. Srinivas Rao", rating: 4.2, reviews: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Sentiment bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{"\uD83D\uDE0A"} Positive (4-5 stars)</span>
            <span className="font-medium text-emerald-600">{positive} ({Math.round(positive / total * 100)}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${positive / total * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{"\uD83D\uDE10"} Neutral (3 stars)</span>
            <span className="font-medium text-amber-600">{neutral} ({Math.round(neutral / total * 100)}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${neutral / total * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{"\uD83D\uDE1E"} Negative (1-2 stars)</span>
            <span className="font-medium text-red-600">{negative} ({Math.round(negative / total * 100)}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: `${negative / total * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-3">Top Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {keywords.map(k => (
            <span key={k.word} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              k.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {k.word} ({k.count})
            </span>
          ))}
        </div>
      </div>

      {/* Per-doctor ratings */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-3">Doctor Ratings</h4>
        <div className="space-y-2">
          {doctors.map(doc => (
            <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {doc.name.split(" ").pop()?.[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                  <div className="text-xs text-gray-400">{doc.reviews} reviews</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-600">{doc.rating}</div>
                <Stars rating={Math.round(doc.rating)} size="text-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export function ReviewsManager() {
  const [tab, setTab] = useState<"reviews" | "request" | "sentiment">("reviews");
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);

  const handleApproveReply = useCallback((id: string, reply: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true, actualReply: reply } : r));
  }, []);

  const tabs = [
    { id: "reviews" as const, label: "Reviews", icon: "\u2B50", count: reviews.filter(r => !r.replied).length },
    { id: "request" as const, label: "Request Reviews", icon: "\uD83D\uDCE4" },
    { id: "sentiment" as const, label: "Sentiment", icon: "\uD83D\uDCCA" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor, reply & grow your online reputation</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === t.id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <span>{t.icon}</span>{t.label}
            {t.count ? <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{t.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {tab === "reviews" && <ReviewsTab reviews={reviews} onApproveReply={handleApproveReply} />}
        {tab === "request" && <RequestTab requests={DEMO_REQUESTS} />}
        {tab === "sentiment" && <SentimentTab reviews={reviews} />}
      </div>
    </div>
  );
}
