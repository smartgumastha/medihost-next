import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { PlanBilling } from '@/components/dashboard/plan-billing';

export const metadata = { title: 'Plan & Billing — MediHost' };

export default async function PlanPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <PlanBilling user={user} />;
}
