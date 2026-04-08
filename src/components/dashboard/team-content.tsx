'use client';

import type { AuthUser } from '@/lib/auth';

const ROLE_COLORS: Record<string, string> = {
  PARTNER: '#E1F5EE',
  SUPER_ADMIN: '#EEEDFE',
  HOSPITAL_ADMIN: '#E6F1FB',
  DOCTOR: '#E6F1FB',
  RECEPTIONIST: '#F1EFE8',
};

const ROLE_TEXT_COLORS: Record<string, string> = {
  PARTNER: '#0F6E56',
  SUPER_ADMIN: '#534AB7',
  HOSPITAL_ADMIN: '#185FA5',
  DOCTOR: '#185FA5',
  RECEPTIONIST: '#5F5E5A',
};

function roleLabel(role: string): string {
  return (role || 'PARTNER').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function TeamContent({ user }: { user: AuthUser | null }) {
  var planName = user?.plan_tier ? user.plan_tier.charAt(0).toUpperCase() + user.plan_tier.slice(1) : 'Starter';
  var maxSlots = user?.plan_tier === 'enterprise' ? 'Unlimited' : user?.plan_tier === 'professional' ? '10' : user?.plan_tier === 'growth' ? '5' : '1';
  var initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  var bgColor = ROLE_COLORS[user?.role || 'PARTNER'] || '#E1F5EE';
  var textColor = ROLE_TEXT_COLORS[user?.role || 'PARTNER'] || '#0F6E56';

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Team</h2>
          <p style={{ fontSize: 11, color: '#78776F', marginTop: 2 }}>1 of {maxSlots} staff slots used ({planName} plan)</p>
        </div>
        <button className="text-xs font-medium text-white rounded-md px-3 py-1.5 transition-colors" style={{ backgroundColor: '#0F6E56' }}>
          Invite staff member
        </button>
      </div>

      {/* Staff list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '0.5px solid #E5E5E3' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: bgColor, color: textColor, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{user?.name || 'You'}</div>
            <div style={{ fontSize: 10, color: '#78776F' }}>{user?.email} — {roleLabel(user?.role || 'PARTNER')}</div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>You</span>
        </div>

        {/* Empty state for additional members */}
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#A1A09E' }}>No other team members yet. Invite your staff to get started.</p>
        </div>
      </div>

      {/* Info box */}
      <div style={{ backgroundColor: '#F6F6F4', border: '0.5px solid #E5E5E3', borderRadius: 8, padding: 14 }}>
        <p style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.6 }}>
          To configure detailed permissions for each staff member (which modules they can access, read-only vs edit), go to{' '}
          <a href="https://app.hemato.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0F6E56', fontWeight: 500 }}>
            HMS Settings &gt; Staff management
          </a>
        </p>
      </div>
    </div>
  );
}
