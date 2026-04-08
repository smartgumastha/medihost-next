'use client';

import { useState } from 'react';
import { getAuthFromClient } from '@/lib/auth';
import { FeatureLockModal, LOCK_CONFIGS } from '@/components/dashboard/feature-lock-modal';

export default function GoogleBusinessPage() {
  var user = getAuthFromClient();
  var isGrowth = user?.plan_tier === 'growth' || user?.plan_tier === 'professional' || user?.plan_tier === 'enterprise';
  var [showLock, setShowLock] = useState(!isGrowth);

  if (showLock && !isGrowth) {
    return <FeatureLockModal feature="Google Business Manager" description="Sync hours, monitor reviews, and auto-post to your Google Business Profile." plans={LOCK_CONFIGS.hms_expired.plans} onClose={() => setShowLock(false)} />;
  }

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Google Business Manager</h2>
        <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>Growth</span>
      </div>

      {/* Connect */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 18, fontWeight: 700, color: '#0F6E56' }}>G</div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Connect your Google Business Profile</h3>
        <p style={{ fontSize: 11, color: '#78776F', margin: '6px 0 16px' }}>Sync opening hours, reply to reviews with AI, and post updates automatically.</p>
        <button style={{ fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: '#0F6E56', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer' }}>Connect Google Account</button>
      </div>

      {/* Mock dashboard */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Hours sync', value: 'Not connected' }, { label: 'Reviews', value: '0 monitored' }, { label: 'Posts', value: '0 published' }].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div style={{ fontSize: 10, color: '#78776F' }}>{s.label}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
