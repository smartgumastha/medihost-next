"use client";

import { useState, useMemo } from "react";

// ── Types ──
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "health_day" | "festival" | "ai_theme" | "recurring";
  description: string;
  platforms: string[];
  status: "draft" | "scheduled" | "published";
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  health_day: { label: "Health Day", color: "text-blue-700", bg: "bg-blue-100" },
  festival: { label: "Festival", color: "text-orange-700", bg: "bg-orange-100" },
  ai_theme: { label: "AI Theme", color: "text-purple-700", bg: "bg-purple-100" },
  recurring: { label: "Recurring", color: "text-emerald-700", bg: "bg-emerald-100" },
};

const DEMO_EVENTS: CalendarEvent[] = [
  { id: "1", title: "World Health Day", date: "2026-04-07", type: "health_day", description: "Post about preventive healthcare importance", platforms: ["instagram", "facebook", "google"], status: "published" },
  { id: "2", title: "World Hemophilia Day", date: "2026-04-17", type: "health_day", description: "Awareness post about bleeding disorders", platforms: ["facebook", "google"], status: "scheduled" },
  { id: "3", title: "World Malaria Day", date: "2026-04-25", type: "health_day", description: "Malaria prevention tips for patients", platforms: ["instagram", "whatsapp"], status: "draft" },
  { id: "4", title: "World Immunization Week", date: "2026-04-24", type: "health_day", description: "Vaccination awareness campaign", platforms: ["instagram", "facebook"], status: "scheduled" },
  { id: "5", title: "Ugadi / Gudi Padwa", date: "2026-04-14", type: "festival", description: "Festival greetings with health tips for the new year", platforms: ["instagram", "facebook", "whatsapp"], status: "scheduled" },
  { id: "6", title: "Ram Navami", date: "2026-04-06", type: "festival", description: "Festival greetings post", platforms: ["facebook", "whatsapp"], status: "published" },
  { id: "7", title: "Eid ul-Fitr", date: "2026-04-21", type: "festival", description: "Eid greetings with post-Ramadan health tips", platforms: ["instagram", "facebook", "whatsapp"], status: "draft" },
  { id: "8", title: "Baisakhi", date: "2026-04-13", type: "festival", description: "Festival greetings for Punjabi new year", platforms: ["facebook"], status: "scheduled" },
  { id: "9", title: "Summer Hydration Series", date: "2026-04-15", type: "ai_theme", description: "AI-generated content about staying hydrated in summer heat", platforms: ["instagram", "google"], status: "draft" },
  { id: "10", title: "Diabetes Awareness Month", date: "2026-04-01", type: "ai_theme", description: "Month-long diabetes education campaign", platforms: ["instagram", "facebook", "google"], status: "scheduled" },
  { id: "11", title: "Weekly Health Tip", date: "2026-04-07", type: "recurring", description: "Monday health tip post", platforms: ["whatsapp"], status: "published" },
  { id: "12", title: "Weekly Health Tip", date: "2026-04-14", type: "recurring", description: "Monday health tip post", platforms: ["whatsapp"], status: "scheduled" },
  { id: "13", title: "Weekly Health Tip", date: "2026-04-21", type: "recurring", description: "Monday health tip post", platforms: ["whatsapp"], status: "draft" },
  { id: "14", title: "World Veterinary Day", date: "2026-04-25", type: "health_day", description: "One Health approach awareness", platforms: ["facebook"], status: "draft" },
  { id: "15", title: "DNA Day", date: "2026-04-25", type: "health_day", description: "Genetic testing awareness post", platforms: ["instagram", "facebook"], status: "draft" },
];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "\uD83D\uDCF8",
  facebook: "\uD83D\uDCD8",
  google: "\uD83D\uDD0D",
  whatsapp: "\uD83D\uDCAC",
};

