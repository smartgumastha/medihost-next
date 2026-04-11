"use client";

import { useState } from "react";

interface SeoScore {
  category: string;
  score: number;
  maxScore: number;
  issues: { severity: "critical" | "warning" | "info"; text: string; fix: string }[];
}

interface Keyword {
  keyword: string;
  position: number;
  change: number;
  volume: number;
  difficulty: "easy" | "medium" | "hard";
  page: string;
}

interface Competitor {
  name: string;
  domain: string;
  rating: number;
  reviews: number;
  keywords: number;
  visibility: number;
}

const SEO_SCORES: SeoScore[] = [
  { category: "On-Page SEO", score: 72, maxScore: 100, issues: [
    { severity: "critical", text: "Missing meta description on 3 service pages", fix: "Add unique meta descriptions (150-160 chars) for each service page" },
    { severity: "warning", text: "H1 tag missing on About page", fix: "Add a descriptive H1 heading to the About page" },
    { severity: "warning", text: "Image alt text missing on 8 images", fix: "Add descriptive alt text to all clinic and doctor photos" },
    { severity: "info", text: "Title tags could be more descriptive", fix: "Include location + speciality in title tags" },
  ]},
  { category: "Local SEO", score: 85, maxScore: 100, issues: [
    { severity: "warning", text: "NAP inconsistency found on 2 directories", fix: "Update JustDial and Sulekha with correct phone number" },
    { severity: "info", text: "Google Business posts not updated in 7 days", fix: "Post weekly updates with health tips and offers" },
    { severity: "info", text: "Only 23 Google reviews \u2014 competitors average 85+", fix: "Enable auto-review requests after patient visits" },
  ]},
  { category: "Technical SEO", score: 68, maxScore: 100, issues: [
    { severity: "critical", text: "Page load time: 4.2s (should be <2.5s)", fix: "Compress images, enable lazy loading, minimize CSS/JS" },
    { severity: "critical", text: "Mobile responsiveness issues on booking page", fix: "Fix viewport and touch target sizes on mobile" },
    { severity: "warning", text: "Missing XML sitemap", fix: "Generate and submit sitemap.xml to Google Search Console" },
    { severity: "warning", text: "No SSL certificate on subdomain", fix: "Install SSL on appointments subdomain" },
    { severity: "info", text: "Schema markup not implemented", fix: "Add MedicalBusiness and Physician schema markup" },
  ]},
  { category: "Content", score: 60, maxScore: 100, issues: [
    { severity: "warning", text: "No blog or health articles section", fix: "Create a blog with 2-3 health articles per week" },
    { severity: "warning", text: "Service pages have thin content (<300 words)", fix: "Expand service descriptions with symptoms, treatments, FAQs" },
    { severity: "info", text: "No FAQ section on high-traffic pages", fix: "Add FAQ schema with common patient questions" },
  ]},
];

const KEYWORDS: Keyword[] = [
  { keyword: "dermatologist hyderabad", position: 8, change: 3, volume: 2400, difficulty: "hard", page: "/services/dermatology" },
  { keyword: "skin specialist near me", position: 12, change: -2, volume: 1800, difficulty: "hard", page: "/services/dermatology" },
  { keyword: "best clinic hyderabad", position: 15, change: 5, volume: 3200, difficulty: "hard", page: "/" },
  { keyword: "pediatrician banjara hills", position: 3, change: 1, volume: 480, difficulty: "easy", page: "/services/pediatrics" },
  { keyword: "dental checkup hyderabad", position: 6, change: 4, volume: 1600, difficulty: "medium", page: "/services/dental" },
  { keyword: "lab test near me", position: 18, change: -1, volume: 2800, difficulty: "hard", page: "/services/lab" },
  { keyword: "online doctor consultation", position: 42, change: 8, volume: 4800, difficulty: "hard", page: "/teleconsult" },
  { keyword: "full body checkup price", position: 9, change: 2, volume: 1200, difficulty: "medium", page: "/packages/health-checkup" },
  { keyword: "lifecare clinic reviews", position: 1, change: 0, volume: 90, difficulty: "easy", page: "/" },
  { keyword: "walk in clinic hyderabad", position: 11, change: 6, volume: 720, difficulty: "medium", page: "/" },
];

