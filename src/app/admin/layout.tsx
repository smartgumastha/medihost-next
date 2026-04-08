import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getAuthFromCookie } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('medihost_auth')?.value;
  const user = getAuthFromCookie(authCookie);

  if (!user) redirect('/login');
  if (!user.is_super_admin) redirect('/dashboard');

  return <AdminShell user={user}>{children}</AdminShell>;
}
