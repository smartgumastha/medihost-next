import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';

export const metadata = { title: 'Dashboard — MediHost' };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  const name = user?.name || 'Partner';
  const role = user?.role?.replace(/_/g, ' ') || 'Admin';

  // Setup progress simulation (in real app, derive from actual data)
  const setupSteps = [
    { label: 'Profile', done: true },
    { label: 'Website', done: false },
    { label: 'Domain', done: false },
    { label: 'Doctors', done: false },
    { label: 'Go Live', done: false },
  ];
  const completedCount = setupSteps.filter(s => s.done).length;
  const progressPercent = Math.round((completedCount / setupSteps.length) * 100);
  const setupComplete = completedCount === setupSteps.length;

  const stats = [
    { label: 'Profile Views', value: '0', trend: null, note: 'After go-live', color: 'border-l-emerald-500', trendColor: '' },
    { label: 'Bookings', value: '0', trend: null, note: 'After go-live', color: 'border-l-blue-500', trendColor: '' },
    { label: 'Google Reviews', value: '0', trend: null, note: 'After go-live', color: 'border-l-amber-500', trendColor: '' },
    { label: 'Website Visits', value: '0', trend: null, note: 'After go-live', color: 'border-l-violet-500', trendColor: '' },
  ];

  const quickActions = [
    {
      label: 'Create Website',
      icon: '⭐',
      href: '/dashboard/website',
      desc: 'Build your clinic website in minutes',
    },
    {
      label: 'Setup Domain',
      icon: '🌐',
      href: '/dashboard/domain',
      desc: 'Connect your custom domain name',
    },
    {
      label: 'Add Doctors',
      icon: '⚕️',
      href: '/dashboard/doctors',
      desc: 'Add your team of doctors',
    },
    {
      label: 'Add Tests',
      icon: '💊',
      href: '/dashboard/products',
      desc: 'List tests and services you offer',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ─── Welcome Card ─── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center">
          {/* Emerald accent bar */}
          <div className="w-1 self-stretch bg-gradient-to-b from-emerald-400 to-emerald-600 shrink-0" />
          <div className="flex items-center justify-between flex-1 p-5 sm:p-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back, {name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your clinic control center
              </p>
              <span className="inline-block mt-2 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {role}
              </span>
            </div>
            <a
              href="https://app.hemato.in"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Open Clinic Software
            </a>
          </div>
        </div>
      </div>

      {/* ─── Quick Setup Card ─── */}
      {!setupComplete && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Setup your clinic
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {completedCount} of {setupSteps.length} steps completed
                </p>
              </div>
              <a
                href="/dashboard/profile"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Continue Setup
              </a>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-0">
              {setupSteps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                        step.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {step.done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium ${step.done ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < setupSteps.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-1 mt-[-14px] ${step.done ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-lg border border-gray-200 border-l-4 ${stat.color} p-4`}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">{stat.label}</div>
            <div className="text-[10px] text-gray-400 mt-2">{stat.note}</div>
          </div>
        ))}
      </div>

      {/* ─── Quick Actions Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="group bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-2xl mb-3">{action.icon}</div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
              {action.label}
            </div>
            <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
          </a>
        ))}
      </div>

      {/* ─── Recent Activity ─── */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="text-3xl mb-3 opacity-40">📋</div>
          <p className="text-sm text-gray-400">
            No recent activity yet — complete your setup to get started
          </p>
        </div>
      </div>
    </div>
  );
}
