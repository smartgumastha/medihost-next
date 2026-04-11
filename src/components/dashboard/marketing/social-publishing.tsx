"use client";

import { useState, useCallback } from "react";

// ── Types ──
interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  selected: boolean;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string;
  status: "scheduled" | "published" | "failed";
  media?: string;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "\uD83D\uDCF8", color: "bg-pink-100 text-pink-700" },
  { id: "facebook", name: "Facebook", icon: "\uD83D\uDCD8", color: "bg-blue-100 text-blue-700" },
  { id: "google", name: "Google Business", icon: "\uD83D\uDD0D", color: "bg-amber-100 text-amber-700" },
  { id: "whatsapp", name: "WhatsApp Status", icon: "\uD83D\uDCAC", color: "bg-green-100 text-green-700" },
];

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" }, { code: "ta", label: "Tamil" },
  { code: "bn", label: "Bengali" }, { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" }, { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" }, { code: "ur", label: "Urdu" },
];

const DEMO_MEDIA: MediaItem[] = [
  { id: "1", url: "", type: "image", name: "clinic-front.jpg", selected: false },
  { id: "2", url: "", type: "image", name: "doctor-consultation.jpg", selected: false },
  { id: "3", url: "", type: "image", name: "lab-equipment.jpg", selected: false },
  { id: "4", url: "", type: "video", name: "patient-testimonial.mp4", selected: false },
];

const DEMO_POSTS: ScheduledPost[] = [
  { id: "1", content: "\uD83C\uDFE5 World Health Day Special \u2014 Free BP & Sugar checkup this Saturday! Walk-in between 9 AM - 1 PM. No appointment needed.", platforms: ["instagram", "facebook", "google"], scheduledAt: "2026-04-12T09:00", status: "scheduled", media: "clinic-front.jpg" },
  { id: "2", content: "Did you know? Regular health checkups can detect 80% of chronic diseases early. Book your annual checkup today! \uD83D\uDCDE", platforms: ["facebook", "whatsapp"], scheduledAt: "2026-04-10T10:00", status: "published" },
];

