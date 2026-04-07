"use client";

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { canAccess, type AuthUser, type DashboardPage } from '@/lib/auth';

interface NavItem {
  page: DashboardPage;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

interface ComingSoonItem {
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  comingSoon?: ComingSoonItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [
      { page: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
      { page: 'profile', label: 'My Profile', icon: '👤', href: '/dashboard/profile' },
    ],
  },
  {
    title: 'Online Presence',
    items: [
      { page: 'website', label: 'My Website', icon: '⭐', href: '/dashboard/website' },
      { page: 'domain', label: 'Domain', icon: '🌐', href: '/dashboard/domain' },
    ],
  },
  {
    title: 'Clinic',
    items: [
      { page: 'doctors', label: 'My Doctors', icon: '⚕️', href: '/dashboard/doctors' },
      { page: 'products', label: 'Tests & Services', icon: '💊', href: '/dashboard/products' },
    ],
  },
  {
    title: 'HMS Modules',
    items: [
      { page: 'opd', label: 'OPD Queue', icon: '🏥', href: '/dashboard/hms?module=opd' },
      { page: 'emr', label: 'EMR', icon: '📋', href: '/dashboard/hms?module=emr' },
      { page: 'billing', label: 'Billing', icon: '🧾', href: '/dashboard/hms?module=billing' },
      { page: 'lis', label: 'LIS', icon: '🔬', href: '/dashboard/hms?module=lis', badge: 'NABL', badgeColor: 'blue' },
      { page: 'pharmacy', label: 'Pharmacy', icon: '💊', href: '/dashboard/hms?module=pharmacy', badge: 'Pro', badgeColor: 'amber' },
      { page: 'appointments', label: 'Appointments', icon: '📅', href: '/dashboard/hms?module=appointments' },
    ],
    comingSoon: [
      { label: 'IPD Management', icon: '🛏️' },
      { label: 'Nursing Station', icon: '👩‍⚕️' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { page: 'marketing', label: 'Marketing (AI)', icon: '📢', href: '/dashboard/marketing' },
      { page: 'analytics', label: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { page: 'staff', label: 'Staff & Roles', icon: '👥', href: '/dashboard/staff' },
      { page: 'settings', label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
      { page: 'plan', label: 'Plan & Billing', icon: '💎', href: '/dashboard/plan' },
    ],
  },
];

const COMING_SOON_GLOBAL: ComingSoonItem[] = [
  { label: 'Floor Manager', icon: '🏢' },
  { label: 'Stores & Inventory', icon: '📦' },
  { label: 'HR & Payroll', icon: '💰' },
];

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentModule = searchParams.get('module') || '';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const [hmsLoading, setHmsLoading] = useState(false);

  async function openClinicSoftware() {
    setHmsLoading(true);
    try {
      const res = await fetch('/api/auth/hms-token', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.hms_token) {
        const loginData = encodeURIComponent(JSON.stringify({
          token: data.hms_token,
          hospitalId: String(data.hospital_id || ''),
          userid: String(data.user_id || ''),
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          role: data.role || 'HOSPITAL_ADMIN',
          role_id: 2,
        }));
        const hmsUrl = `https://app.hemato.in?mw_token=${encodeURIComponent(data.hms_token)}&mw_hospital_id=${encodeURIComponent(data.hospital_id || '')}&mw_login_data=${loginData}`;
        window.open(hmsUrl, '_blank');
      } else {
        // No HMS token — open HMS directly, user will need to login there
        window.open('https://app.hemato.in', '_blank');
      }
    } catch {
      window.open('https://app.hemato.in', '_blank');
    } finally {
      setHmsLoading(false);
    }
  }

  const [comingSoonToast, setComingSoonToast] = useState('');

  function showComingSoon() {
    setComingSoonToast('This module is coming soon. We\u2019ll notify you when it\u2019s ready.');
    setTimeout(function() { setComingSoonToast(''); }, 3000);
  }

  // Filter sections to only include items the user can access
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => canAccess(user.role, item.page)),
  })).filter(section => section.items.length > 0 || (section.comingSoon && section.comingSoon.length > 0));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F7' }}>
      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
            <a href="/dashboard" className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold text-gray-900 tracking-tight">
                MediHost<span className="text-[10px] font-semibold text-gray-400 align-super">&trade;</span> AI
              </span>
              <span className="relative flex h-2 w-2 -mt-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </a>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openClinicSoftware}
              disabled={hmsLoading}
              className="hidden sm:flex text-xs font-medium h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {hmsLoading ? 'Opening...' : '🏥 Clinic Software'}
            </Button>

            {/* Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
                  {user.name}
                </span>
                <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="text-sm">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/plan')} className="text-sm">
                  Plan & Billing
                </DropdownMenuItem>
                {(user.role === 'SUPER_ADMIN' || user.role === 'HOSPITAL_ADMIN') && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="text-sm">
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <div className="border-t border-gray-100" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 text-sm">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* ─── Mobile overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-14 left-0 bottom-0 w-[240px] z-40 overflow-y-auto transition-transform duration-200 ease-in-out pb-4 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)' }}
      >
        {/* Store name + plan */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            {user.name || 'My Clinic'}
          </div>
          <span className="inline-block mt-1 text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {user.role?.replace(/_/g, ' ') || 'Admin'}
          </span>
        </div>

        {/* Navigation sections */}
        <nav className="py-2">
          {visibleSections.map((section, sIdx) => (
            <div key={section.title}>
              {sIdx > 0 && <div className="mx-4 mt-3 mb-1 border-t border-white/5" />}
              <div className="px-4 mt-3 mb-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
              <ul className="space-y-0.5 px-2">
                {section.items.map(item => {
                  const hrefPath = item.href.split('?')[0];
                  const hrefModule = item.href.includes('module=') ? item.href.split('module=')[1] : '';
                  const isActive = hrefModule
                    ? (pathname === '/dashboard/hms' && currentModule === hrefModule)
                    : (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(hrefPath)));
                  return (
                    <li key={item.page}>
                      <a
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all relative ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-emerald-400" />
                        )}
                        <span className="text-base leading-none">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            item.badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
                {/* Section-specific coming soon items */}
                {section.comingSoon?.map(item => (
                  <li key={item.label}>
                    <button
                      onClick={showComingSoon}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg text-slate-600 hover:bg-white/5 transition-all w-full text-left"
                    >
                      <span className="text-base leading-none opacity-40">{item.icon}</span>
                      <span className="flex-1 opacity-50">{item.label}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-600 border border-white/10">
                        Soon
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Global coming soon section */}
          <div className="mx-4 mt-3 mb-1 border-t border-white/5" />
          <div className="px-4 mt-3 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Coming Soon</span>
          </div>
          <ul className="space-y-0.5 px-2">
            {COMING_SOON_GLOBAL.map(item => (
              <li key={item.label}>
                <button
                  onClick={showComingSoon}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg text-slate-600 hover:bg-white/5 transition-all w-full text-left"
                >
                  <span className="text-base leading-none opacity-40">{item.icon}</span>
                  <span className="flex-1 opacity-50">{item.label}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-600 border border-white/10">
                    Soon
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

      </aside>

      {/* ─── Main content ─── */}
      <main className="lg:ml-[240px] pt-14 min-h-screen">
        <div className="p-6 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      {/* Coming soon toast */}
      {comingSoonToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-lg border border-white/10 animate-[fadeInUp_0.2s_ease-out]">
          {comingSoonToast}
        </div>
      )}
    </div>
  );
}
