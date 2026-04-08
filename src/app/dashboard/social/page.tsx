'use client';

import { useState } from 'react';
import { getAuthFromClient } from '@/lib/auth';
import { FeatureLockModal, LOCK_CONFIGS } from '@/components/dashboard/feature-lock-modal';

var PLATFORMS = [
  { name: 'Instagram', icon: 'I', bg: '#FAEEDA', color: '#854F0B' },
  { name: 'Facebook', icon: 'F', bg: '#E6F1FB', color: '#185FA5' },
  { name: 'Google Business', icon: 'G', bg: '#E1F5EE', color: '#0F6E56' },
];

export default function SocialPage() {
  var user = getAuthFromClient();
  var isGrowth = user?.plan_tier === 'growth' || user?.plan_tier === 'professional' || user?.plan_tier === 'enterprise';
  var [showLock, setShowLock] = useState(!isGrowth);

  if (showLock && !isGrowth) {
    return <FeatureLockModal feature="Social Autopilot" description="Auto-post AI-generated content to Instagram, Facebook, and Google Business." plans={LOCK_CONFIGS.hms_expired.plans} onClose={() => setShowLock(false)} />;
  }

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Social Autopilot</h2>
        <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>Growth</span>
      </div>

      {/* Connect accounts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Connect accounts</h3>
        <p style={{ fontSize: 11, color: '#A1A09E', marginBottom: 12 }}>Connected: 0 accounts</p>
        <div className="space-y-2">
          {PLATFORMS.map(p => (
            <div key={p.name} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.5px solid #E5E5E3' }}>
              <div className="flex items-center gap-3">
                <span style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: p.bg, color: p.color, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.icon}</span>
                <span style={{ fontSize: 12, color: '#1A1A1A' }}>{p.name}</span>
              </div>
              <button style={{ fontSize: 10, fontWeight: 500, color: '#0F6E56', border: '1px solid #0F6E56', borderRadius: 4, padding: '3px 10px', background: 'none', cursor: 'pointer' }}>Connect</button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly batch */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>This week&apos;s posts</h3>
        <div style={{ backgroundColor: '#F6F6F4', borderRadius: 8, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#A1A09E' }}>Connect a social account to start auto-posting AI-generated content.</p>
        </div>
      </div>
    </div>
  );
}
