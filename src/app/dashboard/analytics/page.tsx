import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';

export const metadata = { title: 'Analytics — MediHost' };

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <AnalyticsDashboard user={user} />;
}
