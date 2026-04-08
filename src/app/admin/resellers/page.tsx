'use client';

var MOCK_RESELLERS = [
  { id: 1, name: 'Pardhu Sai', type: 'Partner', tier: 'Bronze', referrals: 2, earned: 'Rs.1,998', status: 'Active' },
  { id: 2, name: 'MedTech Solutions', type: 'Dedicated', tier: 'Silver', referrals: 8, earned: 'Rs.12,490', status: 'Active' },
  { id: 3, name: 'HealthBridge India', type: 'Dedicated', tier: 'Gold', referrals: 22, earned: 'Rs.45,000', status: 'Active' },
];

var TIER_STYLES: Record<string, { bg: string; color: string }> = {
  Bronze: { bg: '#FAEEDA', color: '#854F0B' },
  Silver: { bg: '#F1EFE8', color: '#5F5E5A' },
  Gold: { bg: '#FAEEDA', color: '#854F0B' },
};

export default function ResellersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resellers</h1>
        <span style={{ fontSize: 11, color: '#78776F' }}>{MOCK_RESELLERS.length} resellers</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E5E3' }}>
              {['Name', 'Type', 'Tier', 'Referrals', 'Total earned', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78776F' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_RESELLERS.map(r => {
              var ts = TIER_STYLES[r.tier] || TIER_STYLES.Bronze;
              return (
                <tr key={r.id} style={{ borderBottom: '0.5px solid #E5E5E3' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#1A1A1A' }}>{r.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#5F5E5A' }}>{r.type}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 9, fontWeight: 600, backgroundColor: ts.bg, color: ts.color, padding: '2px 6px', borderRadius: 4 }}>{r.tier}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#1A1A1A' }}>{r.referrals}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#0F6E56' }}>{r.earned}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 6px', borderRadius: 4 }}>{r.status}</span></td>
                  <td style={{ padding: '10px 14px' }}>
                    <button style={{ fontSize: 10, color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }}>View</button>
                    <button style={{ fontSize: 10, color: '#5F5E5A', background: 'none', border: 'none', cursor: 'pointer' }}>Change tier</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
