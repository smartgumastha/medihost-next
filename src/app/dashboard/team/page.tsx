import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { TeamContent } from '@/components/dashboard/team-content';

export const metadata = { title: 'Team — MediHost' };

export default async function TeamPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <TeamContent user={user} />;
}
