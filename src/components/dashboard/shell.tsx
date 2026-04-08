"use client";

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { type AuthUser } from '@/lib/auth';

interface SidebarItem {
  label: string;
  letter: string;
  href?: string;
  external?: string;
  badge?: 'soon' | 'pro';
  iconBg: string;
  iconColor: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SECTIONS: SidebarSection[] = [
  {
    title: 'PRESENCE',
    items: [
      { label: 'My website', letter: 'W', href: '/dashboard/website', iconBg: '#E1F5EE', iconColor: '#0F6E56' },
      { label: 'My domain', letter: 'D', href: '/dashboard/domain', iconBg: '#E1F5EE', iconColor: '#0F6E56' },
      { label: 'Google Business', letter: 'G', badge: 'soon', iconBg: '#F1EFE8', iconColor: '#5F5E5A' },
      { label: 'Reviews', letter: 'R', badge: 'soon', iconBg: '#F1EFE8', iconColor: '#5F5E5A' },
    ],
  },
  {
    title: 'CLINIC (HMS)',
    items: [
      { label: 'OPD', letter: 'O', external: 'https://app.hemato.in', iconBg: '#E6F1FB', iconColor: '#185FA5' },
      { label: 'Billing', letter: 'B', external: 'https://app.hemato.in', iconBg: '#E6F1FB', iconColor: '#185FA5' },
      { label: 'EMR', letter: 'E', external: 'https://app.hemato.in', iconBg: '#E6F1FB', iconColor: '#185FA5' },
      { label: 'LIS', letter: 'L', badge: 'pro', iconBg: '#E6F1FB', iconColor: '#185FA5' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Plan & billing', letter: 'P', href: '/dashboard/plan', iconBg: '#EEEDFE', iconColor: '#534AB7' },
      { label: 'My profile', letter: 'M', href: '/dashboard/profile', iconBg: '#EEEDFE', iconColor: '#534AB7' },
      { label: 'Team', letter: 'T', href: '/dashboard/team', iconBg: '#EEEDFE', iconColor: '#534AB7' },
      { label: 'Settings', letter: 'S', href: '/dashboard/settings', iconBg: '#EEEDFE', iconColor: '#534AB7' },
    ],
  },
];

function getPlanBadge(tier?: string): { bg: string; color: string; label: string } {
  if (!tier || tier === 'starter') return { bg: '#E1F5EE', color: '#0F6E56', label: 'Free' };
  if (tier === 'growth' || tier === 'professional' || tier === 'enterprise') return { bg: '#E6F1FB', color: '#185FA5', label: tier.charAt(0).toUpperCase() + tier.slice(1) };
  return { bg: '#FAEEDA', color: '#854F0B', label: 'Trial' };
}

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHmsPage = pathname === '/dashboard/hms';
  const currentModule = searchParams.get('module') || '';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const [hmsLoading, setHmsLoading] = useState(false);

  async function openClinicSoftware() {
    setHmsLoading(true);
    try {
      var res = await fetch('/api/auth/hms-token', { method: 'POST' });
      var data = await res.json();
      if (data.success && data.hms_token) {
        var loginData = encodeURIComponent(JSON.stringify({
          token: data.hms_token, hospitalId: String(data.hospital_id || ''),
          userid: String(data.user_id || ''), first_name: data.first_name || '',
          last_name: data.last_name || '', email: data.email || '',
          role: data.role || 'HOSPITAL_ADMIN', role_id: 2,
        }));
        window.open('https://app.hemato.in?mw_token=' + encodeURIComponent(data.hms_token) + '&mw_hospital_id=' + encodeURIComponent(data.hospital_id || '') + '&mw_login_data=' + loginData, '_blank');
      } else {
        window.open('https://app.hemato.in', '_blank');
      }
    } catch {
      window.open('https://app.hemato.in', '_blank');
    } finally {
      setHmsLoading(false);
    }
  }

  var planBadge = getPlanBadge(user.plan_tier);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F7' }}>
      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-12" style={{ backgroundColor: '#085041' }}>
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white/60 hover:text-white p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
            <a href="/dashboard" className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>MediHost</span>
              <span style={{ fontSize: 11, color: '#9FE1CB' }}>{user.name || 'My Clinic'}</span>
            </a>
            <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: planBadge.bg, color: planBadge.color, padding: '2px 6px', borderRadius: 4 }}>
              {planBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user.is_super_admin && (
              <a href="/admin" style={{ fontSize: 10, color: '#9FE1CB', padding: '3px 8px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} className="hidden sm:block hover:bg-white/20 transition-colors">
                Admin Panel
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 hover:bg-white/10 rounded-lg px-2 py-1 cursor-pointer">
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: '#9FE1CB' }} className="hidden sm:block">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="text-xs">My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/plan')} className="text-xs">Plan & Billing</DropdownMenuItem>
                {user.is_super_admin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="text-xs">Admin Panel</DropdownMenuItem>
                )}
                <div className="border-t border-gray-100" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 text-xs">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Floating HMS nav (only on HMS pages) ─── */}
      {isHmsPage && (
        <div className="fixed top-16 left-3 z-50 flex flex-col gap-1.5">
          <a href="/dashboard" className="w-9 h-9 bg-[#0F172A] border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 text-sm font-bold shadow-lg hover:bg-emerald-500/20 transition-all" title="Back to Dashboard">M</a>
          {[{ mod: 'opd', label: 'OPD' }, { mod: 'emr', label: 'EMR' }, { mod: 'billing', label: 'Billing' }, { mod: 'lis', label: 'LIS' }].map(function (item) {
            var active = currentModule === item.mod;
            return (
              <a key={item.mod} href={'/dashboard/hms?module=' + item.mod}
                className={'w-9 h-9 bg-[#0F172A] border rounded-xl flex items-center justify-center text-xs font-bold shadow-lg transition-all ' + (active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/10 hover:bg-white/10 text-white/60')}
                title={item.label}>{item.label.charAt(0)}</a>
            );
          })}
        </div>
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-12 left-0 bottom-0 z-40 overflow-y-auto transition-transform duration-200 ${
          isHmsPage ? '-translate-x-full' : (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
        style={{ width: 172, backgroundColor: '#FAFAF9', borderRight: '0.5px solid #E5E5E3' }}
      >
        <nav style={{ padding: '8px 6px' }}>
          {SECTIONS.map((section, sIdx) => (
            <div key={section.title} style={{ marginTop: sIdx > 0 ? 12 : 4 }}>
              <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A1A09E', padding: '0 6px', marginBottom: 4 }}>
                {section.title}
              </div>
              {section.items.map(item => {
                var isActive = item.href ? (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) : false;
                var isDisabled = !item.href && !item.external;

                function handleClick(e: React.MouseEvent) {
                  if (item.external) {
                    e.preventDefault();
                    openClinicSoftware();
                  }
                  if (isDisabled) e.preventDefault();
                  setSidebarOpen(false);
                }

                return (
                  <a
                    key={item.label}
                    href={item.href || '#'}
                    onClick={handleClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 8px',
                      borderRadius: 6,
                      marginBottom: 1,
                      fontSize: 11,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#0F6E56' : '#5F5E5A',
                      backgroundColor: isActive ? '#E1F5EE' : 'transparent',
                      textDecoration: 'none',
                      cursor: isDisabled ? 'default' : 'pointer',
                      opacity: isDisabled ? 0.6 : 1,
                    }}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, backgroundColor: item.iconBg, color: item.iconColor,
                      fontSize: 8, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {item.letter}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge === 'soon' && (
                      <span style={{ fontSize: 8, backgroundColor: '#F1EFE8', color: '#A1A09E', padding: '1px 5px', borderRadius: 8, marginLeft: 'auto' }}>soon</span>
                    )}
                    {item.badge === 'pro' && (
                      <span style={{ fontSize: 8, backgroundColor: '#FAEEDA', color: '#854F0B', padding: '1px 5px', borderRadius: 8, marginLeft: 'auto' }}>Pro</span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ─── Main content ─── */}
      <main className="min-h-screen transition-all duration-200" style={{ paddingTop: 48, marginLeft: isHmsPage ? 0 : 172 }}>
        <div className={isHmsPage ? '' : 'p-5 max-w-[1100px] mx-auto'}>
          {children}
        </div>
      </main>
    </div>
  );
}
