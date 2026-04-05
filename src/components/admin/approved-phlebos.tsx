// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
"use client";

import { useState } from 'react';

interface ApprovedPhlebo {
  id: number;
  name: string;
  phone: string;
  zones: string;
  collections: number;
  rating: number;
  joined: string;
  active: boolean;
}

const MOCK_APPROVED: ApprovedPhlebo[] = [
  { id: 4, name: 'Ahmed Khan', phone: '+91 65432 10987', zones: 'Kondapur, Manikonda', collections: 145, rating: 4.8, joined: '15 Mar 2026', active: true },
];

export function ApprovedPhlebos() {
  const [phlebos, setPhlebos] = useState<ApprovedPhlebo[]>(MOCK_APPROVED);
  const [search, setSearch] = useState('');
  const [viewPhlebo, setViewPhlebo] = useState<ApprovedPhlebo | null>(null);

  const filtered = phlebos.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  function toggleActive(id: number) {
    setPhlebos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approved Phlebotomists</h1>
        <p className="text-sm text-gray-500 mt-1">Manage active phlebotomists</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or phone..."
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
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Zones</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Collections</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 px-4 text-gray-600">{p.phone}</td>
                  <td className="py-3 px-4 text-gray-500">{p.zones}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p.collections}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <span className="text-amber-500">&#9733;</span> {p.rating}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.joined}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => setViewPhlebo(p)} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No approved phlebotomists found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewPhlebo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Phlebotomist Details</h2>
              <button onClick={() => setViewPhlebo(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-gray-500 font-medium">Name</div><div className="text-gray-900 mt-0.5">{viewPhlebo.name}</div></div>
                <div><div className="text-gray-500 font-medium">Phone</div><div className="text-gray-900 mt-0.5">{viewPhlebo.phone}</div></div>
                <div><div className="text-gray-500 font-medium">Zones</div><div className="text-gray-900 mt-0.5">{viewPhlebo.zones}</div></div>
                <div><div className="text-gray-500 font-medium">Collections</div><div className="text-gray-900 mt-0.5">{viewPhlebo.collections}</div></div>
                <div><div className="text-gray-500 font-medium">Rating</div><div className="text-gray-900 mt-0.5"><span className="text-amber-500">&#9733;</span> {viewPhlebo.rating}</div></div>
                <div><div className="text-gray-500 font-medium">Joined</div><div className="text-gray-900 mt-0.5">{viewPhlebo.joined}</div></div>
                <div><div className="text-gray-500 font-medium">Status</div><div className="text-gray-900 mt-0.5">{viewPhlebo.active ? 'Active' : 'Inactive'}</div></div>
              </div>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-200">
              <button onClick={() => setViewPhlebo(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
