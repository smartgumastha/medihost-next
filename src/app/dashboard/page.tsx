import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';

export const metadata = { title: 'Dashboard — MediHost' };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  const name = user?.name || 'Partner';

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome back, {name}!</h1>
            <p className="text-emerald-100 text-sm">Your clinic control center</p>
            <div className="flex gap-2 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">{user?.role?.replace(/_/g, ' ') || 'Admin'}</span>
            </div>
          </div>
          <a
            href="https://app.hemato.in"
            target="_blank"
            className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all"
          >
            🏥 Open Clinic Software
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Profile Views', value: '0', note: 'After go-live' },
          { label: 'Bookings', value: '0', note: 'After go-live' },
          { label: 'Google Reviews', value: '0', note: 'After go-live' },
          { label: 'Website Visits', value: '0', note: 'After go-live' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs font-semibold text-gray-400 mt-1">{stat.label}</div>
            <div className="text-[10px] text-gray-300 mt-2 italic">{stat.note}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Create Website', icon: '⭐', href: '/dashboard/website', color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Setup Domain', icon: '🌐', href: '/dashboard/domain', color: 'bg-blue-50 text-blue-700' },
            { label: 'Add Doctors', icon: '⚕️', href: '/dashboard/doctors', color: 'bg-purple-50 text-purple-700' },
            { label: 'Add Tests', icon: '💊', href: '/dashboard/products', color: 'bg-amber-50 text-amber-700' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`${action.color} rounded-xl p-4 text-center hover:shadow-md transition-all`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-xs font-bold">{action.label}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
