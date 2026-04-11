"use client";

import { useState, useCallback } from "react";
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";

interface BrandAsset {
  id: string;
  type: "logo" | "social_cover" | "profile_pic" | "business_card" | "letterhead" | "prescription_pad" | "signage";
  name: string;
  preview: string;
  status: "generated" | "approved" | "draft";
  variants: number;
}

interface LogoOption {
  id: string;
  style: string;
  colors: string[];
  description: string;
  selected: boolean;
}

const BRAND_ASSETS: BrandAsset[] = [
  { id: "1", type: "logo", name: "Primary Logo", preview: "\uD83C\uDFE5", status: "approved", variants: 4 },
  { id: "2", type: "logo", name: "Logo Icon (Favicon)", preview: "\u2695\uFE0F", status: "approved", variants: 2 },
  { id: "3", type: "social_cover", name: "Facebook Cover", preview: "fb", status: "generated", variants: 3 },
  { id: "4", type: "social_cover", name: "Instagram Highlight Covers", preview: "ig", status: "draft", variants: 0 },
  { id: "5", type: "profile_pic", name: "Social Profile Picture", preview: "\uD83D\uDC64", status: "generated", variants: 2 },
  { id: "6", type: "business_card", name: "Doctor Business Card", preview: "\uD83D\uDCB3", status: "generated", variants: 3 },
  { id: "7", type: "letterhead", name: "Clinic Letterhead", preview: "\uD83D\uDCC4", status: "draft", variants: 0 },
  { id: "8", type: "prescription_pad", name: "Prescription Pad Design", preview: "\uD83D\uDCCB", status: "draft", variants: 0 },
  { id: "9", type: "signage", name: "Clinic Signage Template", preview: "\uD83E\uDEA7", status: "draft", variants: 0 },
];

const LOGO_OPTIONS: LogoOption[] = [
  { id: "1", style: "Modern Minimal", colors: ["#059669", "#064E3B"], description: "Clean lines, geometric health cross with sans-serif type", selected: false },
  { id: "2", style: "Classic Medical", colors: ["#1D4ED8", "#FFFFFF"], description: "Traditional caduceus-inspired mark with serif typography", selected: false },
  { id: "3", style: "Friendly Rounded", colors: ["#059669", "#10B981"], description: "Soft rounded shapes, heart-health icon, approachable feel", selected: true },
  { id: "4", style: "Bold Premium", colors: ["#1B4332", "#D4AF37"], description: "Dark green with gold accent, premium positioning", selected: false },
];

const ASSET_TYPES = [
  { id: "all", label: "All Assets" },
  { id: "logo", label: "Logos" },
  { id: "social_cover", label: "Social Covers" },
  { id: "profile_pic", label: "Profile Pics" },
  { id: "business_card", label: "Business Cards" },
  { id: "letterhead", label: "Stationery" },
];

function AssetPreviewIcon({ preview }: { preview: string }) {
  if (preview === "fb") return <SiFacebook size={36} color="#1877F2" />;
  if (preview === "ig") return <SiInstagram size={36} color="#E4405F" />;
  if (preview === "yt") return <SiYoutube size={36} color="#FF0000" />;
  if (preview === "li") return <span className="text-2xl font-bold text-blue-700">in</span>;
  return <span className="text-4xl">{preview}</span>;
}

