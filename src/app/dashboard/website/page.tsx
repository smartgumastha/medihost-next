import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { WebsiteGenerator } from '@/components/dashboard/website-generator';

export const metadata = { title: 'My Website — MediHost' };

export default async function WebsitePage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <WebsiteGenerator user={user} />;
}
