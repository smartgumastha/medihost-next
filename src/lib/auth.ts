export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'MANAGER'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'IPD_NURSE'
  | 'PHARMACIST'
  | 'BILLING'
  | 'LAB_TECHNICIAN'
  | 'PATIENT';

export type DashboardPage =
  | 'dashboard' | 'profile' | 'website' | 'domain'
  | 'doctors' | 'products' | 'marketing' | 'analytics' | 'plan'
  | 'opd' | 'emr' | 'billing' | 'lis' | 'pharmacy' | 'appointments' | 'staff' | 'settings' | 'orders';

export const ROLE_PAGES: Record<UserRole, DashboardPage[]> = {
  SUPER_ADMIN: ['dashboard','profile','website','domain','doctors','products','marketing','analytics','plan','staff','settings','opd','emr','billing','lis','pharmacy','orders'],
  HOSPITAL_ADMIN: ['dashboard','profile','website','domain','doctors','products','marketing','analytics','plan','staff','settings','opd','emr','billing','lis','pharmacy','orders'],
  MANAGER: ['dashboard','profile','doctors','products','analytics','staff','opd','billing'],
  DOCTOR: ['dashboard','profile','opd','emr'],
  RECEPTIONIST: ['dashboard','profile','opd','billing','appointments'],
  NURSE: ['dashboard','profile','opd'],
  IPD_NURSE: ['dashboard','profile'],
  PHARMACIST: ['dashboard','profile','pharmacy'],
  BILLING: ['dashboard','profile','billing','analytics'],
  LAB_TECHNICIAN: ['dashboard','profile','lis'],
  PATIENT: ['dashboard','profile'],
};

export function canAccess(role: UserRole, page: DashboardPage): boolean {
  return ROLE_PAGES[role]?.includes(page) ?? false;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  token: string;
  hmsToken?: string;
}

export function getAuthFromCookie(cookieValue: string | undefined): AuthUser | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
}

export function getAuthFromClient(): AuthUser | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith('medihost_auth='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=')[1]));
  } catch {
    return null;
  }
}

export function getTokenFromClient(): string {
  const auth = getAuthFromClient();
  if (auth?.token) return auth.token;
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('medihost_token');
    if (stored) return stored;
  } catch { /* silent */ }
  return '';
}
