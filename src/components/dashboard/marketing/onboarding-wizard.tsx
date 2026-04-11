"use client";

import { useState, useCallback } from "react";

// ── Types ──
interface ClinicProfile {
  name: string;
  speciality: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  operatingHours: { day: string; open: string; close: string; closed: boolean }[];
  photos: string[];
}

interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  fontStyle: "modern" | "classic" | "friendly" | "medical";
  tone: "professional" | "warm" | "casual" | "authoritative";
  tagline: string;
  aiTagline: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: "admin" | "doctor" | "receptionist" | "marketing";
  permissions: { posts: boolean; reviews: boolean; leads: boolean; analytics: boolean };
}

interface ChannelConnection {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  requiredPlan: "starter" | "growth" | "professional";
  description: string;
}

const SPECIALITIES = [
  "General Medicine", "Pediatrics", "Gynecology", "Orthopedics",
  "Dermatology", "ENT", "Ophthalmology", "Cardiology",
  "Neurology", "Psychiatry", "Dentistry", "Physiotherapy",
  "Ayurveda", "Homeopathy", "Pulmonology", "Urology"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FONT_STYLES = [
  { id: "modern", label: "Modern", preview: "Aa" },
  { id: "classic", label: "Classic", preview: "Aa" },
  { id: "friendly", label: "Friendly", preview: "Aa" },
  { id: "medical", label: "Medical", preview: "Aa" },
];

const TONES = [
  { id: "professional", label: "Professional", desc: "Formal, trust-building" },
  { id: "warm", label: "Warm & Caring", desc: "Empathetic, approachable" },
  { id: "casual", label: "Casual", desc: "Relaxed, conversational" },
  { id: "authoritative", label: "Authoritative", desc: "Expert, confident" },
];

const DEFAULT_CHANNELS: ChannelConnection[] = [
  { id: "google", name: "Google Business Profile", icon: "\uD83D\uDD0D", connected: false, requiredPlan: "growth", description: "Manage your Google listing, reviews & posts" },
  { id: "facebook", name: "Facebook Page", icon: "\uD83D\uDCD8", connected: false, requiredPlan: "growth", description: "Auto-post content & manage reviews" },
  { id: "instagram", name: "Instagram Business", icon: "\uD83D\uDCF8", connected: false, requiredPlan: "growth", description: "Share visual content & stories" },
  { id: "whatsapp", name: "WhatsApp Business", icon: "\uD83D\uDCAC", connected: false, requiredPlan: "growth", description: "Patient communication & reminders" },
  { id: "practo", name: "Practo Profile", icon: "\uD83D\uDFE2", connected: false, requiredPlan: "professional", description: "Sync reviews & manage listing" },
  { id: "justdial", name: "JustDial", icon: "\uD83D\uDCDE", connected: false, requiredPlan: "professional", description: "Manage business listing" },
  { id: "youtube", name: "YouTube Channel", icon: "\u25B6\uFE0F", connected: false, requiredPlan: "professional", description: "Health education videos" },
];

const DEFAULT_TEAM: TeamMember[] = [
  { id: "1", name: "", role: "admin", permissions: { posts: true, reviews: true, leads: true, analytics: true } },
  { id: "2", name: "", role: "doctor", permissions: { posts: false, reviews: true, leads: false, analytics: true } },
  { id: "3", name: "", role: "receptionist", permissions: { posts: false, reviews: false, leads: true, analytics: false } },
  { id: "4", name: "", role: "marketing", permissions: { posts: true, reviews: true, leads: true, analytics: true } },
];

// ── Step Indicator ──
function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
              i < current ? "bg-emerald-600 border-emerald-600 text-white" :
              i === current ? "border-emerald-600 text-emerald-600 bg-emerald-50" :
              "border-gray-300 text-gray-400 bg-white"
            }`}>
              {i < current ? "\u2713" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i <= current ? "text-emerald-700" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < total - 1 && (
            <div className={`w-16 h-0.5 mb-5 ${i < current ? "bg-emerald-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Profile ──
function ProfileStep({ profile, onChange }: { profile: ClinicProfile; onChange: (p: ClinicProfile) => void }) {
  const updateField = <K extends keyof ClinicProfile>(field: K, value: ClinicProfile[K]) => onChange({ ...profile, [field]: value });
  const toggleDay = (idx: number) => {
    const hours = [...profile.operatingHours];
    hours[idx] = { ...hours[idx], closed: !hours[idx].closed };
    onChange({ ...profile, operatingHours: hours });
  };
  const updateHour = (idx: number, field: "open" | "close", val: string) => {
    const hours = [...profile.operatingHours];
    hours[idx] = { ...hours[idx], [field]: val };
    onChange({ ...profile, operatingHours: hours });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Clinic Profile</h3>
        <p className="text-sm text-gray-500">This information appears on your website, Google listing & social profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
          <input type="text" value={profile.name} onChange={e => updateField("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="e.g. LifeCare Multispeciality Clinic" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Speciality *</label>
          <select value={profile.speciality} onChange={e => updateField("speciality", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
            <option value="">Select speciality</option>
            {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input type="tel" value={profile.phone} onChange={e => updateField("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={profile.email} onChange={e => updateField("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="clinic@example.com" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
        <input type="text" value={profile.address} onChange={e => updateField("address", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Building, Street, Area" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input type="text" value={profile.city} onChange={e => updateField("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Hyderabad" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input type="text" value={profile.state} onChange={e => updateField("state", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Telangana" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
          <input type="text" value={profile.pincode} onChange={e => updateField("pincode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="500001" />
        </div>
      </div>

      {/* Operating Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Operating Hours</label>
        <div className="space-y-2">
          {profile.operatingHours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-3 text-sm">
              <button onClick={() => toggleDay(i)}
                className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${h.closed ? "border-gray-300 bg-white" : "border-emerald-500 bg-emerald-500 text-white"}`}>
                {!h.closed && "\u2713"}
              </button>
              <span className="w-24 font-medium text-gray-700">{h.day}</span>
              {h.closed ? (
                <span className="text-gray-400 italic">Closed</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="time" value={h.open} onChange={e => updateHour(i, "open", e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <span className="text-gray-400">to</span>
                  <input type="time" value={h.close} onChange={e => updateHour(i, "close", e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Photos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer">
          <div className="text-3xl mb-2">{"\uD83D\uDCF7"}</div>
          <p className="text-sm text-gray-600">Drag & drop photos or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">Reception, consulting rooms, equipment, signage</p>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Brand Kit ──
function BrandKitStep({ brand, onChange }: { brand: BrandKit; onChange: (b: BrandKit) => void }) {
  const [generating, setGenerating] = useState(false);

  const generateTagline = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const taglines = [
        "Where compassion meets clinical excellence",
        "Your health, our commitment \u2014 every day",
        "Advanced care, personal touch",
        "Healing with heart, powered by technology",
        "Trusted healthcare for your family",
      ];
      onChange({ ...brand, aiTagline: taglines[Math.floor(Math.random() * taglines.length)] });
      setGenerating(false);
    }, 1500);
  }, [brand, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Brand Kit</h3>
        <p className="text-sm text-gray-500">Define your clinic&apos;s visual identity for all marketing channels</p>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={brand.primaryColor} onChange={e => onChange({ ...brand, primaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-0" />
            <input type="text" value={brand.primaryColor} onChange={e => onChange({ ...brand, primaryColor: e.target.value })}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={brand.secondaryColor} onChange={e => onChange({ ...brand, secondaryColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-0" />
            <input type="text" value={brand.secondaryColor} onChange={e => onChange({ ...brand, secondaryColor: e.target.value })}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg p-4 border" style={{ borderColor: brand.primaryColor, background: `${brand.primaryColor}08` }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full" style={{ background: brand.primaryColor }} />
          <div>
            <div className="font-bold text-sm" style={{ color: brand.primaryColor }}>Your Clinic Name</div>
            <div className="text-xs" style={{ color: brand.secondaryColor }}>Tagline preview</div>
          </div>
        </div>
        <div className="h-2 rounded-full w-3/4" style={{ background: brand.primaryColor }} />
        <div className="h-2 rounded-full w-1/2 mt-1" style={{ background: brand.secondaryColor }} />
      </div>

      {/* Font Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
        <div className="grid grid-cols-4 gap-3">
          {FONT_STYLES.map(f => (
            <button key={f.id} onClick={() => onChange({ ...brand, fontStyle: f.id as BrandKit["fontStyle"] })}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                brand.fontStyle === f.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
              }`}>
              <div className="text-2xl font-bold text-gray-700">{f.preview}</div>
              <div className="text-xs text-gray-500 mt-1">{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Communication Tone</label>
        <div className="grid grid-cols-2 gap-3">
          {TONES.map(t => (
            <button key={t.id} onClick={() => onChange({ ...brand, tone: t.id as BrandKit["tone"] })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                brand.tone === t.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
              }`}>
              <div className="font-medium text-sm text-gray-800">{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Tagline</label>
        <input type="text" value={brand.tagline} onChange={e => onChange({ ...brand, tagline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Your clinic's tagline" />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={generateTagline} disabled={generating}
            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2">
            <span>{"\u2728"}</span> {generating ? "Generating..." : "AI Generate Tagline"}
          </button>
          {brand.aiTagline && (
            <button onClick={() => onChange({ ...brand, tagline: brand.aiTagline })}
              className="text-sm text-emerald-600 hover:underline">
              Use: &ldquo;{brand.aiTagline}&rdquo;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Team ──
function TeamStep({ team, onChange }: { team: TeamMember[]; onChange: (t: TeamMember[]) => void }) {
  const roleLabels: Record<string, string> = { admin: "Admin", doctor: "Doctor", receptionist: "Receptionist", marketing: "Marketing Staff" };
  const permLabels = ["posts", "reviews", "leads", "analytics"] as const;

  const updateName = (idx: number, name: string) => {
    const t = [...team]; t[idx] = { ...t[idx], name }; onChange(t);
  };
  const togglePerm = (idx: number, perm: keyof TeamMember["permissions"]) => {
    const t = [...team]; t[idx] = { ...t[idx], permissions: { ...t[idx].permissions, [perm]: !t[idx].permissions[perm] } }; onChange(t);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Roles & Permissions</h3>
        <p className="text-sm text-gray-500">Define who can manage your marketing channels</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">Role</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Name</th>
              {permLabels.map(p => (
                <th key={p} className="text-center py-3 px-2 font-medium text-gray-600 capitalize">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.map((m, i) => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    m.role === "admin" ? "bg-purple-100 text-purple-700" :
                    m.role === "doctor" ? "bg-blue-100 text-blue-700" :
                    m.role === "receptionist" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {roleLabels[m.role]}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <input type="text" value={m.name} onChange={e => updateName(i, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder={`${roleLabels[m.role]} name`} />
                </td>
                {permLabels.map(p => (
                  <td key={p} className="py-3 px-2 text-center">
                    <button onClick={() => togglePerm(i, p)}
                      className={`w-6 h-6 rounded border flex items-center justify-center text-xs ${
                        m.permissions[p] ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 bg-white"
                      }`}>
                      {m.permissions[p] && "\u2713"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">You can add more team members later from Settings &rarr; Team</p>
    </div>
  );
}

// ── Step 4: Channels ──
function ChannelsStep({ channels, userPlan, onChange }: { channels: ChannelConnection[]; userPlan: string; onChange: (c: ChannelConnection[]) => void }) {
  const planRank: Record<string, number> = { starter: 0, growth: 1, professional: 2, enterprise: 3 };
  const userRank = planRank[userPlan] ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Connect Channels</h3>
        <p className="text-sm text-gray-500">Link your marketing channels for automated publishing</p>
      </div>

      <div className="space-y-3">
        {channels.map((ch, i) => {
          const locked = planRank[ch.requiredPlan] > userRank;
          return (
            <div key={ch.id} className={`flex items-center justify-between p-4 rounded-lg border ${
              ch.connected ? "border-emerald-200 bg-emerald-50" : locked ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 hover:border-emerald-300"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ch.icon}</span>
                <div>
                  <div className="font-medium text-sm text-gray-800 flex items-center gap-2">
                    {ch.name}
                    {locked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium capitalize">
                        {ch.requiredPlan}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{ch.description}</div>
                </div>
              </div>
              {ch.connected ? (
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">{"\u2713"} Connected</span>
              ) : locked ? (
                <span className="text-xs text-gray-400">Upgrade to unlock</span>
              ) : (
                <button onClick={() => {
                  const c = [...channels]; c[i] = { ...c[i], connected: true }; onChange(c);
                }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Wizard ──
export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  const [profile, setProfile] = useState<ClinicProfile>({
    name: "", speciality: "", phone: "", email: "", address: "", city: "", state: "", pincode: "",
    operatingHours: DAYS.map(day => ({
      day, open: "09:00", close: "18:00", closed: day === "Sunday"
    })),
    photos: [],
  });

  const [brand, setBrand] = useState<BrandKit>({
    primaryColor: "#059669", secondaryColor: "#064E3B",
    fontStyle: "modern", tone: "professional", tagline: "", aiTagline: "",
  });

  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [channels, setChannels] = useState<ChannelConnection[]>(DEFAULT_CHANNELS);

  const steps = ["Profile", "Brand Kit", "Team", "Channels"];

  const handleComplete = useCallback(() => {
    setSaving(true);
    // TODO: POST /api/marketing/onboarding
    setTimeout(() => {
      setSaving(false);
      setComplete(true);
    }, 2000);
  }, []);

  if (complete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">{"\uD83C\uDF89"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Marketing Setup Complete!</h2>
        <p className="text-gray-600 mb-6">Your clinic is ready to grow. Start creating content or explore your marketing dashboard.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/dashboard/content" className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm">
            Create First Post
          </a>
          <a href="/dashboard" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Marketing Setup</h2>
        <p className="text-gray-500 text-sm mt-1">Complete these steps to activate your AI marketing engine</p>
      </div>

      <StepIndicator current={step} total={4} labels={steps} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {step === 0 && <ProfileStep profile={profile} onChange={setProfile} />}
        {step === 1 && <BrandKitStep brand={brand} onChange={setBrand} />}
        {step === 2 && <TeamStep team={team} onChange={setTeam} />}
        {step === 3 && <ChannelsStep channels={channels} userPlan="starter" onChange={setChannels} />}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
            &larr; Back
          </button>
          <div className="text-xs text-gray-400">Step {step + 1} of {steps.length}</div>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              Next &rarr;
            </button>
          ) : (
            <button onClick={handleComplete} disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {saving ? "Saving..." : "\u2728 Complete Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