// ── Tab: Media Gallery ──
function MediaGallery({ media, onChange }: { media: MediaItem[]; onChange: (m: MediaItem[]) => void }) {
  const toggleSelect = (id: string) => {
    onChange(media.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
        <div className="text-2xl mb-1">{"\uD83D\uDCC1"}</div>
        <p className="text-sm text-gray-600 font-medium">Drag & drop media or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 up to 25MB</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map(m => (
          <div key={m.id} onClick={() => toggleSelect(m.id)}
            className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
              m.selected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
            }`}>
            <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2">
              <span className="text-3xl">{m.type === "video" ? "\uD83C\uDFAC" : "\uD83D\uDDBC\uFE0F"}</span>
            </div>
            <p className="text-xs text-gray-600 truncate">{m.name}</p>
            {m.selected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">{"\u2713"}</div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">{media.filter(m => m.selected).length} selected &mdash; selected media will be attached to your next post</p>
    </div>
  );
}

// ── Tab: Compose ──
function ComposeTab() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [language, setLanguage] = useState("en");
  const [generating, setGenerating] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const generateCaption = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const captions: Record<string, string> = {
        en: "\uD83C\uDFE5 Your health is your greatest asset! Visit us for a comprehensive health checkup. Early detection saves lives. Book your appointment today!\n\n#HealthFirst #ClinicCare #PreventiveMedicine",
        hi: "\uD83C\uDFE5 \u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0906\u092A\u0915\u0940 \u0938\u092C\u0938\u0947 \u092C\u0921\u093C\u0940 \u0938\u0902\u092A\u0924\u094D\u0924\u093F \u0939\u0948! \u0935\u094D\u092F\u093E\u092A\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u091C\u093E\u0902\u091A \u0915\u0947 \u0932\u093F\u090F \u0939\u092E\u0938\u0947 \u092E\u093F\u0932\u0947\u0902\u0964 \u091C\u0932\u094D\u0926\u0940 \u092A\u0939\u091A\u093E\u0928 \u091C\u0940\u0935\u0928 \u092C\u091A\u093E\u0924\u0940 \u0939\u0948\u0964\n\n#\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F\u092A\u0939\u0932\u0947 #\u0915\u094D\u0932\u093F\u0928\u093F\u0915\u0915\u0947\u092F\u0930",
        te: "\uD83C\uDFE5 \u0C2E\u0C40 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C02 \u0C2E\u0C40 \u0C17\u0C4A\u0C2A\u0C4D\u0C2A \u0C38\u0C02\u0C2A\u0C26! \u0C38\u0C2E\u0C17\u0C4D\u0C30 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F \u0C2A\u0C30\u0C40\u0C15\u0C4D\u0C37 \u0C15\u0C4B\u0C38\u0C02 \u0C2E\u0C2E\u0C4D\u0C2E\u0C32\u0C4D\u0C28\u0C3F \u0C38\u0C02\u0C26\u0C30\u0C4D\u0C36\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F.\n\n#\u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C02\u0C2E\u0C41\u0C02\u0C26\u0C41 #\u0C15\u0C4D\u0C32\u0C3F\u0C28\u0C3F\u0C15\u0C4D\u200C\u0C15\u0C47\u0C30\u0C4D",
      };
      setContent(captions[language] || captions.en);
      setGenerating(false);
    }, 1500);
  }, [language]);

  return (
    <div className="space-y-5">
      {/* Platform toggles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Publish to</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border transition-all ${
                selectedPlatforms.includes(p.id)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              <span>{p.icon}</span> {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Language + AI */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <button onClick={generateCaption} disabled={generating}
          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap">
          <span>{"\u2728"}</span> {generating ? "Writing..." : "AI Write Caption"}
        </button>
      </div>

      {/* Content area */}
      <div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
          placeholder="Write your post caption..." />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{content.length} characters</span>
          <span className={`text-xs ${content.length > 2200 ? "text-red-500" : "text-gray-400"}`}>
            {content.length > 2200 ? "Over Instagram limit" : "Instagram limit: 2,200"}
          </span>
        </div>
      </div>

      {/* Schedule */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
          <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          Schedule Post
        </button>
        <button className="px-5 py-2 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50">
          Post Now
        </button>
      </div>
    </div>
  );
}

// ── Tab: Preview ──
function PreviewTab() {
  const [platform, setPlatform] = useState("instagram");
  const previewContent = "\uD83C\uDFE5 Your health is your greatest asset! Visit us for a comprehensive health checkup. Book today!";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              platform === p.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        {platform === "instagram" && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold">your_clinic</span>
            </div>
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">{"\uD83D\uDDBC\uFE0F"}</span>
            </div>
            <div className="p-3">
              <div className="flex gap-3 mb-2 text-lg">{"\u2764\uFE0F"} {"\uD83D\uDCAC"} {"\uD83D\uDCE4"}</div>
              <p className="text-sm"><span className="font-semibold">your_clinic</span> {previewContent}</p>
            </div>
          </div>
        )}
        {platform === "facebook" && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3">
              <div className="w-10 h-10 rounded-full bg-blue-500" />
              <div>
                <div className="text-sm font-semibold">Your Clinic</div>
                <div className="text-xs text-gray-400">Just now &middot; {"\uD83C\uDF10"}</div>
              </div>
            </div>
            <div className="px-3 pb-2 text-sm">{previewContent}</div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">{"\uD83D\uDDBC\uFE0F"}</span>
            </div>
            <div className="flex border-t border-gray-200 text-sm text-gray-500">
              <button className="flex-1 py-2 text-center hover:bg-gray-50">{"\uD83D\uDC4D"} Like</button>
              <button className="flex-1 py-2 text-center hover:bg-gray-50">{"\uD83D\uDCAC"} Comment</button>
              <button className="flex-1 py-2 text-center hover:bg-gray-50">{"\u2197\uFE0F"} Share</button>
            </div>
          </div>
        )}
        {platform === "google" && (
          <div className="border border-gray-200 rounded-lg overflow-hidden p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">G</div>
              <div>
                <div className="text-sm font-semibold">Your Clinic</div>
                <div className="text-xs text-gray-400">Google Business Post</div>
              </div>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-4xl">{"\uD83D\uDDBC\uFE0F"}</span>
            </div>
            <p className="text-sm">{previewContent}</p>
            <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded text-sm">Learn more</button>
          </div>
        )}
        {platform === "whatsapp" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden">
            <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-2">
              <span className="text-lg">{"\u2190"}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold">Status</span>
            </div>
            <div className="p-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                  <span className="text-3xl">{"\uD83D\uDDBC\uFE0F"}</span>
                </div>
                <p className="text-sm">{previewContent}</p>
              </div>
              <div className="text-xs text-gray-400 mt-2 text-right">Today, 10:00 AM</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Queue ──
function QueueTab({ posts }: { posts: ScheduledPost[] }) {
  return (
    <div className="space-y-3">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">{"\uD83D\uDCED"}</div>
          <p className="text-sm">No scheduled posts yet. Create one in the Compose tab!</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300">
            {post.media && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{"\uD83D\uDDBC\uFE0F"}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {post.platforms.map(pid => {
                  const p = PLATFORMS.find(pl => pl.id === pid);
                  return p ? <span key={pid} className={`text-xs px-2 py-0.5 rounded-full ${p.color}`}>{p.icon} {p.name}</span> : null;
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {post.status === "published" ? "\u2705 Published" : post.status === "failed" ? "\u274C Failed" : "\uD83D\uDD50 Scheduled"} &middot; {new Date(post.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded" title="Edit">{"\u270F\uFE0F"}</button>
              <button className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete">{"\uD83D\uDDD1\uFE0F"}</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main Component ──
export function SocialPublishing() {
  const [tab, setTab] = useState<"media" | "compose" | "preview" | "queue">("compose");
  const [media, setMedia] = useState<MediaItem[]>(DEMO_MEDIA);

  const tabs = [
    { id: "media" as const, label: "Media Gallery", icon: "\uD83D\uDCC1" },
    { id: "compose" as const, label: "Compose", icon: "\u270D\uFE0F" },
    { id: "preview" as const, label: "Preview", icon: "\uD83D\uDC41\uFE0F" },
    { id: "queue" as const, label: "Queue", icon: "\uD83D\uDCCB" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Studio</h2>
          <p className="text-sm text-gray-500 mt-1">Create, preview & schedule posts across all platforms</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-gray-500">2 channels connected</span>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <span className="mr-1.5">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {tab === "media" && <MediaGallery media={media} onChange={setMedia} />}
        {tab === "compose" && <ComposeTab />}
        {tab === "preview" && <PreviewTab />}
        {tab === "queue" && <QueueTab posts={DEMO_POSTS} />}
      </div>
    </div>
  );
}
