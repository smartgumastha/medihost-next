"use client";

import { useState, useCallback } from "react";

// ── Types ──

interface Connection {
  id: string;
  name: string;
  category: "social" | "ads" | "messaging" | "listings" | "analytics";
  icon: string;
  description: string;
  connected: boolean;
  accountName: string;
  lastSync: string;
  requiredPlan: "starter" | "growth" | "professional";
  status: "connected" | "disconnected" | "error" | "syncing";
  metrics?: { label: string; value: string }[];
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  social: { label: "Social Media", color: "text-pink-700", bg: "bg-pink-50" },
  ads: { label: "Advertising", color: "text-blue-700", bg: "bg-blue-50" },
  messaging: { label: "Messaging", color: "text-green-700", bg: "bg-green-50" },
  listings: { label: "Business Listings", color: "text-amber-700", bg: "bg-amber-50" },
  analytics: { label: "Analytics", color: "text-purple-700", bg: "bg-purple-50" },
};

const CONNECTIONS: Connection[] = [
  // Social
  { id: "instagram", name: "Instagram Business", category: "social", icon: "\uD83D\uDCF8", description: "Auto-post reels, stories & carousels. Track engagement.", connected: false, accountName: "", lastSync: "", requiredPlan: "growth", status: "disconnected", metrics: [{ label: "Followers", value: "0" }, { label: "Posts", value: "0" }, { label: "Reach", value: "0" }] },
  { id: "facebook", name: "Facebook Page", category: "social", icon: "\uD83D\uDCD8", description: "Publish posts, manage inbox & track page insights.", connected: true, accountName: "LifeCare Clinic", lastSync: "2026-04-11T08:00", requiredPlan: "growth", status: "connected", metrics: [{ label: "Likes", value: "342" }, { label: "Posts", value: "28" }, { label: "Reach", value: "4.2k" }] },
  { id: "youtube", name: "YouTube Channel", category: "social", icon: "\u25B6\uFE0F", description: "Upload health education videos. Track views.", connected: false, accountName: "", lastSync: "", requiredPlan: "professional", status: "disconnected" },

  // Ads
  { id: "google-ads", name: "Google Ads", category: "ads", icon: "\uD83D\uDCB0", description: "Run search & display ads. Track conversions.", connected: true, accountName: "LifeCare - Search", lastSync: "2026-04-11T06:00", requiredPlan: "growth", status: "connected", metrics: [{ label: "Clicks", value: "1.2k" }, { label: "Spend", value: "\u20B922k" }, { label: "Leads", value: "78" }] },
  { id: "meta-ads", name: "Meta Ads (FB + IG)", category: "ads", icon: "\uD83C\uDFAF", description: "Run Facebook & Instagram ad campaigns.", connected: false, accountName: "", lastSync: "", requiredPlan: "growth", status: "disconnected" },

  // Messaging
  { id: "whatsapp", name: "WhatsApp Business", category: "messaging", icon: "\uD83D\uDCAC", description: "Send appointment reminders, review requests & campaigns.", connected: true, accountName: "+91 98765 43210", lastSync: "2026-04-11T09:00", requiredPlan: "growth", status: "connected", metrics: [{ label: "Sent", value: "456" }, { label: "Delivered", value: "98%" }, { label: "Read", value: "72%" }] },
  { id: "sms", name: "SMS Gateway", category: "messaging", icon: "\uD83D\uDCF1", description: "Send appointment confirmations via SMS.", connected: false, accountName: "", lastSync: "", requiredPlan: "professional", status: "disconnected" },

  // Listings
  { id: "google-business", name: "Google Business Profile", category: "listings", icon: "\uD83D\uDD0D", description: "Manage hours, photos, posts & reviews on Google.", connected: true, accountName: "LifeCare Multispeciality Clinic", lastSync: "2026-04-11T07:00", requiredPlan: "growth", status: "connected", metrics: [{ label: "Views", value: "2.8k" }, { label: "Calls", value: "42" }, { label: "Directions", value: "68" }] },
  { id: "practo", name: "Practo", category: "listings", icon: "\uD83D\uDFE2", description: "Sync profile, manage reviews & appointments.", connected: false, accountName: "", lastSync: "", requiredPlan: "professional", status: "disconnected" },
  { id: "justdial", name: "JustDial", category: "listings", icon: "\uD83D\uDCDE", description: "Manage your JustDial business listing.", connected: false, accountName: "", lastSync: "", requiredPlan: "professional", status: "disconnected" },

  // Analytics
  { id: "google-analytics", name: "Google Analytics", category: "analytics", icon: "\uD83D\uDCCA", description: "Track website traffic, conversions & user behavior.", connected: false, accountName: "", lastSync: "", requiredPlan: "growth", status: "disconnected" },
  { id: "google-search-console", name: "Search Console", category: "analytics", icon: "\uD83D\uDD27", description: "Monitor search performance & indexing.", connected: false, accountName: "", lastSync: "", requiredPlan: "professional", status: "disconnected" },
];

