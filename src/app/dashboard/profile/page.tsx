import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { ProfileForm } from '@/components/dashboard/profile-form';

export const metadata = { title: 'My Profile — MediHost' };

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
      <ProfileForm user={user} />
    </div>
  );
}
