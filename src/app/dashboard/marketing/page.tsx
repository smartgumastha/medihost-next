import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { MarketingDashboard } from '@/components/dashboard/marketing-dashboard';

export const metadata = { title: 'Marketing — MediHost' };

export default async function MarketingPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <MarketingDashboard user={user} />;
}
