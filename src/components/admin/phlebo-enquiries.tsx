// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
"use client";

import { useState } from 'react';

type Status = 'pending' | 'approved' | 'rejected';

interface Phlebo {
  id: number;
  name: string;
  phone: string;
  email: string;
  gender: string;
  aadhaar: string;
  city: string;
  address: string;
  areas: string;
  experience: string;
  availability: string;
  shift: string;
  vehicle: string;
  bank: string;
  zones: string;
  skills: string;
  applied: string;
  status: Status;
}

const MOCK_PHLEBOS: Phlebo[] = [
  { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@email.com', gender: 'Male', aadhaar: '1234 5678 9012', city: 'Hyderabad', address: '12-3-456, Madhapur, Hyderabad 500081', areas: 'Madhapur, Gachibowli, Kondapur', experience: '3 years', availability: 'Full-time', shift: 'Morning (6 AM - 2 PM)', vehicle: 'Two-wheeler', bank: 'HDFC Bank - XXXX4567', zones: 'Madhapur, Gachibowli', skills: 'Venipuncture, Capillary collection, Pediatric draws', applied: '2 days ago', status: 'pending' },
  { id: 2, name: 'Srinivas Reddy', phone: '+91 87654 32109', email: 'srinivas.r@email.com', gender: 'Male', aadhaar: '2345 6789 0123', city: 'Hyderabad', address: '45-6-789, Kukatpally, Hyderabad 500072', areas: 'Kukatpally, KPHB, Miyapur', experience: '5 years', availability: 'Full-time', shift: 'Flexible', vehicle: 'Two-wheeler', bank: 'SBI - XXXX8901', zones: 'Kukatpally, KPHB', skills: 'Venipuncture, Home collection, Geriatric care', applied: '3 days ago', status: 'pending' },
  { id: 3, name: 'Priya Sharma', phone: '+91 76543 21098', email: 'priya.s@email.com', gender: 'Female', aadhaar: '3456 7890 1234', city: 'Hyderabad', address: '78-9-012, Begumpet, Hyderabad 500016', areas: 'Begumpet, Secunderabad, Ameerpet', experience: '2 years', availability: 'Part-time', shift: 'Morning (6 AM - 12 PM)', vehicle: 'None', bank: 'ICICI Bank - XXXX2345', zones: 'Begumpet, Secunderabad', skills: 'Venipuncture, Capillary collection', applied: '4 days ago', status: 'pending' },
  { id: 4, name: 'Ahmed Khan', phone: '+91 65432 10987', email: 'ahmed.k@email.com', gender: 'Male', aadhaar: '4567 8901 2345', city: 'Hyderabad', address: '34-5-678, Kondapur, Hyderabad 500084', areas: 'Kondapur, Manikonda, Narsingi', experience: '4 years', availability: 'Full-time', shift: 'Evening (2 PM - 10 PM)', vehicle: 'Two-wheeler', bank: 'Axis Bank - XXXX6789', zones: 'Kondapur, Manikonda', skills: 'Venipuncture, Home collection, Emergency draws', applied: '5 days ago', status: 'approved' },
  { id: 5, name: 'Lakshmi Devi', phone: '+91 54321 09876', email: 'lakshmi.d@email.com', gender: 'Female', aadhaar: '5678 9012 3456', city: 'Hyderabad', address: '56-7-890, Secunderabad, Hyderabad 500003', areas: 'Secunderabad, Trimulgherry, Alwal', experience: '1 year', availability: 'Part-time', shift: 'Morning (6 AM - 12 PM)', vehicle: 'None', bank: 'Kotak Bank - XXXX0123', zones: 'Secunderabad, Trimulgherry', skills: 'Venipuncture, Capillary collection', applied: '6 days ago', status: 'rejected' },
];

const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export function PhleboEnquiries() {
  const [phlebos, setPhlebos] = useState<Phlebo[]>(MOCK_PHLEBOS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [viewPhlebo, setViewPhlebo] = useState<Phlebo | null>(null);
  const [approveTarget, setApproveTarget] = useState<Phlebo | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Phlebo | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleApprove() {
    if (!approveTarget) return;
    setPhlebos(prev => prev.map(p => p.id === approveTarget.id ? { ...p, status: 'approved' as Status } : p));
    showToast(`${approveTarget.name} has been approved`);
    setApproveTarget(null);
  }

  function handleReject() {
    if (!rejectTarget) return;
    setPhlebos(prev => prev.map(p => p.id === rejectTarget.id ? { ...p, status: 'rejected' as Status } : p));
    showToast(`${rejectTarget.name} has been rejected`);
    setRejectTarget(null);
    setRejectReason('');
  }

  const filtered = phlebos.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.phone.includes(search)) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (cityFilter !== 'all' && p.city !== cityFilter) return false;
    return true;
  });

  const cities = [...new Set(phlebos.map(p => p.city))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phlebo Enquiries</h1>
        <p className="text-sm text-gray-500 mt-1">Manage phlebotomist applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or phone..."
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
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Areas</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Experience</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Applied</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 px-4 text-gray-600">{p.phone}</td>
                  <td className="py-3 px-4 text-gray-500">{p.city}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">{p.areas}</td>
                  <td className="py-3 px-4 text-gray-500">{p.experience}</td>
                  <td className="py-3 px-4 text-gray-500">{p.applied}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewPhlebo(p)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">View</button>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => setApproveTarget(p)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">Approve</button>
                          <button onClick={() => setRejectTarget(p)} className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No phlebotomists found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewPhlebo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-10 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 mb-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Phlebotomist Details</h2>
              <button onClick={() => setViewPhlebo(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[viewPhlebo.status]}`}>{viewPhlebo.status}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {([
                  ['Name', viewPhlebo.name],
                  ['Phone', viewPhlebo.phone],
                  ['Email', viewPhlebo.email],
                  ['Gender', viewPhlebo.gender],
                  ['Aadhaar', viewPhlebo.aadhaar],
                  ['Address', viewPhlebo.address],
                  ['City', viewPhlebo.city],
                  ['Experience', viewPhlebo.experience],
                  ['Availability', viewPhlebo.availability],
                  ['Shift Preference', viewPhlebo.shift],
                  ['Vehicle', viewPhlebo.vehicle],
                  ['Bank Account', viewPhlebo.bank],
                  ['Zones', viewPhlebo.zones],
                  ['Skills', viewPhlebo.skills],
                  ['Areas', viewPhlebo.areas],
                  ['Applied', viewPhlebo.applied],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-gray-500 font-medium">{label}</div>
                    <div className="text-gray-900 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              {viewPhlebo.status === 'pending' && (
                <>
                  <button onClick={() => { setViewPhlebo(null); setApproveTarget(viewPhlebo); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Approve</button>
                  <button onClick={() => { setViewPhlebo(null); setRejectTarget(viewPhlebo); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Reject</button>
                </>
              )}
              <button onClick={() => setViewPhlebo(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Approve Phlebotomist</h2>
              <button onClick={() => setApproveTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">Are you sure you want to approve <strong>{approveTarget.name}</strong>?</p>
              <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-800 space-y-1">
                <div className="font-semibold mb-2">This will:</div>
                <div>&#x2022; Activate their phlebotomist app account</div>
                <div>&#x2022; Enable them to start home collections</div>
                <div>&#x2022; Send WhatsApp notification to {approveTarget.phone}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => setApproveTarget(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
              <button onClick={handleApprove} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Confirm Approval</button>
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
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
