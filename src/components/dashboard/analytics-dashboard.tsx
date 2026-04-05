'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close">
        {'\u00d7'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STATS = [
  { label: 'Website Visits', value: '247', trend: '+12%', trendUp: true, icon: 'globe' },
  { label: 'Appointments', value: '38', trend: '+8%', trendUp: true, icon: 'calendar' },
  { label: 'Avg Rating', value: '4.6', trend: '+0.2', trendUp: true, icon: 'star' },
  { label: 'New Patients', value: '15', trend: '-3%', trendUp: false, icon: 'users' },
] as const;

const VISIT_DATA = [
  { day: 'Mon', value: 32 },
  { day: 'Tue', value: 45 },
  { day: 'Wed', value: 28 },
  { day: 'Thu', value: 52 },
  { day: 'Fri', value: 41 },
  { day: 'Sat', value: 38 },
  { day: 'Sun', value: 11 },
];

const APPOINTMENT_DATA = [
  { day: 'Mon', value: 8 },
  { day: 'Tue', value: 12 },
  { day: 'Wed', value: 6 },
  { day: 'Thu', value: 14 },
  { day: 'Fri', value: 10 },
  { day: 'Sat', value: 9 },
  { day: 'Sun', value: 2 },
];

const TRAFFIC_SOURCES = [
  { source: 'Google', percent: 42, color: 'bg-blue-500' },
  { source: 'Direct', percent: 28, color: 'bg-emerald-500' },
  { source: 'WhatsApp', percent: 18, color: 'bg-green-500' },
  { source: 'Facebook', percent: 8, color: 'bg-blue-600' },
  { source: 'Other', percent: 4, color: 'bg-gray-400' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AnalyticsDashboard({ user }: { user: AuthUser | null }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  const businessName = user?.name || 'Your Business';

  const SEARCH_TERMS = [
    { term: 'clinic near me', count: 45 },
    { term: businessName.toLowerCase(), count: 32 },
    { term: 'blood test ' + (user?.hospitalId ? user.hospitalId.split('-').pop() : 'city'), count: 28 },
    { term: 'doctor appointment', count: 22 },
    { term: 'health checkup', count: 18 },
  ];

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-500">Not authenticated. Please log in again.</p>
        </CardContent>
      </Card>
    );
  }

  const visitMax = Math.max(...VISIT_DATA.map((d) => d.value));
  const apptMax = Math.max(...APPOINTMENT_DATA.map((d) => d.value));
  const searchMax = Math.max(...SEARCH_TERMS.map((t) => t.count));

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-sm text-gray-500">Track your online performance and patient engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    stat.trendUp ? 'bg-emerald-100' : 'bg-red-100'
                  }`}
                >
                  {stat.icon === 'globe' && <GlobeIcon className={`h-5 w-5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`} />}
                  {stat.icon === 'calendar' && <CalendarIcon className={`h-5 w-5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`} />}
                  {stat.icon === 'star' && <StarIcon className={`h-5 w-5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`} />}
                  {stat.icon === 'users' && <UsersIcon className={`h-5 w-5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`} />}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    stat.trendUp ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {stat.trendUp ? '\u2191' : '\u2193'} {stat.trend}
                </span>
                <span className="text-xs text-gray-400">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Website Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Website Visits (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
              {VISIT_DATA.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">{d.value}</span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500 transition-all"
                    style={{ height: `${(d.value / visitMax) * 160}px` }}
                  />
                  <span className="text-xs text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
              {APPOINTMENT_DATA.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">{d.value}</span>
                  <div
                    className="w-full rounded-t-md bg-purple-500 transition-all"
                    style={{ height: `${(d.value / apptMax) * 160}px` }}
                  />
                  <span className="text-xs text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Search Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Top Search Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SEARCH_TERMS.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.term}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(item.count / searchMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TRAFFIC_SOURCES.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${source.color}`} />
                    <span className="text-sm text-gray-700">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${source.color} transition-all`}
                        style={{ width: `${source.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-medium text-gray-900">{source.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
