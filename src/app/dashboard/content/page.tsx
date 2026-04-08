'use client';

import { useState } from 'react';
import { getAuthFromClient } from '@/lib/auth';
import { FeatureLockModal, LOCK_CONFIGS } from '@/components/dashboard/feature-lock-modal';

var MOCK_POSTS = [
  { id: 1, title: '5 Tips for Better Dental Hygiene', type: 'Health tip', date: 'Mon, Apr 14', status: 'Draft' },
  { id: 2, title: 'When Should You Visit a Doctor?', type: 'Awareness post', date: 'Wed, Apr 16', status: 'Scheduled' },
  { id: 3, title: 'Benefits of Regular Health Checkups', type: 'Educational', date: 'Fri, Apr 18', status: 'Published' },
];

var STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Draft: { bg: '#F1EFE8', color: '#5F5E5A' },
  Scheduled: { bg: '#FAEEDA', color: '#854F0B' },
  Published: { bg: '#E1F5EE', color: '#0F6E56' },
};

export default function ContentPage() {
  var [tab, setTab] = useState<'generated' | 'scheduled' | 'published'>('generated');
  var user = getAuthFromClient();
  var isGrowth = user?.plan_tier === 'growth' || user?.plan_tier === 'professional' || user?.plan_tier === 'enterprise';
  var [showLock, setShowLock] = useState(!isGrowth);

  if (showLock && !isGrowth) {
    return <FeatureLockModal feature="AI Content Studio" description="AI generates 3 health posts per week tailored to your specialty. Engage patients with zero effort." plans={LOCK_CONFIGS.hms_expired.plans} onClose={() => setShowLock(false)} />;
  }

  return (
    <div style={{ maxWidth: 700 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>AI Content Studio</h2>
        <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>Powered by AI</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ backgroundColor: '#F6F6F4', borderRadius: 8, padding: 3 }}>
        {(['generated', 'scheduled', 'published'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, fontSize: 11, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#0F6E56' : '#78776F', backgroundColor: tab === t ? '#fff' : 'transparent', padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-3">
        {MOCK_POSTS.map(post => {
          var s = STATUS_STYLES[post.status] || STATUS_STYLES.Draft;
          return (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
              <div style={{ width: 80, height: 60, backgroundColor: '#F6F6F4', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#A1A09E' }}>Image</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{post.title}</div>
                <div style={{ fontSize: 10, color: '#78776F', marginTop: 2 }}>{post.type} &middot; {post.date}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span style={{ fontSize: 8, fontWeight: 600, backgroundColor: s.bg, color: s.color, padding: '2px 6px', borderRadius: 4 }}>{post.status}</span>
                  <button style={{ fontSize: 10, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button style={{ fontSize: 10, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer' }}>Approve</button>
                  <button style={{ fontSize: 10, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer' }}>Schedule</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: '#F6F6F4', borderRadius: 8, padding: 12 }}>
        <p style={{ fontSize: 11, color: '#5F5E5A' }}>AI generates content every Monday. Next batch: Monday, Apr 14, 2026</p>
      </div>
    </div>
  );
}
