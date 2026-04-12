"use client";

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { type AuthUser } from '@/lib/auth';
import { TrialBar } from '@/components/dashboard/trial-bar';
import { FeatureLockModal, LOCK_CONFIGS } from '@/components/dashboard/feature-lock-modal';

interface SidebarItem {
  label: string;
  letter: string;
  href?: string;
  external?: string;
  badge?: 'soon' | 'pro' | 'growth';
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
      { label: 'My website', letter: 'W', href: '/dashboard/website', iconBg: '#ECFDF5', iconColor: '#059669' },
      { label: 'My domain', letter: 'D', href: '/dashboard/domain', iconBg: '#ECFDF5', iconColor: '#059669' },
    ],
  },
  {
    title: 'AI MARKETING ENGINE',
    items: [
      { label: 'Marketing setup', letter: 'M', href: '/dashboard/marketing', iconBg: '#064E3B', iconColor: '#FFFFFF' },
      { label: 'Connections', letter: 'C', href: '/dashboard/connections', iconBg: '#059669', iconColor: '#FFFFFF' },
      { label: 'Brand studio', letter: 'B', href: '/dashboard/brand', badge: 'growth', iconBg: '#9333EA', iconColor: '#FFFFFF' },
      { label: 'Content studio', letter: 'C', href: '/dashboard/content', badge: 'growth', iconBg: '#2563EB', iconColor: '#FFFFFF' },
      { label: 'Social calendar', letter: 'S', href: '/dashboard/social', badge: 'growth', iconBg: '#DB2777', iconColor: '#FFFFFF' },
      { label: 'Reviews AI', letter: 'R', href: '/dashboard/reviews-ai', badge: 'growth', iconBg: '#F59E0B', iconColor: '#FFFFFF' },
      { label: 'SEO optimizer', letter: 'S', href: '/dashboard/seo', badge: 'pro', iconBg: '#0891B2', iconColor: '#FFFFFF' },
      { label: 'Ads manager', letter: 'A', href: '/dashboard/ads', badge: 'pro', iconBg: '#F97316', iconColor: '#FFFFFF' },
      { label: 'Lead pipeline', letter: 'L', href: '/dashboard/leads', badge: 'growth', iconBg: '#4F46E5', iconColor: '#FFFFFF' },
      { label: 'Analytics', letter: 'A', href: '/dashboard/analytics', badge: 'growth', iconBg: '#E11D48', iconColor: '#FFFFFF' },
    ],
  },
  {
    title: 'EARN',
    items: [
      { label: 'Refer & earn', letter: 'R', href: '/dashboard/referral', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
      { label: 'My commissions', letter: '$', href: '/dashboard/commissions', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    ],
  },
  {
    title: 'CLINIC (HMS)',
    items: [
      { label: 'Patients', letter: 'P', href: '/dashboard/patients', iconBg: '#EFF6FF', iconColor: '#2563EB' },
      { label: 'Appointments', letter: 'A', href: '/dashboard/appointments', iconBg: '#FEF3C7', iconColor: '#D97706' },
      { label: 'OPD Queue', letter: 'Q', href: '/dashboard/opd-queue', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
      { label: 'Triage', letter: 'T', href: '/dashboard/triage', iconBg: '#FEE2E2', iconColor: '#DC2626' },
      { label: 'Doctor EMR', letter: 'E', href: '/dashboard/emr', iconBg: '#F0FDF4', iconColor: '#059669' },
      { label: 'Laboratory', letter: 'L', href: '/dashboard/laboratory', iconBg: '#DBEAFE', iconColor: '#2563EB' },
      { label: 'Pharmacy', letter: 'Rx', href: '/dashboard/pharmacy', iconBg: '#FCE7F3', iconColor: '#DB2777' },
      { label: 'Billing Desk', letter: '\u20B9', href: '/dashboard/billing-desk', iconBg: '#FEF3C7', iconColor: '#D97706' },
      { label: 'Reports', letter: 'R', href: '/dashboard/reports', iconBg: '#F0FDF4', iconColor: '#059669' },
      { label: 'Staff', letter: 'S', href: '/dashboard/staff', iconBg: '#E0E7FF', iconColor: '#4F46E5' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Plan & billing', letter: 'P', href: '/dashboard/plan', iconBg: '#F3F4F6', iconColor: '#6B7280' },
      { label: 'My profile', letter: 'M', href: '/dashboard/profile', iconBg: '#F3F4F6', iconColor: '#6B7280' },
      { label: 'Team', letter: 'T', href: '/dashboard/team', iconBg: '#F3F4F6', iconColor: '#6B7280' },
      { label: 'Settings', letter: 'S', href: '/dashboard/settings', iconBg: '#F3F4F6', iconColor: '#6B7280' },
    ],
  },
];

function getTrialDaysLeft(trialEndsAt?: number): number {
  if (!trialEndsAt) return -1;
  return Math.ceil((trialEndsAt - Date.now()) / (24 * 60 * 60 * 1000));
}

function getPlanBadge(tier?: string, subscriptionStatus?: string, trialEndsAt?: number): { bg: string; color: string; label: string } {
  if (!tier || tier === 'starter') return { bg: '#ECFDF5', color: '#059669', label: 'Free' };
  if (subscriptionStatus === 'trialing' || subscriptionStatus === 'trial') {
    var days = getTrialDaysLeft(trialEndsAt);
    if (days <= 0) return { bg: '#FEE2E2', color: '#DC2626', label: 'Trial ended' };
    return { bg: '#FEF3C7', color: '#92400E', label: 'Trial \u00b7 ' + days + 'd left' };
  }
  if (subscriptionStatus === 'expired') return { bg: '#FEE2E2', color: '#DC2626', label: 'Expired' };
  if (tier === 'growth' || tier === 'professional' || tier === 'enterprise') return { bg: '#EFF6FF', color: '#2563EB', label: tier.charAt(0).toUpperCase() + tier.slice(1) };
  return { bg: '#FEF3C7', color: '#92400E', label: 'Trial' };
}

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  var pathname = usePathname();
  var searchParams = useSearchParams();
  var router = useRouter();
  var [sidebarOpen, setSidebarOpen] = useState(false);
  var isHmsPage = pathname === '/dashboard/hms';
  var currentModule = searchParams.get('module') || '';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  var [lockModal, setLockModal] = useState<string | null>(null);
  var trialDaysLeft = getTrialDaysLeft(user.trial_ends_at);
  var isTrial = user.subscription_status === 'trialing' || user.subscription_status === 'trial';
  var isExpired = user.subscription_status === 'expired' || (isTrial && trialDaysLeft <= 0);
  var isStarter = !user.plan_tier || user.plan_tier === 'starter';

  var [hmsLoading, setHmsLoading] = useState(false);

  async function openClinicSoftware() {
    setHmsLoading(true);
    try {
      var res = await fetch('/api/auth/hms-token', { method: 'POST' });
      var data = await res.json();
      if (data.success && data.hms_token) {
        var ld = encodeURIComponent(JSON.stringify({
          token: data.hms_token, hospitalId: String(data.hospital_id || ''),
          userid: String(data.user_id || ''), first_name: data.first_name || '',
          last_name: data.last_name || '', email: data.email || '',
          role: data.role || 'HOSPITAL_ADMIN', role_id: 2,
        }));
        window.open('https://app.hemato.in?mw_token=' + encodeURIComponent(data.hms_token) + '&mw_hospital_id=' + encodeURIComponent(data.hospital_id || '') + '&mw_login_data=' + ld, '_blank');
      } else {
        window.open('https://app.hemato.in', '_blank');
      }
    } catch {
      window.open('https://app.hemato.in', '_blank');
    } finally {
      setHmsLoading(false);
    }
  }

  var planBadge = getPlanBadge(user.plan_tier, user.subscription_status, user.trial_ends_at);
  var initials = (user.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ height: 52, background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' }}>
        <div className="flex items-center justify-between h-full px-5">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white/60 hover:text-white p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
            <a href="/dashboard" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>MediHost</span>
              <span style={{ fontSize: 14, color: '#A7F3D0' }}>{user.name || 'My Clinic'}</span>
            </a>
            <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: planBadge.bg, color: planBadge.color, padding: '4px 12px', borderRadius: 12 }}>
              {planBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user.is_super_admin && (
              <a href="/admin" className="hidden sm:block transition-colors" style={{ fontSize: 12, color: '#fff', padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', textDecoration: 'none' }}>
                Admin Panel
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors" style={{ backgroundColor: 'transparent' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                  {initials}
                </div>
                <span style={{ fontSize: 14, color: '#D1FAE5' }} className="hidden sm:block">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="text-sm py-2">My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/plan')} className="text-sm py-2">Plan & Billing</DropdownMenuItem>
                {user.is_super_admin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="text-sm py-2">Admin Panel</DropdownMenuItem>
                )}
                <div className="border-t border-gray-100" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 text-sm py-2">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Trial bar */}
      {(isTrial || isExpired) && !isHmsPage && (
        <div style={{ position: 'fixed', top: 52, left: 0, right: 0, zIndex: 49 }}>
          <TrialBar daysLeft={trialDaysLeft} planName={(user.plan_tier || 'Growth').charAt(0).toUpperCase() + (user.plan_tier || 'growth').slice(1)} expired={isExpired} />
        </div>
      )}

      {/* Feature lock modal */}
      {lockModal && LOCK_CONFIGS[lockModal] && (
        <FeatureLockModal {...LOCK_CONFIGS[lockModal]} onClose={() => setLockModal(null)} />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Floating HMS nav ─── */}
      {isHmsPage && (
        <div className="fixed top-16 left-3 z-50 flex flex-col gap-1.5">
          <a href="/dashboard" className="w-10 h-10 bg-[#0F172A] border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 text-sm font-bold shadow-lg hover:bg-emerald-500/20 transition-all" title="Dashboard">M</a>
          {[{ mod: 'opd', label: 'OPD' }, { mod: 'emr', label: 'EMR' }, { mod: 'billing', label: 'Billing' }, { mod: 'lis', label: 'LIS' }].map(function (item) {
            var active = currentModule === item.mod;
            return (
              <a key={item.mod} href={'/dashboard/hms?module=' + item.mod}
                className={'w-10 h-10 bg-[#0F172A] border rounded-xl flex items-center justify-center text-xs font-bold shadow-lg transition-all ' + (active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/10 hover:bg-white/10 text-white/60')}
                title={item.label}>{item.label.charAt(0)}</a>
            );
          })}
        </div>
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-[52px] left-0 bottom-0 z-40 overflow-y-auto transition-transform duration-200 ${
          isHmsPage ? '-translate-x-full' : (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
        style={{ width: 220, backgroundColor: '#FFFFFF', borderRight: '1px solid #E8E8E6' }}
      >
        {/* User info */}
        <div style={{ padding: 16, borderBottom: '1px solid #E8E8E6', marginBottom: 8 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'My Clinic'}</div>
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 10px', borderRadius: 10, marginTop: 2 }}>
                {(user.role || 'Partner').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <nav style={{ padding: '0 0 16px' }}>
          {SECTIONS.map((section, sIdx) => (
            <div key={section.title}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', padding: '0 16px', marginBottom: 6, marginTop: sIdx === 0 ? 8 : 20 }}>
                {section.title}
              </div>
              {section.items.map(item => {
                var isActive = item.href ? (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) : false;
                var isDisabled = !item.href && !item.external;
                var isLocked = false;
                // Super admin bypasses all tier gates
                if (!user.is_super_admin) {
                  if (item.badge === 'pro') isLocked = isStarter || user.plan_tier === 'growth';
                  if (item.external && isExpired) isLocked = true;
                }

                function handleClick(e: React.MouseEvent) {
                  if (isLocked) {
                    e.preventDefault();
                    setLockModal(item.badge === 'pro' ? item.label.toLowerCase().replace(/\s+/g, '_') : 'hms_expired');
                    setSidebarOpen(false);
                    return;
                  }
                  if (item.external) { e.preventDefault(); openClinicSoftware(); }
                  if (isDisabled) e.preventDefault();
                  setSidebarOpen(false);
                }

                return (
                  <a
                    key={item.label}
                    href={item.href || '#'}
                    onClick={handleClick}
                    className="transition-all"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderRadius: 8, margin: '0 8px 2px 8px',
                      fontSize: 14, fontWeight: isActive ? 600 : 450,
                      color: isActive ? '#047857' : '#4B5563',
                      background: isActive ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'transparent',
                      borderLeft: isActive ? '3px solid #059669' : '3px solid transparent',
                      textDecoration: 'none',
                      cursor: isDisabled ? 'default' : 'pointer',
                      opacity: isDisabled ? 0.5 : isLocked ? 0.45 : 1,
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 6, backgroundColor: item.iconBg, color: item.iconColor,
                      fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {item.letter}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge === 'soon' && (
                      <span style={{ fontSize: 9, fontWeight: 500, backgroundColor: '#F3F4F6', color: '#9CA3AF', padding: '2px 8px', borderRadius: 10 }}>soon</span>
                    )}
                    {item.badge === 'pro' && (
                      <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 8px', borderRadius: 10 }}>Pro</span>
                    )}
                    {item.badge === 'growth' && isStarter && (
                      <span style={{ fontSize: 9, fontWeight: 600, backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 10 }}>Growth</span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ─── Main content ─── */}
      <main className="min-h-screen transition-all duration-200" style={{ paddingTop: 52, marginLeft: isHmsPage ? 0 : 220 }}>
        <div className={isHmsPage ? '' : 'p-6 lg:p-8 max-w-[1100px] mx-auto'}>
          {children}
        </div>
      </main>
    </div>
  );
}
