'use client';

import { useState } from 'react';
import { getAuthFromClient } from '@/lib/auth';
import { FeatureLockModal, LOCK_CONFIGS } from '@/components/dashboard/feature-lock-modal';

var MOCK_REVIEWS = [
  { id: 1, stars: 5, name: 'Priya M.', text: 'Excellent doctor! Very thorough and caring.', aiReply: 'Thank you so much, Priya! We appreciate your kind words.' },
  { id: 2, stars: 4, name: 'Ravi K.', text: 'Good experience overall. Wait time could be better.', aiReply: 'Thank you for the feedback, Ravi. We are working on reducing wait times.' },
  { id: 3, stars: 3, name: 'Anita S.', text: 'Decent service but parking is an issue.', aiReply: 'We appreciate your feedback, Anita. We are exploring better parking options for our patients.' },
];

export default function ReviewsAiPage() {
  var user = getAuthFromClient();
  var isGrowth = user?.plan_tier === 'growth' || user?.plan_tier === 'professional' || user?.plan_tier === 'enterprise';
  var [showLock, setShowLock] = useState(!isGrowth);

  if (showLock && !isGrowth) {
    return <FeatureLockModal feature="AI Review Replies" description="AI drafts professional replies to patient reviews. You approve, we publish." plans={LOCK_CONFIGS.hms_expired.plans} onClose={() => setShowLock(false)} />;
  }

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>AI Review Replies</h2>
        <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>Growth</span>
      </div>

      <div style={{ fontSize: 11, color: '#78776F' }}>0 reviews monitored &middot; 0 replies drafted</div>

      {/* Mock review cards */}
      <div className="space-y-3">
        {MOCK_REVIEWS.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 12, color: '#FBBF24' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#1A1A1A' }}>{r.name}</span>
            </div>
            <p style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 8 }}>{r.text}</p>
            <div style={{ backgroundColor: '#E1F5EE', borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#0F6E56', marginBottom: 4 }}>AI-drafted reply</div>
              <p style={{ fontSize: 11, color: '#0F6E56' }}>{r.aiReply}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button style={{ fontSize: 10, fontWeight: 600, color: '#fff', backgroundColor: '#0F6E56', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Approve &amp; publish</button>
              <button style={{ fontSize: 10, color: '#5F5E5A', background: 'none', border: '1px solid #D4D4D2', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Edit reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
