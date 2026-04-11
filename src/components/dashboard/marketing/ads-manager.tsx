"use client";

import { useState } from "react";

interface AdCampaign {
  id: string;
  name: string;
  platform: "google" | "meta";
  type: "search" | "display" | "lead_gen" | "retarget" | "awareness";
  status: "active" | "paused" | "draft" | "ended";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpl: number;
  startDate: string;
  endDate: string;
  audiences: string[];
  aiScore: number;
}

interface AdCreative {
  id: string;
  headline: string;
  description: string;
  cta: string;
  platform: "google" | "meta";
  format: "text" | "image" | "carousel" | "video";
  performance: "top" | "good" | "low" | "untested";
}

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  search: { label: "Search", icon: "\uD83D\uDD0D", color: "bg-blue-100 text-blue-700" },
  display: { label: "Display", icon: "\uD83D\uDDBC\uFE0F", color: "bg-purple-100 text-purple-700" },
  lead_gen: { label: "Lead Gen", icon: "\uD83C\uDFAF", color: "bg-emerald-100 text-emerald-700" },
  retarget: { label: "Retarget", icon: "\uD83D\uDD04", color: "bg-amber-100 text-amber-700" },
  awareness: { label: "Awareness", icon: "\uD83D\uDCE2", color: "bg-pink-100 text-pink-700" },
};

const DEMO_CAMPAIGNS: AdCampaign[] = [
  { id: "1", name: "Dermatology \u2014 Hyderabad Search", platform: "google", type: "search", status: "active", budget: 15000, spent: 8420, impressions: 24300, clicks: 1860, conversions: 48, cpl: 175, startDate: "2026-04-01", endDate: "2026-04-30", audiences: ["Hyderabad 25-55", "Skin care interest"], aiScore: 92 },
  { id: "2", name: "Pediatric Clinic Awareness", platform: "meta", type: "awareness", status: "active", budget: 8000, spent: 3200, impressions: 42000, clicks: 840, conversions: 28, cpl: 114, startDate: "2026-04-05", endDate: "2026-04-25", audiences: ["Parents 25-40", "Within 10km"], aiScore: 87 },
  { id: "3", name: "Dental Checkup Lead Gen", platform: "meta", type: "lead_gen", status: "active", budget: 12000, spent: 6700, impressions: 18500, clicks: 1420, conversions: 52, cpl: 129, startDate: "2026-04-01", endDate: "2026-04-30", audiences: ["Adults 18-60", "Dental keywords"], aiScore: 94 },
  { id: "4", name: "Website Visitors Retarget", platform: "google", type: "retarget", status: "active", budget: 5000, spent: 2100, impressions: 8900, clicks: 620, conversions: 35, cpl: 60, startDate: "2026-04-01", endDate: "2026-04-30", audiences: ["Site visitors 30d", "Abandoned booking"], aiScore: 96 },
  { id: "5", name: "Full Body Checkup \u2014 Display", platform: "google", type: "display", status: "paused", budget: 10000, spent: 4500, impressions: 52000, clicks: 312, conversions: 8, cpl: 562, startDate: "2026-03-15", endDate: "2026-04-15", audiences: ["Health conscious 30-55"], aiScore: 41 },
  { id: "6", name: "Summer Skin Care Campaign", platform: "meta", type: "lead_gen", status: "draft", budget: 20000, spent: 0, impressions: 0, clicks: 0, conversions: 0, cpl: 0, startDate: "2026-04-15", endDate: "2026-05-15", audiences: ["Women 20-45", "Beauty interest"], aiScore: 0 },
];

const DEMO_CREATIVES: AdCreative[] = [
  { id: "1", headline: "Expert Skin Care in Hyderabad", description: "Board-certified dermatologists. Walk-in & online appointments. Book today!", cta: "Book Now", platform: "google", format: "text", performance: "top" },
  { id: "2", headline: "Your Child Deserves the Best Care", description: "Trusted pediatric clinic with 10+ years experience. Vaccination & growth tracking.", cta: "Learn More", platform: "meta", format: "image", performance: "good" },
  { id: "3", headline: "Dental Checkup @ \u20B9499", description: "Complete dental examination + cleaning. Limited time offer. Walk-in or book online.", cta: "Claim Offer", platform: "meta", format: "carousel", performance: "top" },
  { id: "4", headline: "Don't Ignore That Skin Rash", description: "Early treatment = faster recovery. Consult our dermatology experts today.", cta: "Book Appointment", platform: "google", format: "text", performance: "low" },
];

