'use client';
// TODO: Backend tables needed: resellers, reseller_commissions, reseller_payouts, reseller_config
// TODO: Backend — ref_code in signup URL → stored on presence_partners.referred_by → tracked through conversion

import { getAuthFromClient } from '@/lib/auth';

var TIERS = [
  { name: 'Bronze', range: '0-4 referrals', pct: '20%', color: '#854F0B', bg: '#FAEEDA' },
  { name: 'Silver', range: '5-14 referrals', pct: '25%', color: '#5F5E5A', bg: '#F1EFE8' },
  { name: 'Gold', range: '15+ referrals', pct: '30%', color: '#854F0B', bg: '#FAEEDA' },
];

export default function ReferralPage() {
  var user = getAuthFromClient();
  var refCode = user?.id ? 'MH' + user.id.slice(-6) : 'MH000000';
  var refLink = 'https://medihost.in/signup?ref=' + refCode;

  function copyLink() { navigator.clipboard.writeText(refLink); }
  function shareWhatsApp() { window.open('https://wa.me/?text=' + encodeURIComponent('Join MediHost - the AI clinic platform! Sign up here: ' + refLink), '_blank'); }

  return (
    <div style={{ maxWidth: 600 }} className="space-y-5">
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Refer &amp; Earn</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Share your unique link</h3>
        <div className="flex items-center gap-2" style={{ backgroundColor: '#F6F6F4', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#5F5E5A', flex: 1, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{refLink}</span>
          <button onClick={copyLink} style={{ fontSize: 10, fontWeight: 600, color: '#0F6E56', border: '1px solid #0F6E56', borderRadius: 4, padding: '3px 10px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy link</button>
        </div>
        <button onClick={shareWhatsApp} style={{ fontSize: 10, fontWeight: 600, color: '#fff', backgroundColor: '#25D366', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>Share on WhatsApp</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Total referrals', value: '0' }, { label: 'Converted', value: '0' }, { label: 'Earnings', value: 'Rs.0' }].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div style={{ fontSize: 10, color: '#78776F' }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>Commission tiers</h3>
        {TIERS.map(t => (
          <div key={t.name} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '0.5px solid #E5E5E3' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: t.bg, color: t.color, padding: '2px 6px', borderRadius: 4 }}>{t.name}</span>
              <span style={{ fontSize: 11, color: '#5F5E5A' }}>{t.range}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F6E56' }}>{t.pct}</span>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: '#78776F', marginBottom: 4 }}>Current tier: Bronze (0/5 to Silver)</div>
          <div style={{ width: '100%', height: 4, backgroundColor: '#F1EFE8', borderRadius: 2 }}><div style={{ width: '0%', height: 4, backgroundColor: '#0F6E56', borderRadius: 2 }} /></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>How it works</h3>
        {[{ s: '1', t: 'Share your link', d: 'Send your unique referral link to clinic owners' },
          { s: '2', t: 'Friend signs up', d: 'They create a MediHost account using your link' },
          { s: '3', t: 'You earn', d: 'Get recurring commission on every payment they make' }].map(x => (
          <div key={x.s} className="flex items-start gap-3" style={{ marginBottom: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#E1F5EE', color: '#0F6E56', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{x.s}</span>
            <div><div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{x.t}</div><div style={{ fontSize: 10, color: '#78776F' }}>{x.d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
