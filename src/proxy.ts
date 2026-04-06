import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || request.nextUrl.hostname || '';
  const { pathname } = request.nextUrl;

  // Partner app (partner.hemato.in)
  if (hostname === 'partner.hemato.in') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/hemato/partner' : `/hemato/partner${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Phlebo app (phlebo.hemato.in)
  if (hostname === 'phlebo.hemato.in') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/hemato/phlebo' : `/hemato/phlebo${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Hemato.in domain routing
  const isHemato = hostname === 'hemato.in' || hostname === 'www.hemato.in';
  if (isHemato) {
    const url = request.nextUrl.clone();
    // Map hemato.in paths to /hemato/* routes
    if (pathname === '/' || pathname === '') {
      url.pathname = '/hemato';
    } else {
      url.pathname = `/hemato${pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // HMS login subdomain
  if (hostname === 'hms.medihost.in') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('product', 'hms');
    return NextResponse.rewrite(url);
  }

  // LIS login subdomain
  if (hostname === 'lis.medihost.in') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('product', 'lis');
    return NextResponse.rewrite(url);
  }

  // Physio login subdomain
  if (hostname === 'physio.medihost.in') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('product', 'physio');
    return NextResponse.rewrite(url);
  }

  // Subdomain routing for clinic storefronts
  const isSubdomain = hostname.endsWith('.medihost.in') &&
    hostname !== 'medihost.in' &&
    hostname !== 'www.medihost.in' &&
    !hostname.startsWith('app.') &&
    !hostname.startsWith('hms.') &&
    !hostname.startsWith('lis.') &&
    !hostname.startsWith('physio.') &&
    !hostname.startsWith('partner.') &&
    !hostname.startsWith('phlebo.');

  if (isSubdomain) {
    const subdomain = hostname.split('.medihost.in')[0];
    const url = request.nextUrl.clone();
    url.pathname = `/storefront/${subdomain}`;
    return NextResponse.rewrite(url);
  }

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
  matcher: [
    /*
     * Match all paths except static files and Next.js internals
     * This ensures the proxy runs for hemato.in domain routing,
     * subdomain detection, auth guards, and API proxy
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
