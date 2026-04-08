'use client';
// TODO: Backend webhook handler — on payment success, calculate commission, store in reseller_commissions

export default function CommissionsPage() {
  return (
    <div style={{ maxWidth: 700 }} className="space-y-5">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>My Commissions</h2>
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'This month', value: 'Rs.0' }, { label: 'Total earned', value: 'Rs.0' }, { label: 'Pending payout', value: 'Rs.0' }].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div style={{ fontSize: 10, color: '#78776F' }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '0.5px solid #E5E5E3' }}>
            {['Date', 'Referred partner', 'Plan', 'Amount', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 600, color: '#78776F' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody><tr><td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', fontSize: 11, color: '#A1A09E' }}>No commissions yet. Share your referral link to start earning.</td></tr></tbody>
        </table>
      </div>
    </div>
  );
}
