"use client";

import { useState, useCallback } from "react";

// ── Types ──
interface ConnectedPlatform {
  id: string;
  name: string;
  icon: string;
  category: "social" | "ads" | "messaging" | "listings" | "video";
  status: "connected" | "disconnected" | "error" | "syncing";
  accountName: string;
  accountId: string;
  lastSync: string;
  nextSync: string;
  syncFrequency: "15min" | "1hr" | "6hr" | "24hr";
  metrics: { label: string; value: string }[];
  requiredPlan: "starter" | "growth" | "professional" | "enterprise";
  oauthUrl: string;
  features: string[];
  healthScore: number;
  color: string;
  bgColor: string;
}

const CATEGORIES = [
  { id: "all", label: "All Platforms", icon: "\u26A1" },
  { id: "social", label: "Social Media", icon: "\uD83D\uDCF1" },
  { id: "ads", label: "Paid Ads", icon: "\uD83D\uDCCA" },
  { id: "messaging", label: "Messaging", icon: "\uD83D\uDCAC" },
  { id: "listings", label: "Listings", icon: "\uD83D\uDCCD" },
  { id: "video", label: "Video", icon: "\u25B6\uFE0F" },
];

const PLATFORMS: ConnectedPlatform[] = [
  {
    id: "gbp", name: "Google Business Profile", icon: "\uD83D\uDD0D", category: "listings",
    status: "connected", accountName: "LifeCare Multispeciality Clinic", accountId: "GBP-78234",
    lastSync: "2 min ago", nextSync: "in 13 min", syncFrequency: "15min",
    metrics: [{ label: "Profile views", value: "2,847" }, { label: "Direction requests", value: "342" }, { label: "Calls", value: "89" }, { label: "Rating", value: "4.6\u2605" }],
    requiredPlan: "growth", oauthUrl: "/api/oauth/google",
    features: ["Auto-post updates", "Review monitoring", "Q&A management", "Photo sync", "Insights tracking"],
    healthScore: 94, color: "text-blue-700", bgColor: "bg-blue-50",
  },
  {
    id: "facebook", name: "Facebook Page", icon: "\uD83D\uDCD8", category: "social",
    status: "connected", accountName: "LifeCare Clinic", accountId: "FB-1234567",
    lastSync: "8 min ago", nextSync: "in 52 min", syncFrequency: "1hr",
    metrics: [{ label: "Page followers", value: "3,241" }, { label: "Post reach", value: "12.4K" }, { label: "Engagement", value: "4.2%" }, { label: "Messages", value: "23" }],
    requiredPlan: "growth", oauthUrl: "/api/oauth/facebook",
    features: ["Auto-publish posts", "Review sync", "Messenger integration", "Lead forms", "Event management"],
    healthScore: 87, color: "text-blue-700", bgColor: "bg-blue-50",
  },
  {
    id: "instagram", name: "Instagram Business", icon: "\uD83D\uDCF8", category: "social",
    status: "connected", accountName: "@lifecare_clinic", accountId: "IG-9876543",
    lastSync: "15 min ago", nextSync: "in 45 min", syncFrequency: "1hr",
    metrics: [{ label: "Followers", value: "1,892" }, { label: "Reach", value: "8.7K" }, { label: "Engagement", value: "5.1%" }, { label: "Story views", value: "640" }],
    requiredPlan: "growth", oauthUrl: "/api/oauth/instagram",
    features: ["Auto-publish feed & stories", "Hashtag tracking", "Comment management", "DM routing", "Reels scheduling"],
    healthScore: 91, color: "text-pink-700", bgColor: "bg-pink-50",
  },
  {
    id: "whatsapp", name: "WhatsApp Business", icon: "\uD83D\uDCAC", category: "messaging",
    status: "connected", accountName: "+91 98765 43210", accountId: "WA-BAPI-001",
    lastSync: "Just now", nextSync: "Real-time", syncFrequency: "15min",
    metrics: [{ label: "Messages sent", value: "1,247" }, { label: "Delivered", value: "98.2%" }, { label: "Read rate", value: "76%" }, { label: "Appointments", value: "142" }],
    requiredPlan: "growth", oauthUrl: "/api/oauth/whatsapp",
    features: ["Appointment reminders", "Review requests", "Lab report delivery", "Broadcast campaigns", "AI chatbot"],
    healthScore: 98, color: "text-green-700", bgColor: "bg-green-50",
  },
  {
    id: "youtube", name: "YouTube Channel", icon: "\u25B6\uFE0F", category: "video",
    status: "disconnected", accountName: "", accountId: "",
    lastSync: "Never", nextSync: "\u2014", syncFrequency: "24hr",
    metrics: [{ label: "Subscribers", value: "\u2014" }, { label: "Views", value: "\u2014" }, { label: "Watch time", value: "\u2014" }],
    requiredPlan: "professional", oauthUrl: "/api/oauth/youtube",
    features: ["Health education videos", "Patient testimonial uploads", "Auto-thumbnails", "SEO optimization", "Shorts scheduling"],
    healthScore: 0, color: "text-red-700", bgColor: "bg-red-50",
  },
  {
    id: "google_ads", name: "Google Ads", icon: "\uD83D\uDCCA", category: "ads",
    status: "disconnected", accountName: "", accountId: "",
    lastSync: "Never", nextSync: "\u2014", syncFrequency: "1hr",
    metrics: [{ label: "Campaigns", value: "\u2014" }, { label: "Clicks", value: "\u2014" }, { label: "Conversions", value: "\u2014" }, { label: "Spend", value: "\u2014" }],
    requiredPlan: "professional", oauthUrl: "/api/oauth/google-ads",
    features: ["Search campaigns", "Display ads", "AI bid optimization", "Keyword management", "Conversion tracking", "Audience targeting"],
    healthScore: 0, color: "text-amber-700", bgColor: "bg-amber-50",
  },
  {
    id: "facebook_ads", name: "Facebook & Instagram Ads", icon: "\uD83C\uDFAF", category: "ads",
    status: "disconnected", accountName: "", accountId: "",
    lastSync: "Never", nextSync: "\u2014", syncFrequency: "1hr",
    metrics: [{ label: "Campaigns", value: "\u2014" }, { label: "Leads", value: "\u2014" }, { label: "CPL", value: "\u2014" }, { label: "Spend", value: "\u2014" }],
    requiredPlan: "professional", oauthUrl: "/api/oauth/meta-ads",
    features: ["Lead gen campaigns", "Lookalike audiences", "Retargeting", "Carousel ads", "AI creative optimization", "Budget pacing"],
    healthScore: 0, color: "text-indigo-700", bgColor: "bg-indigo-50",
  },
  {
    id: "practo", name: "Practo", icon: "\uD83D\uDFE2", category: "listings",
    status: "error", accountName: "Dr. Anil Kumar", accountId: "PRC-45678",
    lastSync: "3 days ago", nextSync: "Retry pending", syncFrequency: "6hr",
    metrics: [{ label: "Profile views", value: "1,204" }, { label: "Bookings", value: "67" }, { label: "Rating", value: "4.5\u2605" }],
    requiredPlan: "professional", oauthUrl: "/api/oauth/practo",
    features: ["Review sync", "Appointment feed", "Profile optimization", "Competitor tracking"],
    healthScore: 32, color: "text-green-700", bgColor: "bg-green-50",
  },
  {
    id: "justdial", name: "JustDial", icon: "\uD83D\uDCDE", category: "listings",
    status: "disconnected", accountName: "", accountId: "",
    lastSync: "Never", nextSync: "\u2014", syncFrequency: "24hr",
    metrics: [{ label: "Listing views", value: "\u2014" }, { label: "Calls", value: "\u2014" }],
    requiredPlan: "professional", oauthUrl: "/api/oauth/justdial",
    features: ["Listing management", "Review monitoring", "Lead capture", "Best deal campaigns"],
    healthScore: 0, color: "text-yellow-700", bgColor: "bg-yellow-50",
  },
];

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : score > 0 ? "bg-red-400" : "bg-gray-200";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-medium ${score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : score > 0 ? "text-red-500" : "text-gray-400"}`}>
        {score > 0 ? `${score}%` : "\u2014"}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      status === "connected" ? "bg-emerald-100 text-emerald-700" :
      status === "syncing" ? "bg-blue-100 text-blue-700" :
      status === "error" ? "bg-red-100 text-red-700" :
      "bg-gray-100 text-gray-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "connected" ? "bg-emerald-500" :
        status === "syncing" ? "bg-blue-500 animate-pulse" :
        status === "error" ? "bg-red-500" :
        "bg-gray-400"
      }`} />
      {status === "connected" ? "Live" : status === "syncing" ? "Syncing" : status === "error" ? "Error" : "Not connected"}
    </span>
  );
}

