import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { DomainManager } from '@/components/dashboard/domain-manager';

export const metadata = { title: 'Domain — MediHost' };

export default async function DomainPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <DomainManager user={user} />;
}
