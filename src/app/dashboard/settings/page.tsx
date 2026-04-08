import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { SettingsContent } from '@/components/dashboard/settings-content';

export const metadata = { title: 'Settings — MediHost' };

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <SettingsContent user={user} />;
}