function PlatformDetail({ platform, onClose, onToggle, onSync }: {
  platform: ConnectedPlatform; onClose: () => void;
  onToggle: (id: string) => void; onSync: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        <div className={`${platform.bgColor} p-6 border-b`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">{"\u2190"} Back</button>
            <StatusDot status={platform.status} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{platform.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
              {platform.accountName && (
                <p className="text-sm text-gray-600 mt-0.5">{platform.accountName} {"\u00B7"} {platform.accountId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {(platform.status === "connected" || platform.status === "error") && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                {platform.metrics.map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">{m.value}</div>
                    <div className="text-xs text-gray-500">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Sync Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Last synced</span>
                <span className="text-sm font-medium text-gray-800">{platform.lastSync}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Next sync</span>
                <span className="text-sm font-medium text-gray-800">{platform.nextSync}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Frequency</span>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white" defaultValue={platform.syncFrequency}>
                  <option value="15min">Every 15 min</option>
                  <option value="1hr">Every hour</option>
                  <option value="6hr">Every 6 hours</option>
                  <option value="24hr">Daily</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Health score</span>
                <HealthBar score={platform.healthScore} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Enabled Features</h4>
            <div className="space-y-2">
              {platform.features.map(f => (
                <div key={f} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-600">{f}</span>
                  <div className="w-9 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {platform.status === "connected" || platform.status === "error" ? (
              <>
                <button onClick={() => onSync(platform.id)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  {"\uD83D\uDD04"} Sync Now
                </button>
                <button onClick={() => onToggle(platform.id)}
                  className="flex-1 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={() => onToggle(platform.id)}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2">
                Connect {platform.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnectionsHub() {
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = platforms.filter(p => {
    if (category !== "all" && p.category !== category) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const connected = platforms.filter(p => p.status === "connected").length;
  const errors = platforms.filter(p => p.status === "error").length;
  const selected = platforms.find(p => p.id === selectedId);

  const handleToggle = useCallback((id: string) => {
    setPlatforms(prev => prev.map(p =>
      p.id === id ? { ...p,
        status: (p.status === "connected" || p.status === "error" ? "disconnected" : "connected") as ConnectedPlatform["status"],
        accountName: p.status === "disconnected" ? "Demo Account" : "",
        lastSync: p.status === "disconnected" ? "Just now" : "Never",
        healthScore: p.status === "disconnected" ? 85 : 0,
      } : p
    ));
  }, []);

  const handleSync = useCallback((id: string) => {
    setPlatforms(prev => prev.map(p =>
      p.id === id ? { ...p, status: "syncing" as const } : p
    ));
    setTimeout(() => {
      setPlatforms(prev => prev.map(p =>
        p.id === id ? { ...p, status: "connected" as const, lastSync: "Just now", healthScore: Math.min(100, p.healthScore + 5) } : p
      ));
    }, 2000);
  }, []);

  const avgHealth = Math.round(
    platforms.filter(p => p.status === "connected").reduce((s, p) => s + p.healthScore, 0) /
    Math.max(platforms.filter(p => p.status === "connected").length, 1)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Connections Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Connect, monitor & manage all your marketing platforms</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
          + Add Platform
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{connected}<span className="text-sm font-normal text-gray-400">/{platforms.length}</span></div>
          <div className="text-xs text-gray-500">Connected</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">{avgHealth}%</div>
          <div className="text-xs text-gray-500">Avg health</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{platforms.filter(p => p.status === "connected").reduce((s, p) => s + p.features.length, 0)}</div>
          <div className="text-xs text-gray-500">Active features</div>
        </div>
        {errors > 0 ? (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-600">{errors}</div>
            <div className="text-xs text-red-500">Need attention</div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">All Good</div>
            <div className="text-xs text-emerald-500">No errors</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                category === cat.id ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              <span className="text-xs">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search platforms..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-48 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(platform => (
          <div key={platform.id} onClick={() => setSelectedId(platform.id)}
            className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
              platform.status === "error" ? "border-red-200" :
              platform.status === "connected" ? "border-gray-200 hover:border-emerald-300" :
              "border-gray-200 border-dashed opacity-75 hover:opacity-100"
            }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${platform.bgColor} flex items-center justify-center text-xl`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{platform.name}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    platform.category === "social" ? "bg-pink-100 text-pink-600" :
                    platform.category === "ads" ? "bg-amber-100 text-amber-600" :
                    platform.category === "messaging" ? "bg-green-100 text-green-600" :
                    platform.category === "listings" ? "bg-blue-100 text-blue-600" :
                    "bg-red-100 text-red-600"
                  }`}>{CATEGORIES.find(c => c.id === platform.category)?.label}</span>
                </div>
              </div>
              <StatusDot status={platform.status} />
            </div>

            {platform.status === "connected" && (
              <>
                <div className="text-xs text-gray-500 mb-2">{platform.accountName}</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {platform.metrics.slice(0, 2).map(m => (
                    <div key={m.label} className="text-xs">
                      <span className="font-semibold text-gray-800">{m.value}</span>
                      <span className="text-gray-400 ml-1">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Synced {platform.lastSync}</span>
                  <HealthBar score={platform.healthScore} />
                </div>
              </>
            )}

            {platform.status === "error" && (
              <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg p-2">
                Connection lost {"\u2014"} click to reconnect
              </div>
            )}

            {platform.status === "disconnected" && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-2">{platform.features.slice(0, 2).join(" \u00B7 ")}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    platform.requiredPlan === "growth" ? "bg-emerald-100 text-emerald-700" :
                    platform.requiredPlan === "professional" ? "bg-purple-100 text-purple-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{platform.requiredPlan} plan</span>
                  <button onClick={e => { e.stopPropagation(); handleToggle(platform.id); }}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                    Connect {"\u2192"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <PlatformDetail
          platform={selected}
          onClose={() => setSelectedId(null)}
          onToggle={handleToggle}
          onSync={handleSync}
        />
      )}
    </div>
  );
}