// ── Calendar Grid ──
function CalendarGrid({ year, month, events, onSelectDate }: { year: number; month: number; events: CalendarEvent[]; onSelectDate: (date: string) => void }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
        <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">{d}</div>
      ))}
      {cells.map((day, i) => {
        if (day === null) return <div key={`e${i}`} className="bg-white p-1 min-h-[80px]" />;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;

        return (
          <div key={dateStr} onClick={() => dayEvents.length > 0 && onSelectDate(dateStr)}
            className={`bg-white p-1 min-h-[80px] hover:bg-gray-50 ${dayEvents.length > 0 ? "cursor-pointer" : ""}`}>
            <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
              isToday ? "bg-emerald-600 text-white" : "text-gray-600"
            }`}>
              {day}
            </div>
            <div className="space-y-0.5">
              {dayEvents.slice(0, 3).map(ev => (
                <div key={ev.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${TYPE_META[ev.type].bg} ${TYPE_META[ev.type].color}`}>
                  {ev.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-gray-400">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── List View ──
function ListView({ events }: { events: CalendarEvent[] }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-2">
      {sorted.map(ev => (
        <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300">
          <div className="text-center flex-shrink-0 w-12">
            <div className="text-lg font-bold text-gray-700">{new Date(ev.date + "T00:00").getDate()}</div>
            <div className="text-xs text-gray-400">{new Date(ev.date + "T00:00").toLocaleDateString("en-IN", { month: "short" })}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800 truncate">{ev.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_META[ev.type].bg} ${TYPE_META[ev.type].color}`}>
                {TYPE_META[ev.type].label}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{ev.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex gap-0.5">
              {ev.platforms.map(p => (
                <span key={p} className="text-xs" title={p}>{PLATFORM_ICONS[p] || p}</span>
              ))}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              ev.status === "published" ? "bg-emerald-100 text-emerald-700" :
              ev.status === "scheduled" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {ev.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Day Detail Sidebar ──
function DayDetail({ date, events, onClose }: { date: string; events: CalendarEvent[]; onClose: () => void }) {
  const dayEvents = events.filter(e => e.date === date);
  const dateObj = new Date(date + "T00:00");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">{"\u2715"}</button>
        </div>
        <div className="space-y-3">
          {dayEvents.map(ev => (
            <div key={ev.id} className={`p-4 rounded-lg border ${TYPE_META[ev.type].bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_META[ev.type].bg} ${TYPE_META[ev.type].color}`}>
                  {TYPE_META[ev.type].label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  ev.status === "published" ? "bg-emerald-100 text-emerald-700" :
                  ev.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{ev.status}</span>
              </div>
              <h4 className="font-semibold text-sm text-gray-800">{ev.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{ev.description}</p>
              <div className="flex gap-1 mt-2">
                {ev.platforms.map(p => (
                  <span key={p} className="text-sm" title={p}>{PLATFORM_ICONS[p] || p}</span>
                ))}
              </div>
              {ev.status === "draft" && (
                <button className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  {"\u2728"} AI Generate Content
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export function ContentCalendar() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [month, setMonth] = useState(3); // April = 3 (0-indexed)
  const [year, setYear] = useState(2026);

  const filtered = useMemo(() => {
    return typeFilter ? DEMO_EVENTS.filter(e => e.type === typeFilter) : DEMO_EVENTS;
  }, [typeFilter]);

  const monthLabel = new Date(year, month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">Plan & schedule your marketing content</p>
        </div>
        <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 flex items-center gap-1.5">
          <span>{"\u2728"}</span> AI Plan Month
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">{"\u2190"}</button>
          <span className="text-lg font-semibold text-gray-800 w-48 text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">{"\u2192"}</button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filters */}
          <div className="flex gap-1">
            <button onClick={() => setTypeFilter(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${!typeFilter ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              All
            </button>
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <button key={key} onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeFilter === key ? `${meta.bg} ${meta.color} ring-2 ring-offset-1` : `${meta.bg} ${meta.color} hover:opacity-80`}`}>
                {meta.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
            <button onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === "calendar" ? "bg-white shadow-sm text-gray-700" : "text-gray-500"}`}>
              {"\uD83D\uDCC5"} Calendar
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === "list" ? "bg-white shadow-sm text-gray-700" : "text-gray-500"}`}>
              {"\uD83D\uDCCB"} List
            </button>
          </div>
        </div>
      </div>

      {/* Calendar or List */}
      {view === "calendar" ? (
        <CalendarGrid year={year} month={month} events={filtered} onSelectDate={setSelectedDate} />
      ) : (
        <ListView events={filtered} />
      )}

      {/* Day detail sidebar */}
      {selectedDate && (
        <DayDetail date={selectedDate} events={filtered} onClose={() => setSelectedDate(null)} />
      )}

      {/* Stats footer */}
      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <span>{filtered.length} events this month</span>
        <div className="flex gap-4">
          <span className="text-emerald-600">{"\u2705"} {filtered.filter(e => e.status === "published").length} published</span>
          <span className="text-blue-600">{"\uD83D\uDD50"} {filtered.filter(e => e.status === "scheduled").length} scheduled</span>
          <span className="text-gray-500">{"\uD83D\uDCDD"} {filtered.filter(e => e.status === "draft").length} drafts</span>
        </div>
      </div>
    </div>
  );
}
