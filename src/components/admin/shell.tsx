"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { type AuthUser } from '@/lib/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Partners', href: '/admin/partners' },
  { label: 'Plans & Pricing', href: '/admin/pricing' },
  { label: 'Coupons', href: '/admin/offers' },
  { label: 'Campaigns', href: '/admin/campaigns' },
  { label: 'Automation Rules', href: '/admin/triggers' },
  { label: 'Email Logs', href: '/admin/email-logs' },
  { label: 'Domains', href: '/admin/domains' },
  { label: 'Domain Settings', href: '/admin/domain-settings' },
  { label: 'Resellers', href: '/admin/resellers' },
  { label: 'Reseller Settings', href: '/admin/reseller-settings' },
  { label: 'Payments & Revenue', href: '/admin/revenue' },
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
      <nav className="fixed top-0 left-0 right-0 z-50 h-14" style={{ backgroundColor: '#26215C' }}>
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white/70 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <a href="/admin" className="flex items-center gap-2.5">
              <span className="text-lg font-extrabold tracking-tight text-white">
                MediHost<span className="text-[10px] align-super font-bold text-white/40">™</span> AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 px-2 py-0.5 rounded-md" style={{ backgroundColor: '#534AB7' }}>Super admin</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex gap-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10"
            >
              <span>←</span> Dashboard
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: '#534AB7' }} className="text-white text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-white/80 hidden sm:block">{user.name}</span>
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

      {/* Sidebar — premium purple */}
      <aside
        className={`fixed top-14 left-0 bottom-0 w-[240px] z-40 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ backgroundColor: '#2E1065' }}
      >
        <nav style={{ padding: '12px 0' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="block transition-all"
                style={{
                  padding: '10px 20px', margin: '0 8px 2px 8px', borderRadius: 8,
                  fontSize: 14, fontWeight: isActive ? 600 : 450,
                  color: isActive ? '#fff' : '#C4B5FD',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #A78BFA' : '3px solid transparent',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[240px] pt-14 min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
