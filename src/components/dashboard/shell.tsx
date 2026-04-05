"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { canAccess, type AuthUser, type DashboardPage } from '@/lib/auth';

const NAV_ITEMS: { page: DashboardPage; label: string; icon: string; href: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { page: 'profile', label: 'My Profile', icon: '👤', href: '/dashboard/profile' },
  { page: 'website', label: 'My Website', icon: '⭐', href: '/dashboard/website' },
  { page: 'domain', label: 'Domain', icon: '🌐', href: '/dashboard/domain' },
  { page: 'doctors', label: 'My Doctors', icon: '⚕️', href: '/dashboard/doctors' },
  { page: 'products', label: 'Tests & Services', icon: '💊', href: '/dashboard/products' },
  { page: 'marketing', label: 'Marketing', icon: '📢', href: '/dashboard/marketing' },
  { page: 'analytics', label: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
  { page: 'plan', label: 'Plan & Billing', icon: '💎', href: '/dashboard/plan' },
];

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => canAccess(user.role, item.page));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function openClinicSoftware() {
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
        // No HMS token available — open HMS directly (user will need to log in there)
        window.open('https://app.hemato.in', '_blank');
      }
    } catch {
      window.open('https://app.hemato.in', '_blank');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <a href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-extrabold">M</div>
              <span className="text-lg font-extrabold text-gray-900">Medi<span className="text-emerald-600">Host</span></span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={openClinicSoftware} className="hidden sm:flex gap-2 text-xs">
              🏥 Open Clinic Software
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/plan')}>Plan & Billing</DropdownMenuItem>
                {(user.role === 'SUPER_ADMIN' || user.role === 'HOSPITAL_ADMIN') && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>Admin Panel</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-gray-200 z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="py-4">
          <ul className="space-y-0.5">
            {visibleItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <li key={item.page}>
                  <a
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors border-l-3 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-l-emerald-600 font-semibold'
                        : 'text-gray-600 border-l-transparent hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Role</div>
          <div className="text-xs font-semibold text-gray-600">{user.role.replace(/_/g, ' ')}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 pt-14 min-h-screen">
        <div className="p-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
