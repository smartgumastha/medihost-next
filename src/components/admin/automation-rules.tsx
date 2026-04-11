"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface TriggerInfo {
  name: string;
  description: string;
  type: string;
  schedule: string;
  sent_count: number;
  last_sent: number | null;
  active: boolean;
}

// ── Hardcoded trigger definitions ──────────────────────────

const TRIGGER_DEFS = [
  { name: 'Welcome email', description: 'Sent immediately after signup', type: 'welcome', schedule: 'On signup' },
  { name: 'Welcome \u2014 day 3', description: '3 tips to get started (website, doctors, booking)', type: 'welcome_day3', schedule: 'Daily 10:30 AM IST' },
  { name: 'Welcome \u2014 day 7', description: 'Website setup reminder with social proof', type: 'welcome_day7', schedule: 'Daily 11:00 AM IST' },
  { name: 'Trial expiring \u2014 5 days', description: 'Upgrade reminder 5 days before trial ends', type: 'trial_expiring', schedule: 'Daily 9:00 AM IST' },
  { name: 'Trial expiring \u2014 3 days', description: 'Urgent upgrade reminder', type: 'trial_expiring', schedule: 'Daily 9:00 AM IST' },
  { name: 'Trial expiring \u2014 1 day', description: 'Final day warning', type: 'trial_expiring', schedule: 'Daily 9:00 AM IST' },
  { name: 'Expired \u2014 win-back', description: 'COMEBACK50 coupon, 50% off first month', type: 'winback', schedule: 'Daily 9:30 AM IST' },
  { name: 'Payment failed', description: 'Retry payment reminder', type: 'payment_failed', schedule: 'Daily 11:30 AM IST' },
  { name: 'Nudge \u2014 6h no login', description: 'Quick setup prompt 6 hours after signup', type: 'nudge_6h', schedule: 'Every 30 min' },
  { name: 'Nudge \u2014 24h no login', description: 'Reminder email 24 hours after signup', type: 'nudge_24h', schedule: 'Every 30 min' },
];

// ── Helpers ────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function formatDate(ts: number | null): string {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function AutomationRules() {
  const [triggers, setTriggers] = useState<TriggerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/campaigns/trigger-status', { headers: authHeaders() });
      const data = await res.json();

      // Merge API data with hardcoded defs
      const countMap: Record<string, number> = {};
      const lastSentMap: Record<string, number | null> = {};
      if (data.triggers) {
        for (const t of data.triggers) {
          countMap[t.type] = (countMap[t.type] || 0) + (t.sent_count || 0);
          if (t.last_sent && (!lastSentMap[t.type] || t.last_sent > (lastSentMap[t.type] || 0))) {
            lastSentMap[t.type] = t.last_sent;
          }
        }
      }

      setTriggers(TRIGGER_DEFS.map(def => ({
        ...def,
        sent_count: countMap[def.type] || 0,
        last_sent: lastSentMap[def.type] || null,
        active: true, // TODO: Make configurable when trigger_config table is added
      })));
    } catch {
      setError('Failed to load trigger data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Automation Rules</h1>
        <p className="text-sm text-gray-500 mt-1">Automated email triggers running on your backend cron jobs</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={load} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {triggers.map((trigger, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 px-5 py-4 ${idx < triggers.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Toggle */}
              <button
                className={`relative shrink-0 inline-flex h-5 w-9 rounded-full transition-colors ${
                  trigger.active ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
                title="TODO: Toggle will be functional when trigger_config table is added"
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                  trigger.active ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                }`} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{trigger.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{trigger.type}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{trigger.description}</div>
              </div>

              {/* Schedule */}
              <div className="hidden sm:block text-xs text-gray-400 font-medium shrink-0 w-36 text-right">
                {trigger.schedule}
              </div>

              {/* Sent count */}
              <div className="shrink-0 text-right">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                  {trigger.sent_count} sent
                </span>
                {trigger.last_sent && (
                  <div className="text-[10px] text-gray-400 mt-1">Last: {formatDate(trigger.last_sent)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-xs text-purple-700">
          <strong>Note:</strong> Toggle switches are visual-only for now. All triggers are active by default. On/off control will be added when the trigger_config database table is implemented.
        </p>
      </div>
    </div>
  );
}
