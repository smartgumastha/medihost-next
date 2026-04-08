'use client';

import { useState } from 'react';

interface TrialBarProps {
  daysLeft: number;
  planName: string;
  expired: boolean;
}

export function TrialBar({ daysLeft, planName, expired }: TrialBarProps) {
  var [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (expired) {
    return (
      <div style={{ backgroundColor: '#FCEBEB', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#791F1F', fontWeight: 500 }}>
          Your {planName} trial has ended. Your data is safe. Upgrade anytime to restore full access.
        </span>
        <a href="/dashboard/plan" style={{ fontSize: 10, fontWeight: 600, backgroundColor: '#DC2626', color: '#fff', padding: '4px 12px', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Upgrade - don&apos;t lose data
        </a>
      </div>
    );
  }

  if (daysLeft <= 1) {
    return (
      <div style={{ backgroundColor: '#FCEBEB', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#791F1F', fontWeight: 500 }}>
          Your trial expires tomorrow! Upgrade now or you&apos;ll lose access to OPD, Billing, EMR, and LIS.
        </span>
        <a href="/dashboard/plan" style={{ fontSize: 10, fontWeight: 600, backgroundColor: '#DC2626', color: '#fff', padding: '4px 12px', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Upgrade - don&apos;t lose data
        </a>
      </div>
    );
  }

  if (daysLeft <= 5) {
    return (
      <div style={{ backgroundColor: '#FAEEDA', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#633806', fontWeight: 500 }}>
          Your trial ends in {daysLeft} days. Upgrade now to keep all your data and premium features.
        </span>
        <a href="/dashboard/plan" style={{ fontSize: 10, fontWeight: 600, backgroundColor: '#854F0B', color: '#fff', padding: '4px 12px', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Upgrade now
        </a>
      </div>
    );
  }

  // Info state (6-14 days)
  return (
    <div style={{ backgroundColor: '#E6F1FB', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: '#0C447C', fontWeight: 500 }}>
        Your {planName} trial started. You have {daysLeft} days to explore all features.
      </span>
      <button onClick={() => setDismissed(true)} style={{ fontSize: 10, color: '#0C447C', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Dismiss
      </button>
    </div>
  );
}