const COMPETITORS: Competitor[] = [
  { name: "Apollo Clinic", domain: "apolloclinic.com", rating: 4.3, reviews: 342, keywords: 1240, visibility: 78 },
  { name: "Medicover Hospitals", domain: "medicover.in", rating: 4.1, reviews: 567, keywords: 890, visibility: 72 },
  { name: "CARE Hospitals", domain: "carehospitals.com", rating: 4.4, reviews: 1230, keywords: 2100, visibility: 85 },
  { name: "Your Clinic", domain: "lifecare-clinic.in", rating: 4.6, reviews: 23, keywords: 156, visibility: 34 },
];

const AI_SEO_TIPS = [
  { icon: "\uD83D\uDD0D", title: "Target long-tail keywords", text: "Create content for 'best dermatologist for acne treatment in banjara hills' \u2014 low competition, high intent.", priority: "high" },
  { icon: "\uD83D\uDCDD", title: "Blog content strategy", text: "Write articles on: 'When to see a dermatologist', '5 signs your child needs a pediatrician', 'Benefits of annual health checkups'. Publish 2/week.", priority: "high" },
  { icon: "\uD83D\uDCCD", title: "Local citations", text: "Add your clinic to Lybrate, 1mg, Sulekha, and IndiaMART. Ensure NAP consistency across all 12 directories.", priority: "medium" },
  { icon: "\u2B50", title: "Review velocity", text: "You're getting 3 reviews/month. Competitors average 15/month. Enable WhatsApp auto-requests to reach 10+/month.", priority: "high" },
  { icon: "\uD83D\uDCF1", title: "Mobile optimization", text: "58% of your traffic is mobile. Fix the booking form layout and reduce page load to under 2.5 seconds.", priority: "critical" },
];

function ScoreCircle({ score, maxScore, size = 80 }: { score: number; maxScore: number; size?: number }) {
  const pct = (score / maxScore) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold" style={{ color }}>{score}</div>
        <div className="text-[10px] text-gray-400">/{maxScore}</div>
      </div>
    </div>
  );
}

