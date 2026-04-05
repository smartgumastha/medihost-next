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
  | 'doctors' | 'products' | 'marketing' | 'analytics' | 'plan';

export const ROLE_PAGES: Record<UserRole, DashboardPage[]> = {
  SUPER_ADMIN: ['dashboard', 'profile', 'website', 'domain', 'doctors', 'products', 'marketing', 'analytics', 'plan'],
  HOSPITAL_ADMIN: ['dashboard', 'profile', 'website', 'domain', 'doctors', 'products', 'marketing', 'analytics', 'plan'],
  MANAGER: ['dashboard', 'profile', 'doctors', 'products', 'analytics', 'plan'],
  DOCTOR: ['dashboard', 'profile', 'doctors'],
  RECEPTIONIST: ['dashboard', 'profile'],
  NURSE: ['dashboard', 'profile'],
  IPD_NURSE: ['dashboard', 'profile'],
  PHARMACIST: ['dashboard', 'profile', 'products'],
  BILLING: ['dashboard', 'profile', 'analytics'],
  LAB_TECHNICIAN: ['dashboard', 'profile', 'products'],
  PATIENT: ['dashboard', 'profile'],
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
