'use client';

import { useState, useEffect } from 'react';
import { getTokenFromClient } from '@/lib/auth';

interface PartnerDomain {
  id: string;
  email: string;
  business_name: string;
  owner_name: string;
  selected_domain: string;
  domain_status: string;
  registrar_order_id: string | null;
  created_at: string;
}

interface PaymentOrder {
  id: string;
  order_ref: string;
  domain_requested: string;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

var STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: '#ECFDF5', color: '#059669' },
  registered: { bg: '#ECFDF5', color: '#059669' },
  pending: { bg: '#FEF3C7', color: '#92400E' },
  paid: { bg: '#FEF3C7', color: '#92400E' },
  provisioning: { bg: '#FEF3C7', color: '#92400E' },
  failed: { bg: '#FEE2E2', color: '#DC2626' },
  registration_failed: { bg: '#FEE2E2', color: '#DC2626' },
  paid_domain_failed: { bg: '#FEE2E2', color: '#DC2626' },
};

function StatusBadge({ status }: { status: string }) {
  var s = STATUS_STYLES[status] || { bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: 12 }}>{status}</span>;
}

export default function DomainsPage() {
  var [partners, setPartners] = useState<PartnerDomain[]>([]);
  var [orders, setOrders] = useState<PaymentOrder[]>([]);
  var [balance, setBalance] = useState<string | null>(null);
  var [loading, setLoading] = useState(true);
  var [toast, setToast] = useState('');
  var [pushModal, setPushModal] = useState(false);
  var [pushForm, setPushForm] = useState({ domain_name: '', partner_id: '', payment_order_id: '' });
  var [pushing, setPushing] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 4000); }

  useEffect(() => {
    var token = getTokenFromClient();
    var headers: Record<string, string> = token ? { 'Authorization': 'Bearer ' + token } : {};

    fetch('/api/admin/domains', { headers }).then(r => r.json()).then(d => {
      if (d.success) {
        setPartners(d.partners_with_domains || []);
        setOrders(d.payment_orders || []);
      }
    }).catch(() => {}).finally(() => setLoading(false));

    fetch('/api/admin/domains/rc-balance', { headers }).then(r => r.json()).then(d => {
      if (d.success && d.balance) {
        var b = d.balance;
        setBalance(typeof b === 'object' ? ('Rs.' + (b.sellingcurrencybalance || b.resellerbalance || JSON.stringify(b))) : String(b));
      }
    }).catch(() => {});
  }, []);

  async function handleRetry(partnerId: string) {
    var token = getTokenFromClient();
    try {
      var res = await fetch('/api/admin/domains/retry/' + partnerId, {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token },
      });
      var data = await res.json();
      showToast(data.success ? 'Retry initiated' : ('Error: ' + (data.error || 'Failed')));
    } catch { showToast('Network error'); }
  }

  async function handlePush() {
    if (!pushForm.domain_name) { showToast('Domain name required'); return; }
    setPushing(true);
    var token = getTokenFromClient();
    try {
      var res = await fetch('/api/admin/domains/push-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(pushForm),
      });
      var data = await res.json();
      if (data.success) {
        showToast('Domain registered! RC Order: ' + (data.rc_order_id || 'pending'));
        setPushModal(false);
      } else {
        showToast('Error: ' + (data.error || 'Failed'));
      }
    } catch { showToast('Network error'); }
    finally { setPushing(false); }
  }

  var pendingPartners = partners.filter(p => p.domain_status !== 'registered' && p.domain_status !== 'active');
  var pendingOrders = orders.filter(o => o.status === 'paid' || o.status === 'provisioning' || o.status === 'paid_domain_failed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Domain Management</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>{partners.length} partners with domains, {orders.length} payment orders</p>
        </div>
        <button onClick={() => setPushModal(true)} style={{ fontSize: 13, fontWeight: 600, color: '#fff', backgroundColor: '#534AB7', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>
          Push Domain Order
        </button>
      </div>

      {/* RC Balance */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>ResellerClub Balance</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginTop: 4 }}>{balance || 'Loading...'}</div>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Auto-refreshed on page load</div>
      </div>

      {/* Pending domains (highlighted) */}
      {(pendingPartners.length > 0 || pendingOrders.length > 0) && (
        <div className="rounded-xl p-5" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#92400E', marginBottom: 12 }}>Pending / Failed Domains ({pendingPartners.length + pendingOrders.length})</h3>

          {pendingOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #FDE68A' }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>{o.domain_requested}</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 8 }}>Order: {o.order_ref}</span>
                {o.failure_reason && <span style={{ fontSize: 11, color: '#DC2626', marginLeft: 8 }}>{o.failure_reason}</span>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}

          {pendingPartners.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #FDE68A' }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>{p.selected_domain}</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 8 }}>{p.business_name || p.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.domain_status} />
                <button onClick={() => handleRetry(p.id)} style={{ fontSize: 11, fontWeight: 600, color: '#534AB7', background: 'none', border: '1px solid #534AB7', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>Retry</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All domains table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>Loading domains...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                {['Domain', 'Partner', 'Status', 'RC Order ID', 'Created'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 12, fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: 12, fontSize: 14, fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>{p.selected_domain}</td>
                  <td style={{ padding: 12, fontSize: 14, color: '#4B5563' }}>{p.business_name || p.owner_name || p.email}</td>
                  <td style={{ padding: 12 }}><StatusBadge status={p.domain_status} /></td>
                  <td style={{ padding: 12, fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{p.registrar_order_id || '—'}</td>
                  <td style={{ padding: 12, fontSize: 12, color: '#6B7280' }}>{p.created_at ? new Date(Number(p.created_at)).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No domains found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Push Order Modal */}
      {pushModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPushModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Push Domain Order</h3>
            <div className="space-y-3">
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Domain name (e.g. medihostai.com)</label>
                <input value={pushForm.domain_name} onChange={e => setPushForm(p => ({ ...p, domain_name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="clinic.in" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Partner ID (optional)</label>
                <input value={pushForm.partner_id} onChange={e => setPushForm(p => ({ ...p, partner_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Payment Order ID (optional)</label>
                <input value={pushForm.payment_order_id} onChange={e => setPushForm(p => ({ ...p, payment_order_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setPushModal(false)} style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', color: '#374151', background: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePush} disabled={pushing} style={{ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: 'none', color: '#fff', backgroundColor: '#534AB7', cursor: 'pointer', opacity: pushing ? 0.5 : 1 }}>
                {pushing ? 'Registering...' : 'Register Domain'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}
    </div>
  );
}
