'use client';

// Phase 5.7: Trial expired soft downgrade state
export function TrialExpiredCard() {
  var keeps = ['Patient records', 'Basic registration', 'Clinic website (subdomain)'];
  var locked = [
    { name: 'OPD Queue', plan: 'Growth' },
    { name: 'Billing & Invoicing', plan: 'Growth' },
    { name: 'EMR & Prescriptions', plan: 'Growth' },
    { name: 'LIS (Lab System)', plan: 'Professional' },
    { name: 'Custom Domain', plan: 'Growth' },
    { name: 'AI Marketing', plan: 'Growth' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Red header */}
      <div style={{ backgroundColor: '#DC2626', padding: '14px 20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Your trial has ended</h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>You&apos;ve been moved to the free Starter plan. All your data is preserved.</p>
      </div>

      <div style={{ padding: 20 }}>
        {/* What you keep */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>What you keep (Starter):</h4>
          {keeps.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#0F6E56', lineHeight: 1.8 }}>
              <span style={{ color: '#0F6E56' }}>&#10003;</span> {item}
            </div>
          ))}
        </div>

        {/* What's locked */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>What&apos;s now locked:</h4>
          {locked.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#791F1F', lineHeight: 1.8 }}>
              <span>&#10007;</span>
              <span>{item.name}</span>
              <span style={{ fontSize: 8, backgroundColor: '#E6F1FB', color: '#185FA5', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>{item.plan}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a href="/dashboard/plan" style={{ display: 'block', textAlign: 'center', backgroundColor: '#0F6E56', color: '#fff', fontSize: 12, fontWeight: 600, padding: '10px 0', borderRadius: 8, textDecoration: 'none' }}>
          Upgrade to Growth - Rs.999/mo
        </a>
        <p style={{ textAlign: 'center', fontSize: 10, color: '#A1A09E', marginTop: 6 }}>14-day money-back guarantee</p>
      </div>
    </div>
  );
}
