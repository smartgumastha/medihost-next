"use client";

import { useState, useMemo } from "react";

// ── Types ──
interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: string;
  owner: string;
  createdAt: string;
  lastActivity: string;
  notes: string;
}

const STAGES = [
  { id: "new", label: "New", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { id: "contacted", label: "Contacted", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  { id: "booked", label: "Booked", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { id: "follow_up", label: "Follow Up", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { id: "converted", label: "Converted", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { id: "lost", label: "Lost", color: "bg-red-100 text-red-700 border-red-300" },
];

const SOURCES = ["Google Ads", "Facebook", "Instagram", "WhatsApp", "Walk-in", "Referral", "Website"];

const DEMO_LEADS: Lead[] = [
  { id: "1", name: "Ramya Krishnan", phone: "+91 98765 00001", source: "Google Ads", stage: "new", owner: "Dr. Anil", createdAt: "2026-04-11T08:00", lastActivity: "2026-04-11T08:00", notes: "Searched for 'dermatologist near me'" },
  { id: "2", name: "Suresh Reddy", phone: "+91 98765 00002", source: "Facebook", stage: "new", owner: "Reception", createdAt: "2026-04-11T07:30", lastActivity: "2026-04-11T07:30", notes: "Clicked on skin care ad" },
  { id: "3", name: "Fatima Begum", phone: "+91 98765 00003", source: "WhatsApp", stage: "contacted", owner: "Dr. Priya", createdAt: "2026-04-10T14:00", lastActivity: "2026-04-10T16:00", notes: "Asked about pediatric consultation" },
  { id: "4", name: "Arun Sharma", phone: "+91 98765 00004", source: "Website", stage: "contacted", owner: "Reception", createdAt: "2026-04-10T10:00", lastActivity: "2026-04-10T11:30", notes: "Filled contact form for dental checkup" },
  { id: "5", name: "Priya Nair", phone: "+91 98765 00005", source: "Instagram", stage: "booked", owner: "Dr. Anil", createdAt: "2026-04-09T09:00", lastActivity: "2026-04-10T14:00", notes: "Appointment on April 14" },
  { id: "6", name: "Karthik Iyer", phone: "+91 98765 00006", source: "Referral", stage: "booked", owner: "Dr. Srinivas", createdAt: "2026-04-08T11:00", lastActivity: "2026-04-09T10:00", notes: "Referred by patient Lakshmi Devi" },
  { id: "7", name: "Deepa Gupta", phone: "+91 98765 00007", source: "Google Ads", stage: "follow_up", owner: "Reception", createdAt: "2026-04-06T15:00", lastActivity: "2026-04-08T09:00", notes: "Missed appointment, needs reschedule" },
  { id: "8", name: "Venkat Rao", phone: "+91 98765 00008", source: "Walk-in", stage: "converted", owner: "Dr. Priya", createdAt: "2026-04-05T10:00", lastActivity: "2026-04-10T12:00", notes: "Completed first consultation, follow-up in 2 weeks" },
  { id: "9", name: "Anjali Mehta", phone: "+91 98765 00009", source: "Facebook", stage: "converted", owner: "Dr. Anil", createdAt: "2026-04-04T08:00", lastActivity: "2026-04-09T16:00", notes: "Signed up for skin care package" },
  { id: "10", name: "Ravi Kumar", phone: "+91 98765 00010", source: "Google Ads", stage: "lost", owner: "Reception", createdAt: "2026-04-03T12:00", lastActivity: "2026-04-07T10:00", notes: "Chose competitor clinic \u2014 price concern" },
];

function isStale(lastActivity: string): boolean {
  const diffMs = Date.now() - new Date(lastActivity).getTime();
  return diffMs > 3 * 24 * 60 * 60 * 1000;
}

// ── Kanban Board ──
function KanbanBoard({ leads, onStageChange }: { leads: Lead[]; onStageChange: (id: string, stage: string) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.id);
        return (
          <div key={stage.id} className="flex-shrink-0 w-64">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stage.color}`}>
                {stage.label} ({stageLeads.length})
              </span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {stageLeads.map(lead => (
                <div key={lead.id} className={`p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow ${
                  isStale(lead.lastActivity) && stage.id !== "converted" && stage.id !== "lost" ? "border-red-300" : "border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{lead.name}</span>
                    {isStale(lead.lastActivity) && stage.id !== "converted" && stage.id !== "lost" && (
                      <span className="text-xs text-red-500" title="No activity for 3+ days">{"\u26A0\uFE0F"}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{lead.source} {"\u00B7"} {lead.owner}</div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{lead.notes}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100" title="WhatsApp">{"\uD83D\uDCAC"}</button>
                      <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Call">{"\uD83D\uDCDE"}</button>
                    </div>
                    <select value={lead.stage} onChange={e => onStageChange(lead.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white">
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {stageLeads.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-300 border border-dashed border-gray-200 rounded-lg">
                  No leads
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── List View ──
function LeadListView({ leads, onStageChange }: { leads: Lead[]; onStageChange: (id: string, stage: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-3 px-2 font-medium text-gray-600">Name</th>
            <th className="py-3 px-2 font-medium text-gray-600">Phone</th>
            <th className="py-3 px-2 font-medium text-gray-600">Source</th>
            <th className="py-3 px-2 font-medium text-gray-600">Stage</th>
            <th className="py-3 px-2 font-medium text-gray-600">Owner</th>
            <th className="py-3 px-2 font-medium text-gray-600">Last Activity</th>
            <th className="py-3 px-2 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const stale = isStale(lead.lastActivity) && lead.stage !== "converted" && lead.stage !== "lost";
            return (
              <tr key={lead.id} className={`border-b border-gray-100 ${stale ? "bg-red-50" : "hover:bg-gray-50"}`}>
                <td className="py-3 px-2">
                  <div className="font-medium text-gray-800">{lead.name}</div>
                  <div className="text-xs text-gray-400">{lead.notes}</div>
                </td>
                <td className="py-3 px-2 text-gray-600">{lead.phone}</td>
                <td className="py-3 px-2"><span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{lead.source}</span></td>
                <td className="py-3 px-2">
                  <select value={lead.stage} onChange={e => onStageChange(lead.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2 text-gray-600 text-xs">{lead.owner}</td>
                <td className="py-3 px-2 text-xs text-gray-400">
                  {new Date(lead.lastActivity).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {stale && <span className="ml-1 text-red-500">{"\u26A0\uFE0F"} stale</span>}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-1">
                    <button className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">{"\uD83D\uDCAC"}</button>
                    <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">{"\uD83D\uDCDE"}</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ──
export function LeadPipeline() {
  const [view, setView] = useState<"board" | "list">("board");
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);

  const owners = useMemo(() => [...new Set(leads.map(l => l.owner))], [leads]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (sourceFilter && l.source !== sourceFilter) return false;
      if (ownerFilter && l.owner !== ownerFilter) return false;
      return true;
    });
  }, [leads, sourceFilter, ownerFilter]);

  const handleStageChange = (id: string, stage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage, lastActivity: new Date().toISOString() } : l));
  };

  const stats = {
    total: leads.length,
    converted: leads.filter(l => l.stage === "converted").length,
    stale: leads.filter(l => isStale(l.lastActivity) && l.stage !== "converted" && l.stage !== "lost").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Track & convert patient inquiries into appointments</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{stats.total} leads</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">{stats.converted} converted</span>
          {stats.stale > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">{"\u26A0\uFE0F"} {stats.stale} stale</span>
          )}
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select value={sourceFilter || ""} onChange={e => setSourceFilter(e.target.value || null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={ownerFilter || ""} onChange={e => setOwnerFilter(e.target.value || null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <option value="">All Owners</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {(sourceFilter || ownerFilter) && (
            <button onClick={() => { setSourceFilter(null); setOwnerFilter(null); }}
              className="text-xs text-gray-400 hover:text-gray-600">{"\u2715"} Clear</button>
          )}
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setView("board")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === "board" ? "bg-white shadow-sm text-gray-700" : "text-gray-500"}`}>
            {"\uD83D\uDCCB"} Board
          </button>
          <button onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === "list" ? "bg-white shadow-sm text-gray-700" : "text-gray-500"}`}>
            {"\uD83D\uDCC4"} List
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "board" ? (
        <KanbanBoard leads={filtered} onStageChange={handleStageChange} />
      ) : (
        <LeadListView leads={filtered} onStageChange={handleStageChange} />
      )}
    </div>
  );
}
