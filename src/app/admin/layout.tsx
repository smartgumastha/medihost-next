import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getAuthFromCookie } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get('medihost_auth')?.value;

  // Decode if URL-encoded, then parse
  let cookieValue = raw;
  if (raw && raw.startsWith('%')) {
    try { cookieValue = decodeURIComponent(raw); } catch { /* already decoded */ }
  }

  const user = getAuthFromCookie(cookieValue);

  if (!user) redirect('/login');
  if (!user.is_super_admin) redirect('/dashboard');

  return <AdminShell user={user}>{children}</AdminShell>;
}
