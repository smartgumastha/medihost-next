import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('medihost_auth')?.value;
  const user = getAuthFromCookie(raw);

  return NextResponse.json({
    raw_cookie_first_80: raw ? raw.substring(0, 80) : null,
    raw_starts_with_percent: raw ? raw.startsWith('%') : null,
    parsed_user: user ? { id: user.id, is_super_admin: user.is_super_admin, role: user.role } : null,
    would_redirect: !user || !user.is_super_admin,
  });
}