function LogoMaker({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [clinicName, setClinicName] = useState("LifeCare Clinic");
  const [tagline, setTagline] = useState("Where compassion meets care");
  const [speciality, setSpeciality] = useState("Multispeciality");
  const [options, setOptions] = useState(LOGO_OPTIONS);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); setStep(2); }, 3000);
  }, []);

  const selectOption = (id: string) => {
    setOptions(prev => prev.map(o => ({ ...o, selected: o.id === id })));
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">{"\u2190"} Back to Brand Studio</button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">{"\u2728"} AI Logo Maker</h2>
        <p className="text-sm text-gray-500 mt-1">Generate a professional clinic logo in seconds</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {["Clinic Details", "Style Selection", "Generated Logos", "Download"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-gray-100 text-gray-400"
            }`}>{i < step ? "\u2713" : i + 1}</div>
            <span className={`text-xs font-medium hidden md:inline ${i <= step ? "text-emerald-700" : "text-gray-400"}`}>{label}</span>
            {i < 3 && <div className={`w-8 h-0.5 ${i < step ? "bg-emerald-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
            <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
            <select value={speciality} onChange={e => setSpeciality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              {["Multispeciality", "Dental", "Pediatrics", "Dermatology", "Cardiology", "Orthopedics", "Eye Care", "Ayurveda"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setStep(1)} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Next: Choose Style {"\u2192"}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {options.map(opt => (
              <div key={opt.id} onClick={() => selectOption(opt.id)}
                className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                  opt.selected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  {opt.colors.map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-gray-200" style={{ background: c }} />
                  ))}
                </div>
                <h4 className="font-semibold text-sm text-gray-900">{opt.style}</h4>
                <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                {opt.selected && <div className="text-emerald-600 text-xs font-medium mt-2">{"\u2713"} Selected</div>}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">{"\u2190"} Back</button>
            <button onClick={handleGenerate} disabled={generating}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI is designing your logos...</>
              ) : `${"\u2728"} Generate Logos`}
            </button>
          </div>
        </div>
      )}

      {step === 2 && generated && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Here are 4 AI-generated logo concepts for <strong>{clinicName}</strong>:</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { bg: "#059669", text: "white", icon: "\u2795", label: "Geometric Cross" },
              { bg: "#064E3B", text: "white", icon: "\uD83D\uDEE1\uFE0F", label: "Shield Badge" },
              { bg: "#ECFDF5", text: "#059669", icon: "\uD83D\uDC9A", label: "Heart & Leaf" },
              { bg: "#F0FDF4", text: "#064E3B", icon: "\uD83C\uDF3F", label: "Natural Care" },
            ].map((logo, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-emerald-400 cursor-pointer transition-all">
                <div className="aspect-square flex items-center justify-center" style={{ background: logo.bg }}>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{logo.icon}</div>
                    <div className="text-sm font-bold" style={{ color: logo.text }}>{clinicName}</div>
                    <div className="text-xs mt-0.5 opacity-75" style={{ color: logo.text }}>{tagline}</div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <span className="text-xs font-medium text-gray-700">{logo.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">{"\u21BB"} Regenerate</button>
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              Select & Download {"\u2192"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-5xl mb-4">{"\uD83C\uDF89"}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Logo Package Ready!</h3>
          <p className="text-sm text-gray-500 mb-6">Your logo has been generated in multiple formats and sizes</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {["PNG (transparent)", "SVG (vector)", "JPG (white bg)", "Favicon (ICO)"].map(fmt => (
              <div key={fmt} className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">{fmt}</div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">{"\uD83D\uDCE5"} Download All</button>
            <button onClick={onBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">Generate More Assets</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetGenerator({ type, onBack }: { type: string; onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const labels: Record<string, { title: string; desc: string; sizes: string[] }> = {
    social_cover: { title: "Social Media Covers", desc: "Facebook cover, YouTube banner, LinkedIn banner, Twitter header", sizes: ["Facebook (820\u00D7312)", "YouTube (2560\u00D71440)", "LinkedIn (1584\u00D7396)", "Twitter (1500\u00D7500)"] },
    profile_pic: { title: "Profile Pictures", desc: "Clinic logo optimized for social media profiles", sizes: ["Square (500\u00D7500)", "Circle crop (400\u00D7400)", "Rounded (500\u00D7500 r=60)"] },
    business_card: { title: "Business Cards", desc: "Professional cards for doctors and staff", sizes: ["Standard (3.5\u00D72 in)", "Vertical (2\u00D73.5 in)", "Mini (2.5\u00D71.5 in)"] },
    letterhead: { title: "Clinic Stationery", desc: "Letterhead, prescription pad, and envelope designs", sizes: ["A4 Letterhead", "Prescription Pad (A5)", "Envelope (DL)", "Receipt Header"] },
    prescription_pad: { title: "Prescription Pad", desc: "Branded prescription pad with clinic identity", sizes: ["A5 Portrait", "A5 Landscape", "Thermal (80mm)"] },
    signage: { title: "Clinic Signage", desc: "Templates for indoor and outdoor clinic signage", sizes: ["Outdoor Banner (6\u00D73 ft)", "Reception Sign (3\u00D72 ft)", "Door Plate (A4)", "Desk Name Plate"] },
  };

  const info = labels[type] || { title: "Assets", desc: "", sizes: [] };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setDone(true); }, 2500);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">{"\u2190"} Back to Brand Studio</button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{"\u2728"} {info.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{info.desc}</p>
      </div>

      {!done ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sizes to generate</h4>
            <div className="grid grid-cols-2 gap-2">
              {info.sizes.map(s => (
                <label key={s} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating {info.sizes.length} assets...</>
            ) : `${"\u2728"} Generate ${info.sizes.length} Assets`}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">{"\u2705"}</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{info.sizes.length} assets generated!</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {info.sizes.map(s => (
              <div key={s} className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700 flex items-center gap-2">
                <span>{"\u2713"}</span> {s}
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium">{"\uD83D\uDCE5"} Download All</button>
            <button onClick={onBack} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">Back to Studio</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandStudio() {
  const [view, setView] = useState<"hub" | "logo_maker" | string>("hub");
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? BRAND_ASSETS : BRAND_ASSETS.filter(a => a.type === filter);

  if (view === "logo_maker") return <LogoMaker onBack={() => setView("hub")} />;
  if (view !== "hub") return <AssetGenerator type={view} onBack={() => setView("hub")} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Studio</h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered brand identity workshop for your clinic</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { id: "logo_maker", icon: "\uD83C\uDFA8", label: "AI Logo Maker", desc: "Generate professional logos", color: "bg-purple-50 border-purple-200 hover:border-purple-400" },
          { id: "social_cover", icon: "\uD83D\uDCF1", label: "Social Media Kit", desc: "Covers & profile pics", color: "bg-blue-50 border-blue-200 hover:border-blue-400" },
          { id: "business_card", icon: "\uD83D\uDCB3", label: "Business Cards", desc: "Doctor & staff cards", color: "bg-amber-50 border-amber-200 hover:border-amber-400" },
          { id: "letterhead", icon: "\uD83D\uDCC4", label: "Stationery", desc: "Letterhead & prescriptions", color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400" },
        ].map(action => (
          <button key={action.id} onClick={() => setView(action.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${action.color}`}>
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-sm font-semibold text-gray-800">{action.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Current Brand Kit</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600" />
            <div className="w-8 h-8 rounded-full bg-emerald-900" />
            <span className="text-xs text-gray-500 ml-1">Colors</span>
          </div>
          <div className="text-sm text-gray-600"><span className="font-medium">Font:</span> Modern Sans</div>
          <div className="text-sm text-gray-600"><span className="font-medium">Tone:</span> Professional</div>
          <div className="text-sm text-gray-600"><span className="font-medium">Tagline:</span> &ldquo;Where compassion meets care&rdquo;</div>
          <button className="text-xs text-emerald-600 hover:underline ml-auto">Edit in Settings {"\u2192"}</button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Asset Library</h3>
        <div className="flex gap-1">
          {ASSET_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                filter === t.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(asset => (
          <div key={asset.id} onClick={() => asset.type !== "logo" ? setView(asset.type) : setView("logo_maker")}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all">
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              <AssetPreviewIcon preview={asset.preview} />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800 truncate">{asset.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  asset.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                  asset.status === "generated" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-500"
                }`}>{asset.status}</span>
                {asset.variants > 0 && <span className="text-xs text-gray-400">{asset.variants} variants</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
