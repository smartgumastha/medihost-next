'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Partner {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  status: 'active' | 'trial' | 'expired';
  source: string;
  city: string;
  last_login: string;
  login_count: number;
  created: string;
  trial_days: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_PARTNERS: Partner[] = [
  { id:1, business_name:'Dr. Sharma Clinic', owner_name:'Dr. Ravi Sharma', email:'ravi@clinic.com', phone:'9876543210', plan:'professional', status:'active', source:'direct', city:'Hyderabad', last_login:'2h ago', login_count:45, created:'2026-03-15', trial_days:0 },
  { id:2, business_name:'LifeCare Diagnostics', owner_name:'Dr. Ramesh', email:'ramesh@lifecare.com', phone:'9876543211', plan:'business', status:'active', source:'hemato', city:'Hyderabad', last_login:'1d ago', login_count:23, created:'2026-03-20', trial_days:0 },
  { id:3, business_name:'Smile Dental', owner_name:'Dr. Priya', email:'priya@smiledental.com', phone:'9876543212', plan:'starter', status:'trial', source:'google', city:'Hyderabad', last_login:'3d ago', login_count:8, created:'2026-03-28', trial_days:7 },
  { id:4, business_name:'PhysioFirst', owner_name:'Dr. Anand', email:'anand@physiofirst.com', phone:'9876543213', plan:'professional', status:'trial', source:'instagram', city:'Secunderabad', last_login:'5d ago', login_count:3, created:'2026-04-01', trial_days:12 },
  { id:5, business_name:'MedScan Labs', owner_name:'Dr. Suresh', email:'suresh@medscan.com', phone:'9876543214', plan:'business', status:'active', source:'hemato', city:'Hyderabad', last_login:'6h ago', login_count:67, created:'2026-02-10', trial_days:0 },
  { id:6, business_name:'City Hospital', owner_name:'Dr. Kavitha', email:'kavitha@cityhospital.com', phone:'9876543215', plan:'enterprise', status:'active', source:'admin', city:'Hyderabad', last_login:'1h ago', login_count:120, created:'2026-01-15', trial_days:0 },
  { id:7, business_name:'Arogya Pharmacy', owner_name:'Rajesh K', email:'rajesh@arogya.com', phone:'9876543216', plan:'starter', status:'expired', source:'direct', city:'Kukatpally', last_login:'30d ago', login_count:2, created:'2026-02-20', trial_days:0 },
  { id:8, business_name:'NeuroCare Clinic', owner_name:'Dr. Meena', email:'meena@neurocare.com', phone:'9876543217', plan:'professional', status:'active', source:'google', city:'Banjara Hills', last_login:'4h ago', login_count:34, created:'2026-03-01', trial_days:0 },
  { id:9, business_name:'EyeZone Optics', owner_name:'Dr. Venkat', email:'venkat@eyezone.com', phone:'9876543218', plan:'starter', status:'trial', source:'direct', city:'Ameerpet', last_login:'never', login_count:0, created:'2026-04-04', trial_days:14 },
  { id:10, business_name:'KidsCare Pediatrics', owner_name:'Dr. Lakshmi', email:'lakshmi@kidscare.com', phone:'9876543219', plan:'professional', status:'active', source:'instagram', city:'Madhapur', last_login:'12h ago', login_count:19, created:'2026-03-10', trial_days:0 },
];

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close">{'\u00d7'}</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge helpers                                                      */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, trialDays }: { status: Partner['status']; trialDays: number }) {
  const cfg = {
    active:  { dot: 'bg-emerald-500', text: 'Active',                   bg: 'bg-emerald-50 text-emerald-700' },
    trial:   { dot: 'bg-amber-500',   text: `Trial (${trialDays}d)`,    bg: 'bg-amber-50 text-amber-700' },
    expired: { dot: 'bg-red-500',     text: 'Expired',                  bg: 'bg-red-50 text-red-700' },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Partner['plan'] }) {
  const cfg = {
    starter:      'bg-gray-100 text-gray-700',
    professional: 'bg-blue-50 text-blue-700',
    business:     'bg-purple-50 text-purple-700',
    enterprise:   'bg-amber-50 text-amber-700',
  }[plan];

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cfg}`}>
      {plan}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 capitalize">
      {source}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const [detailPartner, setDetailPartner] = useState<Partner | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  /* ---- Fetch partners from API with mock fallback ---- */
  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await fetch('/api/proxy/api/presence/partners?page=1&limit=50', {
          headers: { 'x-admin-key': 'MediHost@2026' },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.partners || data.data?.partners || [];
          if (list.length > 0) {
            setPartners(list);
            return;
          }
        }
      } catch {
        // Fall through to mock data
      }
      // Keep MOCK_PARTNERS fallback (already set as initial state)
    }
    loadPartners();
  }, []);

  // Create form state
  const [createForm, setCreateForm] = useState({
    business_name: '', owner_name: '', email: '', phone: '', city: '',
    plan: 'starter' as Partner['plan'], source: 'admin',
  });
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, type: ToastType) => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  /* ---- Filtering ---- */
  const filtered = partners.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.business_name.toLowerCase().includes(q) || p.owner_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchPlan = planFilter === 'all' || p.plan === planFilter;
    const matchSource = sourceFilter === 'all' || p.source === sourceFilter;
    return matchSearch && matchStatus && matchPlan && matchSource;
  });

  /* ---- Actions ---- */
  const extendTrial = (partner: Partner, days: number) => {
    setPartners(prev => prev.map(p =>
      p.id === partner.id
        ? { ...p, trial_days: p.trial_days + days, status: 'trial' as const }
        : p
    ));
    if (detailPartner?.id === partner.id) {
      setDetailPartner(prev => prev ? { ...prev, trial_days: prev.trial_days + days, status: 'trial' } : null);
    }
    showToast(`Trial extended by ${days} days for ${partner.business_name}`, 'success');
  };

  const changePlan = (partner: Partner, newPlan: Partner['plan']) => {
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, plan: newPlan } : p));
    if (detailPartner?.id === partner.id) {
      setDetailPartner(prev => prev ? { ...prev, plan: newPlan } : null);
    }
    showToast(`Plan changed to ${newPlan} for ${partner.business_name}`, 'success');
  };

  const sendInvite = (partner: Partner) => {
    showToast(`Invite email sent to ${partner.email}`, 'success');
  };

  const handleCreate = () => {
    if (!createForm.business_name.trim() || !createForm.email.trim()) {
      showToast('Business name and email are required.', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const newPartner: Partner = {
        id: Date.now(),
        business_name: createForm.business_name,
        owner_name: createForm.owner_name,
        email: createForm.email,
        phone: createForm.phone,
        city: createForm.city,
        plan: createForm.plan,
        status: 'trial',
        source: createForm.source,
        last_login: 'never',
        login_count: 0,
        created: new Date().toISOString().split('T')[0],
        trial_days: 14,
      };
      setPartners(prev => [newPartner, ...prev]);
      setCreateOpen(false);
      setCreateForm({ business_name: '', owner_name: '', email: '', phone: '', city: '', plan: 'starter', source: 'admin' });
      setSaving(false);
      showToast(`${newPartner.business_name} created & invite sent!`, 'success');
    }, 500);
  };

  /* ---- Select styling ---- */
  const selectCls = 'h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100';

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Partners</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} of {partners.length} partners</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-red-600 text-white hover:bg-red-700">
            <PlusIcon /> Create New Clinic
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64 h-9"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="all">All Status</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className={selectCls}>
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={selectCls}>
            <option value="all">All Sources</option>
            <option value="direct">Direct</option>
            <option value="google">Google</option>
            <option value="instagram">Instagram</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clinic / Owner</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Trial</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Last Login</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">No partners match filters.</td>
                  </tr>
                ) : (
                  filtered.map(partner => (
                    <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <StatusBadge status={partner.status} trialDays={partner.trial_days} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{partner.business_name}</div>
                        <div className="text-xs text-gray-500">{partner.owner_name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{partner.email}</td>
                      <td className="py-3 px-4"><PlanBadge plan={partner.plan} /></td>
                      <td className="py-3 px-4 text-gray-600">
                        {partner.trial_days > 0 ? `${partner.trial_days}d left` : '\u2014'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{partner.last_login}</td>
                      <td className="py-3 px-4"><SourceBadge source={partner.source} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailPartner(partner)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="View details"
                          >
                            <EyeIcon />
                          </button>
                          {(partner.status === 'trial' || partner.status === 'expired') && (
                            <button
                              onClick={() => extendTrial(partner, 7)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                              title="Extend trial +7 days"
                            >
                              <ClockIcon />
                            </button>
                          )}
                          <button
                            onClick={() => sendInvite(partner)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Send invite email"
                          >
                            <MailIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Partner Detail Modal                                               */}
      {/* ------------------------------------------------------------------ */}
      {detailPartner && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8"
          onClick={e => { if (e.target === e.currentTarget) setDetailPartner(null); }}
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{detailPartner.business_name}</h3>
                <p className="text-sm text-gray-500">{detailPartner.owner_name}</p>
              </div>
              <button
                onClick={() => setDetailPartner(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {([
                  ['Business Name', detailPartner.business_name],
                  ['Owner', detailPartner.owner_name],
                  ['Email', detailPartner.email],
                  ['Phone', detailPartner.phone],
                  ['City', detailPartner.city],
                  ['Plan', detailPartner.plan],
                  ['Source', detailPartner.source],
                  ['Created', detailPartner.created],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {/* Login Stats */}
              <div className="flex gap-6 border-t border-gray-100 pt-4">
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Last Login</div>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">{detailPartner.last_login}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Login Count</div>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">{detailPartner.login_count}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                  <div className="mt-0.5"><StatusBadge status={detailPartner.status} trialDays={detailPartner.trial_days} /></div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-sm font-bold text-gray-700">Actions</h4>

                {/* Extend Trial */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 mr-1">Extend Trial:</span>
                  {[7, 14, 30].map(days => (
                    <Button
                      key={days}
                      variant="outline"
                      size="sm"
                      onClick={() => extendTrial(detailPartner, days)}
                      className="text-xs"
                    >
                      +{days} days
                    </Button>
                  ))}
                </div>

                {/* Change Plan */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-1">Change Plan:</span>
                  <select
                    value={detailPartner.plan}
                    onChange={e => changePlan(detailPartner, e.target.value as Partner['plan'])}
                    className={selectCls}
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Send Invite */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendInvite(detailPartner)}
                  className="text-xs gap-1"
                >
                  <MailIcon /> Send Invite Email
                </Button>
              </div>

              {/* Tabs placeholder */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex gap-1 border-b border-gray-200">
                  {['Overview', 'Emails', 'Payments', 'Notes'].map((tab, i) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        i === 0
                          ? 'border-red-600 text-red-700'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="py-6 text-sm text-gray-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-400 uppercase">Total Logins</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{detailPartner.login_count}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-400 uppercase">Days Since Signup</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {Math.max(0, Math.floor((Date.now() - new Date(detailPartner.created).getTime()) / 86400000))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button variant="outline" onClick={() => setDetailPartner(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Create Partner Modal                                               */}
      {/* ------------------------------------------------------------------ */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8"
          onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false); }}
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Clinic</h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c_business_name">Business Name <span className="text-red-500">*</span></Label>
                  <Input id="c_business_name" value={createForm.business_name} onChange={e => setCreateForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Clinic name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c_owner_name">Owner Name</Label>
                  <Input id="c_owner_name" value={createForm.owner_name} onChange={e => setCreateForm(f => ({ ...f, owner_name: e.target.value }))} placeholder="Dr. Name" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c_email">Email <span className="text-red-500">*</span></Label>
                  <Input id="c_email" type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="owner@clinic.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c_phone">Phone</Label>
                  <Input id="c_phone" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c_city">City</Label>
                  <Input id="c_city" value={createForm.city} onChange={e => setCreateForm(f => ({ ...f, city: e.target.value }))} placeholder="Hyderabad" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c_plan">Plan</Label>
                  <select id="c_plan" value={createForm.plan} onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value as Partner['plan'] }))} className={`${selectCls} w-full`}>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c_source">Source</Label>
                  <select id="c_source" value={createForm.source} onChange={e => setCreateForm(f => ({ ...f, source: e.target.value }))} className={`${selectCls} w-full`}>
                    <option value="admin">Admin</option>
                    <option value="direct">Direct</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create & Send Invite'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
