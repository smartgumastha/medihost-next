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
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <a href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm font-extrabold">M</div>
              <span className="text-lg font-extrabold text-gray-900">Medi<span className="text-red-600">Host</span> <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Admin</span></span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="hidden sm:flex gap-2 text-xs">
              📊 Dashboard
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-700 text-xs font-bold">
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
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-14 left-0 bottom-0 w-65 bg-white border-r border-gray-200 z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="py-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.title} className="mb-2">
              <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{section.title}</div>
              <ul className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors border-l-3 ${
                          isActive
                            ? 'bg-red-50 text-red-700 border-l-red-600 font-semibold'
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
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Role</div>
          <div className="text-xs font-semibold text-gray-600">{user.role.replace(/_/g, ' ')}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-65 pt-14 min-h-screen">
        <div className="p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
