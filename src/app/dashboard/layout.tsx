import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { getAuthFromCookie } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard — MediHost AI™',
  icons: { icon: '/medihost-favicon.svg' },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('medihost_auth')?.value;
  const user = getAuthFromCookie(authCookie);

  if (!user) {
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
