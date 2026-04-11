"use client";

import { useState, useEffect, useCallback } from 'react';
import { getTokenFromClient } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────

interface Campaign {
  id: string;
  segment: string;
  subject: string;
  coupon_code: string | null;
  sent_count: number;
  failed_count: number;
  sent_by: string;
  sent_at: number;
}

// ── Constants ──────────────────────────────────────────────

const SEGMENT_META: Record<string, { label: string; description: string; color: string }> = {
  all: { label: 'All Partners', description: 'Every registered partner', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expired Trials', description: 'Trial ended, not subscribed', color: 'bg-red-50 text-red-700' },
  trial: { label: 'Active Trials', description: 'Currently in trial period', color: 'bg-amber-50 text-amber-700' },
  active: { label: 'Paid Active', description: 'Paying subscribers', color: 'bg-emerald-50 text-emerald-700' },
  never_logged_in: { label: 'Never Logged In', description: 'Signed up but never used', color: 'bg-blue-50 text-blue-700' },
  payment_failed: { label: 'Payment Failed', description: 'Recent payment failures', color: 'bg-red-50 text-red-700' },
  growth: { label: 'Growth Tier', description: 'Growth plan subscribers', color: 'bg-blue-50 text-blue-700' },
  professional: { label: 'Professional Tier', description: 'Professional plan subscribers', color: 'bg-purple-50 text-purple-700' },
  enterprise: { label: 'Enterprise Tier', description: 'Enterprise plan subscribers', color: 'bg-amber-50 text-amber-700' },
};

// ── Helpers ───────────────────────────────────────────────��

function authHeaders(): Record<string, string> {
  const token = getTokenFromClient();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function jsonHeaders(): Record<string, string> {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function formatDate(ts: number | null): string {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────

export function CampaignEngine() {
  const [segments, setSegments] = useState<Record<string, number>>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Composer state
  const [selectedSegment, setSelectedSegment] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const loadData = useCallback(async () => {
    try {
      const [segRes, histRes] = await Promise.all([
        fetch('/api/admin/campaigns/segments', { headers: authHeaders() }),
        fetch('/api/admin/campaigns/history', { headers: authHeaders() }),
      ]);
      const segData = await segRes.json();
      const histData = await histRes.json();
      if (segData.segments) setSegments(segData.segments);
      if (histData.campaigns) setCampaigns(histData.campaigns);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSend() {
    if (!selectedSegment || !subject.trim()) {
      showToast('Select a segment and enter a subject');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          segment: selectedSegment,
          subject: subject.trim(),
          body_html: bodyHtml || '<p style="font-size:15px;color:#374151">' + subject + '</p>',
          coupon_code: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Campaign sent! ${data.sent_count} delivered, ${data.failed_count} failed`);
        setSubject('');
        setBodyHtml('');
        setCouponCode('');
        setSelectedSegment('');
        loadData();
      } else {
        showToast('Error: ' + (data.error || 'Send failed'));
      }
    } catch {
      showToast('Network error');
    } finally {
      setSending(false);
    }
  }

  const totalPartners = segments.all || 0;
  const segmentCount = selectedSegment ? (segments[selectedSegment] || 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaign Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Send targeted emails and track campaign performance</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Partners" value={String(totalPartners)} border="border-t-emerald-500" />
          {/* TODO: Replace with real analytics when email tracking is added */}
          <StatCard label="Campaigns Sent" value={String(campaigns.length)} border="border-t-blue-500" />
          <StatCard label="Expired Trials" value={String(segments.expired || 0)} border="border-t-red-500" />
          <StatCard label="Active Subscribers" value={String(segments.active || 0)} border="border-t-purple-500" />
        </div>
      )}

      {/* Send New Campaign */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-gray-800">Send New Campaign</h2>

        {/* Segment Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Select Audience</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(SEGMENT_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedSegment(key)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedSegment === key
                    ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-semibold text-gray-900">{meta.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{meta.description}</div>
                <div className="mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}>
                    {segments[key] ?? '...'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. We miss you! Here's 50% off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Body HTML <span className="text-gray-400">(supports {'{name}'}, {'{business_name}'})</span>
              </label>
              <textarea
                value={bodyHtml}
                onChange={e => setBodyHtml(e.target.value)}
                rows={6}
                placeholder='<p style="font-size:15px;color:#374151">Hi {name}, ...</p>'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Coupon Code (optional)</label>
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="COMEBACK50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Preview</label>
              <button onClick={() => setShowPreview(!showPreview)} className="text-[10px] text-purple-600 font-semibold">
                {showPreview ? 'Hide' : 'Show'} preview
              </button>
            </div>
            {showPreview && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 text-sm">
                {/* Email header mock */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <span className="text-lg font-extrabold text-gray-900">Medi<span className="text-emerald-600">Host</span></span>
                  <span className="text-[8px] text-gray-400 align-super">&trade;</span>
                </div>
                <div className="px-4 py-4 bg-white">
                  {bodyHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                  ) : (
                    <p className="text-gray-400 text-xs">Email body will appear here...</p>
                  )}
                  {couponCode && (
                    <div className="mt-4 p-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg text-center">
                      <div className="text-[10px] text-emerald-700">Use coupon code</div>
                      <div className="text-xl font-extrabold text-emerald-700 tracking-wider">{couponCode}</div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-400">
                  MediHost&trade; by SmartGumastha Technologies
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={sending || !selectedSegment || !subject.trim()}
            className="px-6 py-2.5 text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#534AB7' }}
          >
            {sending ? 'Sending...' : `Send to ${segmentCount} partner${segmentCount !== 1 ? 's' : ''}`}
          </button>
          {selectedSegment && (
            <span className="text-xs text-gray-500">
              Segment: <span className="font-semibold">{SEGMENT_META[selectedSegment]?.label}</span>
            </span>
          )}
        </div>
      </div>

      {/* Campaign History */}
      <div>
        <h2 className="text-sm font-bold text-gray-800 mb-3">Campaign History</h2>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : campaigns.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Segment</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Sent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Failed</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => {
                    const meta = SEGMENT_META[c.segment];
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 text-sm">{c.subject}</div>
                          {c.coupon_code && <div className="text-[10px] text-purple-600 font-mono mt-0.5">Coupon: {c.coupon_code}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta?.color || 'bg-gray-100 text-gray-700'}`}>
                            {meta?.label || c.segment}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">{c.sent_count}</td>
                        <td className="py-3 px-4 text-red-500 font-medium">{c.failed_count || 0}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(c.sent_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No campaigns sent yet</p>
          </div>
        )}
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

function StatCard({ label, value, border }: { label: string; value: string; border: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-[3px] ${border} p-4 shadow-sm`}>
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
