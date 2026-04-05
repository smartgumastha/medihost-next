"use client";

import { useState } from 'react';

const STATS = [
  { label: 'Phlebo Applications', value: '5', sub: '3 pending / 1 approved / 1 rejected', color: 'bg-rose-50 text-rose-700' },
  { label: 'Lab Applications', value: '4', sub: '2 pending / 1 approved / 1 rejected', color: 'bg-amber-50 text-amber-700' },
  { label: 'Active Phlebotomists', value: '1', sub: 'Currently collecting', color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Active Labs', value: '1', sub: 'Currently processing', color: 'bg-blue-50 text-blue-700' },
];

const WEEKLY_DATA = [
  { week: 'Week 1', count: 3 },
  { week: 'Week 2', count: 5 },
  { week: 'Week 3', count: 2 },
  { week: 'Week 4', count: 7 },
  { week: 'Week 5', count: 4 },
  { week: 'Week 6', count: 6 },
];

const AREA_DATA = [
  { area: 'Madhapur', count: 8 },
  { area: 'Gachibowli', count: 6 },
  { area: 'Kondapur', count: 5 },
  { area: 'Kukatpally', count: 4 },
  { area: 'Begumpet', count: 3 },
  { area: 'Secunderabad', count: 2 },
];

const PENDING_APPLICATIONS = [
  { type: 'Phlebo', name: 'Rajesh Kumar', phone: '+91 98765 43210', city: 'Hyderabad', applied: '2 days ago', link: '/admin/hemato/phlebos' },
  { type: 'Phlebo', name: 'Srinivas Reddy', phone: '+91 87654 32109', city: 'Hyderabad', applied: '3 days ago', link: '/admin/hemato/phlebos' },
  { type: 'Lab', name: 'LifeCare Diagnostics', phone: '+91 40 2345 6789', city: 'Hyderabad', applied: '1 day ago', link: '/admin/hemato/labs' },
  { type: 'Phlebo', name: 'Priya Sharma', phone: '+91 76543 21098', city: 'Hyderabad', applied: '4 days ago', link: '/admin/hemato/phlebos' },
  { type: 'Lab', name: 'MedScan Labs', phone: '+91 40 3456 7890', city: 'Hyderabad', applied: '5 days ago', link: '/admin/hemato/labs' },
];

export function HematoDashboard() {
  const maxWeekly = Math.max(...WEEKLY_DATA.map(w => w.count));
  const maxArea = Math.max(...AREA_DATA.map(a => a.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hemato Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Phlebotomist & Lab partner applications overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</div>
            <div className={`text-xs font-medium mt-2 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Applications Over Time */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Applications Over Time</h3>
          <div className="flex items-end gap-3 h-40">
            {WEEKLY_DATA.map(item => (
              <div key={item.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-700">{item.count}</span>
                <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-t"
                    style={{ height: `${(item.count / maxWeekly) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{item.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications by Area */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Applications by Area</h3>
          <div className="space-y-3">
            {AREA_DATA.map(item => (
              <div key={item.area} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 font-medium">{item.area}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.count / maxArea) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Pending Applications */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Recent Pending Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Name</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Phone</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">City</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Applied</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_APPLICATIONS.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      row.type === 'Lab' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>{row.type}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{row.name}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.phone}</td>
                  <td className="py-2.5 px-3 text-gray-500">{row.city}</td>
                  <td className="py-2.5 px-3 text-gray-500">{row.applied}</td>
                  <td className="py-2.5 px-3">
                    <a href={row.link} className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline">Review</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
