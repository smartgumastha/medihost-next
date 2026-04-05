import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth';
import { ProductsManager } from '@/components/dashboard/products-manager';

export const metadata = { title: 'Tests & Services — MediHost' };

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const user = getAuthFromCookie(cookieStore.get('medihost_auth')?.value);
  return <ProductsManager user={user} />;
}
