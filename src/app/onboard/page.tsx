import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthFromCookie } from '@/lib/auth';
import { OnboardWizard } from '@/components/auth/onboard-wizard';

export const metadata = { title: 'Setup Your Clinic — MediHost AI' };

export default async function OnboardPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  if (!user) redirect('/login');
  return <OnboardWizard user={user} />;
}
