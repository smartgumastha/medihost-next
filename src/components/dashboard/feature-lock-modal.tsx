'use client';

interface PlanOption {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

interface FeatureLockModalProps {
  feature: string;
  description: string;
  plans: PlanOption[];
  onClose: () => void;
}

export function FeatureLockModal({ feature, description, plans, onClose }: FeatureLockModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          {/* Lock icon */}
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Upgrade to unlock {feature}</h3>
          <p style={{ fontSize: 12, color: '#78776F', marginBottom: 20 }}>{description}</p>

          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3">
            {plans.map(plan => (
              <div key={plan.name} className="rounded-lg p-4 text-left" style={{ border: plan.recommended ? '1.5px solid #0F6E56' : '1px solid #E5E5E3' }}>
                {plan.recommended && (
                  <span style={{ fontSize: 8, fontWeight: 600, backgroundColor: '#E1F5EE', color: '#0F6E56', padding: '2px 5px', borderRadius: 4, display: 'inline-block', marginBottom: 6 }}>Recommended</span>
                )}
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{plan.name}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F6E56', margin: '4px 0 8px' }}>{plan.price}</div>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#5F5E5A', lineHeight: 1.7 }}>{f}</div>
                ))}
                <a href="/dashboard/plan" style={{ display: 'block', marginTop: 10, fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: plan.recommended ? '#0F6E56' : '#3D3D3A', padding: '6px 0', borderRadius: 6, textAlign: 'center', textDecoration: 'none' }}>
                  Upgrade to {plan.name}
                </a>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{ marginTop: 16, fontSize: 11, color: '#A1A09E', background: 'none', border: 'none', cursor: 'pointer' }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

// Pre-configured lock configs for common features
export var LOCK_CONFIGS: Record<string, { feature: string; description: string; plans: PlanOption[] }> = {
  lis: {
    feature: 'LIS (Lab Information System)',
    description: 'NABL-compliant lab management with sample tracking, test workflows, and automated reporting.',
    plans: [
      { name: 'Professional', price: 'Rs.2,499/mo', features: ['LIS + lab reports', 'Pharmacy module', 'AI SEO', '10 staff accounts'], recommended: true },
      { name: 'Enterprise', price: 'Rs.4,999/mo', features: ['Everything in Professional', 'Multi-branch', 'Unlimited staff', 'Priority support'] },
    ],
  },
  pharmacy: {
    feature: 'Pharmacy Module',
    description: 'Complete pharmacy POS with inventory management, prescriptions, and GST billing.',
    plans: [
      { name: 'Professional', price: 'Rs.2,499/mo', features: ['Pharmacy POS', 'LIS included', 'AI email campaigns', '10 staff accounts'], recommended: true },
      { name: 'Enterprise', price: 'Rs.4,999/mo', features: ['Everything in Professional', 'Multi-branch', 'Unlimited staff'] },
    ],
  },
  hms_expired: {
    feature: 'Clinic Software (HMS)',
    description: 'Your trial has ended. Upgrade to restore access to OPD, Billing, EMR, and all HMS modules.',
    plans: [
      { name: 'Growth', price: 'Rs.999/mo', features: ['OPD + EMR + Billing', 'Appointments', 'AI Marketing', 'FREE .in domain'], recommended: true },
      { name: 'Professional', price: 'Rs.2,499/mo', features: ['Everything in Growth', 'LIS + Pharmacy', 'AI SEO', '10 staff accounts'] },
    ],
  },
};
