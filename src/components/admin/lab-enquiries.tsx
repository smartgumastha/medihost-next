// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
"use client";

import { useState } from 'react';

type Status = 'pending' | 'approved' | 'rejected';

interface Lab {
  id: number;
  name: string;
  owner: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  nabl: boolean;
  nablNumber: string;
  type: string;
  tests: string;
  equipment: string;
  staff: string;
  timing: string;
  applied: string;
  status: Status;
  subdomain?: string;
  plan?: string;
}

const MOCK_LABS: Lab[] = [
  { id: 1, name: 'LifeCare Diagnostics', owner: 'Dr. Ramesh Gupta', phone: '+91 40 2345 6789', email: 'info@lifecare.in', city: 'Hyderabad', address: '1st Floor, Cyber Towers, Madhapur, Hyderabad 500081', nabl: true, nablNumber: 'MC-1234', type: 'Full Service', tests: 'Hematology, Biochemistry, Microbiology, Pathology', equipment: 'Fully automated analyzers, PCR machines', staff: '12 technicians, 3 pathologists', timing: '24/7', applied: '1 day ago', status: 'pending' },
  { id: 2, name: 'MedScan Labs', owner: 'Dr. Sunitha Reddy', phone: '+91 40 3456 7890', email: 'contact@medscan.co', city: 'Hyderabad', address: '45, Road No. 12, Banjara Hills, Hyderabad 500034', nabl: true, nablNumber: 'MC-5678', type: 'Diagnostic Center', tests: 'Radiology, Pathology, Cardiology', equipment: 'MRI, CT Scanner, Digital X-ray, Ultrasound', staff: '8 technicians, 2 radiologists', timing: '8 AM - 10 PM', applied: '5 days ago', status: 'pending' },
  { id: 3, name: 'QuickTest Path', owner: 'Vikram Singh', phone: '+91 40 4567 8901', email: 'info@quicktest.in', city: 'Hyderabad', address: '78, Kukatpally Housing Board, Hyderabad 500072', nabl: false, nablNumber: '', type: 'Collection Center', tests: 'Basic Pathology, Hematology', equipment: 'Semi-automated analyzers', staff: '4 technicians', timing: '7 AM - 8 PM', applied: '3 days ago', status: 'approved', subdomain: 'quicktest', plan: 'Professional' },
  { id: 4, name: 'Precision Diagnostics', owner: 'Dr. Arjun Mehta', phone: '+91 40 5678 9012', email: 'hello@precision.co', city: 'Hyderabad', address: '23, Jubilee Hills, Hyderabad 500033', nabl: true, nablNumber: 'MC-9012', type: 'Reference Lab', tests: 'Genomics, Molecular diagnostics, Toxicology', equipment: 'Next-gen sequencers, Mass spectrometry', staff: '15 technicians, 5 pathologists', timing: '24/7', applied: '7 days ago', status: 'rejected' },
];

const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export function LabEnquiries() {
  const [labs, setLabs] = useState<Lab[]>(MOCK_LABS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nablFilter, setNablFilter] = useState<string>('all');
  const [viewLab, setViewLab] = useState<Lab | null>(null);
  const [approveTarget, setApproveTarget] = useState<Lab | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Lab | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Professional');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleApprove() {
    if (!approveTarget) return;
    setLabs(prev => prev.map(l => l.id === approveTarget.id ? { ...l, status: 'approved' as Status, subdomain, plan: selectedPlan } : l));
    showToast(`${approveTarget.name} has been approved`);
    setApproveTarget(null);
    setSubdomain('');
    setSelectedPlan('Professional');
  }

  function handleReject() {
    if (!rejectTarget) return;
    setLabs(prev => prev.map(l => l.id === rejectTarget.id ? { ...l, status: 'rejected' as Status } : l));
    showToast(`${rejectTarget.name} has been rejected`);
    setRejectTarget(null);
    setRejectReason('');
  }

  const filtered = labs.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.owner.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (nablFilter === 'yes' && !l.nabl) return false;
    if (nablFilter === 'no' && l.nabl) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Enquiries</h1>
        <p className="text-sm text-gray-500 mt-1">Manage lab partner applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by lab name or owner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-64"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={nablFilter} onChange={e => setNablFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="all">All NABL</option>
          <option value="yes">NABL Certified</option>
          <option value="no">Not Certified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Lab Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">NABL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Applied</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{l.name}</td>
                  <td className="py-3 px-4 text-gray-600">{l.owner}</td>
                  <td className="py-3 px-4 text-gray-500">{l.city}</td>
                  <td className="py-3 px-4">
                    {l.nabl ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">NABL</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{l.type}</td>
                  <td className="py-3 px-4 text-gray-500">{l.applied}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewLab(l)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">View</button>
                      {l.status === 'pending' && (
                        <>
                          <button onClick={() => { setApproveTarget(l); setSubdomain(l.name.toLowerCase().replace(/\s+/g, '')); }} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">Approve</button>
                          <button onClick={() => setRejectTarget(l)} className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No labs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewLab && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-10 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 mb-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Lab Details</h2>
              <button onClick={() => setViewLab(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[viewLab.status]}`}>{viewLab.status}</span>
                {viewLab.nabl && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">NABL: {viewLab.nablNumber}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {([
                  ['Lab Name', viewLab.name],
                  ['Owner', viewLab.owner],
                  ['Phone', viewLab.phone],
                  ['Email', viewLab.email],
                  ['City', viewLab.city],
                  ['Address', viewLab.address],
                  ['Type', viewLab.type],
                  ['Tests Offered', viewLab.tests],
                  ['Equipment', viewLab.equipment],
                  ['Staff', viewLab.staff],
                  ['Timing', viewLab.timing],
                  ['Applied', viewLab.applied],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-gray-500 font-medium">{label}</div>
                    <div className="text-gray-900 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              {viewLab.status === 'pending' && (
                <>
                  <button onClick={() => { setViewLab(null); setApproveTarget(viewLab); setSubdomain(viewLab.name.toLowerCase().replace(/\s+/g, '')); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Approve</button>
                  <button onClick={() => { setViewLab(null); setRejectTarget(viewLab); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Reject</button>
                </>
              )}
              <button onClick={() => setViewLab(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal with Subdomain */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Approve Lab Partner</h2>
              <button onClick={() => setApproveTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-700">Approve <strong>{approveTarget.name}</strong> as a lab partner.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 flex-1"
                  />
                  <span className="text-sm text-gray-500">.medihost.in</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option>Starter</option>
                  <option>Professional</option>
                  <option>Business</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-1">
                <div className="font-semibold mb-2">This will create:</div>
                <div>&#x2022; Storefront URL: <strong>{subdomain}.medihost.in</strong></div>
                <div>&#x2022; LIS (Lab Information System) access</div>
                <div>&#x2022; Partner app login credentials</div>
                <div>&#x2022; Marketplace listing on Hemato</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => setApproveTarget(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={handleApprove} disabled={!subdomain} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Reject Application</h2>
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">Reject <strong>{rejectTarget.name}</strong>&apos;s application?</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Provide a reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