const STATUS_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  connected: { label: "Connected", color: "text-emerald-700", dot: "bg-emerald-500" },
  disconnected: { label: "Not connected", color: "text-gray-500", dot: "bg-gray-300" },
  error: { label: "Error", color: "text-red-600", dot: "bg-red-500" },
  syncing: { label: "Syncing...", color: "text-blue-600", dot: "bg-blue-500 animate-pulse" },
};

// ── Main Component ──

export function ConnectionsHub() {
  const [connections, setConnections] = useState<Connection[]>(CONNECTIONS);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const userPlan = "starter"; // TODO: read from auth context
  const planRank: Record<string, number> = { starter: 0, growth: 1, professional: 2, enterprise: 3 };
  const userRank = planRank[userPlan] ?? 0;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const handleConnect = useCallback((id: string) => {
    setConnections(prev => prev.map(c => {
      if (c.id !== id) return c;
      // Simulate connection
      return { ...c, status: "syncing" as const, connected: false };
    }));
    setTimeout(() => {
      setConnections(prev => prev.map(c => {
        if (c.id !== id) return c;
        return { ...c, status: "connected" as const, connected: true, accountName: "Connected Account", lastSync: new Date().toISOString() };
      }));
      showToast("Connected successfully!");
    }, 2000);
  }, []);

  const handleDisconnect = useCallback((id: string) => {
    setConnections(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: "disconnected" as const, connected: false, accountName: "", lastSync: "" };
    }));
    showToast("Disconnected");
  }, []);

  const handleSync = useCallback((id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: "syncing" as const } : c));
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.id === id ? { ...c, status: "connected" as const, lastSync: new Date().toISOString() } : c));
      showToast("Sync complete!");
    }, 2000);
  }, []);

  const filtered = categoryFilter ? connections.filter(c => c.category === categoryFilter) : connections;
  const connectedCount = connections.filter(c => c.connected).length;
  const totalCount = connections.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Connections Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Connect your marketing channels, ads & analytics in one place</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-gray-600 font-medium">{connectedCount}/{totalCount} connected</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const catConns = connections.filter(c => c.category === key);
          const catConnected = catConns.filter(c => c.connected).length;
          return (
            <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? null : key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                categoryFilter === key ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200" : "border-gray-200 hover:border-gray-300"
              }`}>
              <div className={`text-xs font-bold ${meta.color}`}>{meta.label}</div>
              <div className="text-lg font-bold text-gray-900 mt-1">{catConnected}/{catConns.length}</div>
            </button>
          );
        })}
      </div>

      {/* Connection Cards */}
      <div className="space-y-3">
        {filtered.map(conn => {
          const locked = planRank[conn.requiredPlan] > userRank;
          const statusStyle = STATUS_STYLES[conn.status] || STATUS_STYLES.disconnected;
          const catMeta = CATEGORY_META[conn.category];

          return (
            <div key={conn.id} className={`rounded-xl border p-4 transition-all ${
              conn.connected ? "border-emerald-200 bg-white" :
              locked ? "border-gray-200 bg-gray-50 opacity-60" :
              "border-gray-200 bg-white hover:border-gray-300"
            }`}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0 mt-0.5">{conn.icon}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{conn.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${catMeta.bg} ${catMeta.color}`}>
                      {catMeta.label}
                    </span>
                    {locked && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 capitalize">
                        {conn.requiredPlan}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{conn.description}</p>

                  {/* Connected details */}
                  {conn.connected && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span className={statusStyle.color}>{statusStyle.label}</span>
                        {conn.accountName && <span className="text-gray-400">{"\u00B7"} {conn.accountName}</span>}
                        {conn.lastSync && (
                          <span className="text-gray-400">
                            {"\u00B7"} Last sync: {new Date(conn.lastSync).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>

                      {/* Metrics */}
                      {conn.metrics && (
                        <div className="flex gap-4 mt-2">
                          {conn.metrics.map(m => (
                            <div key={m.label}>
                              <div className="text-sm font-bold text-gray-800">{m.value}</div>
                              <div className="text-[10px] text-gray-400">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {conn.status === "syncing" ? (
                    <span className="text-xs text-blue-600 font-medium px-3 py-1.5">Syncing...</span>
                  ) : conn.connected ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleSync(conn.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                        {"\uD83D\uDD04"} Sync
                      </button>
                      <button onClick={() => handleDisconnect(conn.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">
                        Disconnect
                      </button>
                    </div>
                  ) : locked ? (
                    <a href="/dashboard/plan" className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200">
                      Upgrade
                    </a>
                  ) : (
                    <button onClick={() => handleConnect(conn.id)}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-800">Need help connecting?</h4>
        <p className="text-xs text-blue-600 mt-1">
          Each connection uses OAuth {"\u2014"} we never store your passwords. Connected accounts sync automatically every hour. You can disconnect anytime.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
