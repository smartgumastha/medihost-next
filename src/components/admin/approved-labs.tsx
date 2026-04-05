// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
"use client";

import { useState } from 'react';

interface ApprovedLab {
  id: number;
  name: string;
  subdomain: string;
  nabl: boolean;
  orders: number;
  rating: number;
  joined: string;
  active: boolean;
}

const MOCK_APPROVED: ApprovedLab[] = [
  { id: 3, name: 'QuickTest Path', subdomain: 'quicktest', nabl: false, orders: 87, rating: 4.5, joined: '10 Mar 2026', active: true },
];

export function ApprovedLabs() {
  const [labs, setLabs] = useState<ApprovedLab[]>(MOCK_APPROVED);
  const [search, setSearch] = useState('');
  const [viewLab, setViewLab] = useState<ApprovedLab | null>(null);

  const filtered = labs.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.subdomain.includes(search.toLowerCase())
  );

  function toggleActive(id: number) {
    setLabs(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approved Labs</h1>
        <p className="text-sm text-gray-500 mt-1">Manage active lab partners</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by lab name or subdomain..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-64"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Active</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Lab Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Subdomain</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">NABL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Orders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(l.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${l.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${l.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{l.name}</td>
                  <td className="py-3 px-4">
                    <a href={`https://${l.subdomain}.medihost.in`} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-800 hover:underline font-medium">
                      {l.subdomain}.medihost.in
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    {l.nabl ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">NABL</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{l.orders}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <span className="text-amber-500">&#9733;</span> {l.rating}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{l.joined}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => setViewLab(l)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No approved labs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewLab && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Lab Details</h2>
              <button onClick={() => setViewLab(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-gray-500 font-medium">Lab Name</div><div className="text-gray-900 mt-0.5">{viewLab.name}</div></div>
                <div><div className="text-gray-500 font-medium">Subdomain</div><div className="text-gray-900 mt-0.5">{viewLab.subdomain}.medihost.in</div></div>
                <div><div className="text-gray-500 font-medium">NABL</div><div className="text-gray-900 mt-0.5">{viewLab.nabl ? 'Certified' : 'Not certified'}</div></div>
                <div><div className="text-gray-500 font-medium">Orders</div><div className="text-gray-900 mt-0.5">{viewLab.orders}</div></div>
                <div><div className="text-gray-500 font-medium">Rating</div><div className="text-gray-900 mt-0.5"><span className="text-amber-500">&#9733;</span> {viewLab.rating}</div></div>
                <div><div className="text-gray-500 font-medium">Joined</div><div className="text-gray-900 mt-0.5">{viewLab.joined}</div></div>
                <div><div className="text-gray-500 font-medium">Status</div><div className="text-gray-900 mt-0.5">{viewLab.active ? 'Active' : 'Inactive'}</div></div>
              </div>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-200">
              <button onClick={() => setViewLab(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
