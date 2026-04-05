"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { type AuthUser } from '@/lib/auth';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: '📊', href: '/admin' },
    ]
  },
  {
    title: 'PARTNERS',
    items: [
      { label: 'All Partners', icon: '👥', href: '/admin/partners' },
    ]
  },
  {
    title: 'WEBSITES & DOMAINS',
    items: [
      { label: 'Websites', icon: '🌐', href: '/admin/websites' },
      { label: 'Domains', icon: '🔗', href: '/admin/domains' },
    ]
  },
  {
    title: 'HEMATO',
    items: [
      { label: 'Dashboard', icon: '🩸', href: '/admin/hemato' },
      { label: 'Phlebo Enquiries', icon: '🏍️', href: '/admin/hemato/phlebos' },
      { label: 'Lab Enquiries', icon: '🔬', href: '/admin/hemato/labs' },
      { label: 'Approved Phlebos', icon: '✅', href: '/admin/hemato/approved-phlebos' },
      { label: 'Approved Labs', icon: '🏢', href: '/admin/hemato/approved-labs' },
    ]
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Pricing', icon: '💰', href: '/admin/pricing' },
      { label: 'Offers', icon: '🎟️', href: '/admin/offers' },
    ]
  },
];

export function AdminShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <a href="/admin" className="flex items-center gap-2.5">
              <span className="text-lg font-extrabold tracking-tight text-gray-900">
                MediHost AI<span className="text-[10px] align-super font-bold text-gray-400">™</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">Admin</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex gap-1.5 text-xs text-gray-500 hover:text-gray-900"
            >
              <span>←</span> View Dashboard
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar — Dark */}
      <aside className={`fixed top-14 left-0 bottom-0 w-[260px] z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ backgroundColor: '#1A1A2E' }}>
        {/* Sidebar header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm font-extrabold shadow-lg shadow-red-600/30">M</div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">MediHost Admin</div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="py-3">
          {NAV_SECTIONS.map(section => (
            <div key={section.title} className="mb-1">
              <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(248,113,113,0.5)' }}>{section.title}</div>
              <ul className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'text-white border-l-[3px] border-l-red-500 bg-white/10'
                            : 'text-gray-300 border-l-[3px] border-l-transparent hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'rgba(248,113,113,0.4)' }}>Role</div>
          <div className="text-xs font-semibold text-gray-300 mt-0.5">{user.role.replace(/_/g, ' ')}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] pt-14 min-h-screen">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