function AuditTab() {
  const totalScore = SEO_SCORES.reduce((s, c) => s + c.score, 0);
  const totalMax = SEO_SCORES.reduce((s, c) => s + c.maxScore, 0);
  const criticals = SEO_SCORES.flatMap(c => c.issues).filter(i => i.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-8">
        <ScoreCircle score={Math.round((totalScore / totalMax) * 100)} maxScore={100} size={100} />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Overall SEO Score</h3>
          <p className="text-sm text-gray-500 mt-1">{criticals} critical issues found {"\u00B7"} {SEO_SCORES.flatMap(c => c.issues).length} total improvements</p>
          <button className="mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 flex items-center gap-1.5">
            {"\u2728"} AI Fix All Issues
          </button>
        </div>
      </div>

      {SEO_SCORES.map(cat => (
        <div key={cat.category} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ScoreCircle score={cat.score} maxScore={cat.maxScore} size={56} />
              <div>
                <h4 className="font-semibold text-gray-800">{cat.category}</h4>
                <p className="text-xs text-gray-400">{cat.issues.length} issues</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {cat.issues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                issue.severity === "critical" ? "bg-red-50" : issue.severity === "warning" ? "bg-amber-50" : "bg-gray-50"
              }`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                  issue.severity === "critical" ? "bg-red-100 text-red-700" :
                  issue.severity === "warning" ? "bg-amber-100 text-amber-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{issue.severity}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{issue.text}</p>
                  <p className="text-xs text-gray-400 mt-1">Fix: {issue.fix}</p>
                </div>
                <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap flex-shrink-0">
                  {"\u2728"} Fix
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KeywordsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Tracked Keywords ({KEYWORDS.length})</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200">
            {"\u2728"} AI Suggest Keywords
          </button>
          <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            + Add Keyword
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Keyword</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Position</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Change</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Volume</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Difficulty</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Page</th>
            </tr>
          </thead>
          <tbody>
            {KEYWORDS.map(kw => (
              <tr key={kw.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{kw.keyword}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-bold ${kw.position <= 3 ? "text-emerald-600" : kw.position <= 10 ? "text-blue-600" : "text-gray-600"}`}>
                    #{kw.position}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs font-medium ${kw.change > 0 ? "text-emerald-600" : kw.change < 0 ? "text-red-500" : "text-gray-400"}`}>
                    {kw.change > 0 ? `\u2191${kw.change}` : kw.change < 0 ? `\u2193${Math.abs(kw.change)}` : "\u2014"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-600">{kw.volume.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    kw.difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
                    kw.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{kw.difficulty}</span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-400 font-mono">{kw.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompetitorsTab() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Competitor Analysis</h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Clinic</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Rating</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Reviews</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Keywords</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map(comp => (
              <tr key={comp.domain} className={`border-b border-gray-100 ${comp.domain === "lifecare-clinic.in" ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-800">{comp.name}</div>
                  <div className="text-xs text-gray-400">{comp.domain}</div>
                </td>
                <td className="py-3 px-4 text-center font-medium text-amber-600">{comp.rating}{"\u2605"}</td>
                <td className="py-3 px-4 text-center text-gray-600">{comp.reviews}</td>
                <td className="py-3 px-4 text-center text-gray-600">{comp.keywords.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${comp.visibility >= 70 ? "bg-emerald-500" : comp.visibility >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${comp.visibility}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{comp.visibility}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-2">Gap Analysis</h4>
        <p className="text-sm text-amber-700">Your visibility (34%) is significantly below competitors (avg 78%). Top gaps: review count (23 vs avg 713), keyword coverage (156 vs avg 1,410), and content depth. Focus on blog content + review generation to close the gap fastest.</p>
      </div>
    </div>
  );
}

function AiTipsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">{"\u2728"} AI SEO Strategy</h3>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          Generate Full SEO Plan
        </button>
      </div>

      <div className="space-y-3">
        {AI_SEO_TIPS.map((tip, i) => (
          <div key={i} className={`bg-white rounded-xl border p-5 ${
            tip.priority === "critical" ? "border-red-200" : tip.priority === "high" ? "border-emerald-200" : "border-gray-200"
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{tip.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900">{tip.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tip.priority === "critical" ? "bg-red-100 text-red-700" :
                    tip.priority === "high" ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{tip.priority}</span>
                </div>
                <p className="text-sm text-gray-600">{tip.text}</p>
              </div>
              <button className="text-xs px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap flex-shrink-0">
                {"\u2728"} Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeoOptimizer() {
  const [tab, setTab] = useState<"audit" | "keywords" | "competitors" | "ai_tips">("audit");

  const tabs = [
    { id: "audit" as const, label: "Site Audit", icon: "\uD83D\uDD0D" },
    { id: "keywords" as const, label: "Keywords", icon: "\uD83C\uDFF7\uFE0F" },
    { id: "competitors" as const, label: "Competitors", icon: "\u2694\uFE0F" },
    { id: "ai_tips" as const, label: "AI Strategy", icon: "\u2728" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Optimizer</h2>
          <p className="text-sm text-gray-500 mt-1">Improve your clinic&apos;s search engine visibility</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          {"\uD83D\uDD04"} Run Full Audit
        </button>
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

      {tab === "audit" && <AuditTab />}
      {tab === "keywords" && <KeywordsTab />}
      {tab === "competitors" && <CompetitorsTab />}
      {tab === "ai_tips" && <AiTipsTab />}
    </div>
  );
}