const AI_RECOMMENDATIONS = [
  { type: "budget", icon: "\uD83D\uDCB0", text: "Shift \u20B93,000 from Display campaign (CPL \u20B9562) to Retarget campaign (CPL \u20B960). Expected: +15 additional conversions.", priority: "high" },
  { type: "creative", icon: "\u270D\uFE0F", text: "Ad #4 has low CTR (0.8%). Try positive framing: 'Get Clear, Healthy Skin \u2014 Expert Care Today'.", priority: "medium" },
  { type: "audience", icon: "\uD83D\uDC65", text: "Create a Lookalike audience from your 52 dental conversions. Meta can find 5-10x more similar patients.", priority: "high" },
  { type: "timing", icon: "\u23F0", text: "Your ads perform 42% better between 7-9 PM. Consider dayparting to save \u20B9800/week.", priority: "medium" },
  { type: "new", icon: "\uD83D\uDE80", text: "Launch Google Search for 'best pediatrician near me' \u2014 2,400 monthly searches in Hyderabad, low competition.", priority: "high" },
];

function OverviewTab({ campaigns }: { campaigns: AdCampaign[] }) {
  const active = campaigns.filter(c => c.status === "active");
  const totalSpent = active.reduce((s, c) => s + c.spent, 0);
  const totalBudget = active.reduce((s, c) => s + c.budget, 0);
  const totalConversions = active.reduce((s, c) => s + c.conversions, 0);
  const avgCpl = totalConversions > 0 ? Math.round(totalSpent / totalConversions) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Total Spend</div>
          <div className="text-xl font-bold text-gray-900">{"\u20B9"}{(totalSpent / 1000).toFixed(1)}k</div>
          <div className="text-xs text-gray-400">of {"\u20B9"}{(totalBudget / 1000).toFixed(0)}k budget</div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totalSpent / totalBudget) * 100}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Conversions</div>
          <div className="text-xl font-bold text-emerald-600">{totalConversions}</div>
          <div className="text-xs text-emerald-500">+18% vs last month</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Avg CPL</div>
          <div className="text-xl font-bold text-gray-900">{"\u20B9"}{avgCpl}</div>
          <div className="text-xs text-emerald-500">-12% vs last month</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">ROAS</div>
          <div className="text-xl font-bold text-gray-900">6.8x</div>
          <div className="text-xs text-emerald-500">{"\u2191"} from 5.2x</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Platform Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{"\uD83D\uDCCA"}</span>
              <span className="font-semibold text-sm text-blue-800">Google Ads</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-bold text-gray-800">{"\u20B9"}{((active.filter(c => c.platform === "google").reduce((s, c) => s + c.spent, 0)) / 1000).toFixed(1)}k</span> spent</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "google").reduce((s, c) => s + c.conversions, 0)}</span> conversions</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "google").reduce((s, c) => s + c.clicks, 0).toLocaleString()}</span> clicks</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "google").length}</span> campaigns</div>
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{"\uD83C\uDFAF"}</span>
              <span className="font-semibold text-sm text-indigo-800">Meta Ads</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-bold text-gray-800">{"\u20B9"}{((active.filter(c => c.platform === "meta").reduce((s, c) => s + c.spent, 0)) / 1000).toFixed(1)}k</span> spent</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "meta").reduce((s, c) => s + c.conversions, 0)}</span> conversions</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "meta").reduce((s, c) => s + c.clicks, 0).toLocaleString()}</span> clicks</div>
              <div><span className="font-bold text-gray-800">{active.filter(c => c.platform === "meta").length}</span> campaigns</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">{"\u2728"} AI Recommendations</h3>
        <div className="space-y-3">
          {AI_RECOMMENDATIONS.map((rec, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${
              rec.priority === "high" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"
            }`}>
              <span className="text-lg flex-shrink-0">{rec.icon}</span>
              <div className="flex-1"><p className="text-gray-700">{rec.text}</p></div>
              <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap flex-shrink-0">Apply</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignsTab({ campaigns, onToggle }: { campaigns: AdCampaign[]; onToggle: (id: string) => void }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {["all", "active", "paused", "draft"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                filter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>{f}</button>
          ))}
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5">
          {"\u2728"} AI Create Campaign
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  campaign.platform === "google" ? "bg-blue-100" : "bg-indigo-100"
                }`}>{campaign.platform === "google" ? "\uD83D\uDCCA" : "\uD83C\uDFAF"}</div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{campaign.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_META[campaign.type].color}`}>
                      {TYPE_META[campaign.type].icon} {TYPE_META[campaign.type].label}
                    </span>
                    <span className="text-xs text-gray-400">{campaign.startDate} {"\u2192"} {campaign.endDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {campaign.aiScore > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    campaign.aiScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                    campaign.aiScore >= 50 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>AI: {campaign.aiScore}</span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  campaign.status === "active" ? "bg-emerald-100 text-emerald-700" :
                  campaign.status === "paused" ? "bg-amber-100 text-amber-700" :
                  campaign.status === "draft" ? "bg-gray-100 text-gray-600" :
                  "bg-red-100 text-red-700"
                }`}>{campaign.status}</span>
              </div>
            </div>

            {campaign.status !== "draft" && (
              <div className="grid grid-cols-5 gap-4 mb-3">
                {[
                  { label: "Budget", value: `\u20B9${(campaign.budget / 1000).toFixed(0)}k` },
                  { label: "Spent", value: `\u20B9${(campaign.spent / 1000).toFixed(1)}k` },
                  { label: "Clicks", value: campaign.clicks.toLocaleString() },
                  { label: "Conversions", value: String(campaign.conversions), highlight: true },
                  { label: "CPL", value: `\u20B9${campaign.cpl}`, warn: campaign.cpl > 300 },
                ].map(m => (
                  <div key={m.label} className="text-xs">
                    <div className="text-gray-400">{m.label}</div>
                    <div className={`font-bold ${'warn' in m && m.warn ? "text-red-600" : 'highlight' in m && m.highlight ? "text-emerald-600" : "text-gray-800"}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex gap-1 flex-wrap">
                {campaign.audiences.map(a => (
                  <span key={a} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{a}</span>
                ))}
              </div>
              <div className="flex gap-2">
                {campaign.status === "active" && (
                  <button onClick={() => onToggle(campaign.id)} className="text-xs px-3 py-1 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50">Pause</button>
                )}
                {campaign.status === "paused" && (
                  <button onClick={() => onToggle(campaign.id)} className="text-xs px-3 py-1 border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50">Resume</button>
                )}
                <button className="text-xs px-3 py-1 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativesTab({ creatives }: { creatives: AdCreative[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Ad Creatives</h3>
        <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 flex items-center gap-1.5">
          {"\u2728"} AI Generate Ads
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creatives.map(creative => (
          <div key={creative.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{creative.platform === "google" ? "\uD83D\uDCCA" : "\uD83C\uDFAF"}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  creative.format === "text" ? "bg-gray-100 text-gray-600" :
                  creative.format === "image" ? "bg-blue-100 text-blue-600" :
                  creative.format === "carousel" ? "bg-purple-100 text-purple-600" :
                  "bg-red-100 text-red-600"
                }`}>{creative.format}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                creative.performance === "top" ? "bg-emerald-100 text-emerald-700" :
                creative.performance === "good" ? "bg-blue-100 text-blue-700" :
                creative.performance === "low" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-500"
              }`}>{creative.performance === "top" ? "\u2B50 Top" : creative.performance === "good" ? "Good" : creative.performance === "low" ? "Low" : "Untested"}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h4 className="text-sm font-semibold text-blue-700 mb-1">{creative.headline}</h4>
              <p className="text-xs text-gray-600 mb-2">{creative.description}</p>
              <span className="text-xs px-3 py-1 bg-blue-600 text-white rounded">{creative.cta}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Edit</button>
              <button className="flex-1 text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Duplicate</button>
              <button className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">{"\u2728"} Improve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdsManager() {
  const [tab, setTab] = useState<"overview" | "campaigns" | "creatives">("overview");
  const [campaigns, setCampaigns] = useState(DEMO_CAMPAIGNS);

  const handleToggle = (id: string) => {
    setCampaigns(prev => prev.map(c =>
      c.id === id ? { ...c, status: (c.status === "active" ? "paused" : "active") as AdCampaign["status"] } : c
    ));
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "\uD83D\uDCCA" },
    { id: "campaigns" as const, label: "Campaigns", icon: "\uD83C\uDFAF" },
    { id: "creatives" as const, label: "Ad Creatives", icon: "\u270D\uFE0F" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ads Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Create & optimize Google Ads + Meta Ads from one dashboard</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === t.id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab campaigns={campaigns} />}
      {tab === "campaigns" && <CampaignsTab campaigns={campaigns} onToggle={handleToggle} />}
      {tab === "creatives" && <CreativesTab creatives={DEMO_CREATIVES} />}
    </div>
  );
}
