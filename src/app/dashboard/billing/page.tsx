import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { BillingSettings } from '@/components/dashboard/billing-settings';

export const metadata = { title: 'Plan & Billing — MediHost' };

export default async function BillingPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <BillingSettings user={user} />;
}
