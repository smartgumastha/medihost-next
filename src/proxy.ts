import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth cookie
  const authCookie = request.cookies.get('medihost_auth')?.value;
  let user: { role?: string } | null = null;
  if (authCookie) {
    try { user = JSON.parse(authCookie); } catch {}
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // API proxy to Railway backend
  if (pathname.startsWith('/api/proxy/')) {
    const backendPath = pathname.replace('/api/proxy', '');
    const backendUrl = `https://smartgumastha-backend-production.up.railway.app${backendPath}`;
    return NextResponse.rewrite(new URL(backendUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/proxy/:path*'],
};
