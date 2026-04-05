import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { DoctorsManager } from '@/components/dashboard/doctors-manager';

export const metadata = { title: 'My Doctors — MediHost' };

export default async function DoctorsPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <DoctorsManager user={user} />;
}
