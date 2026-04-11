import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

async function proxySubscription(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = '/api/subscription/' + path.join('/');
  const url = new URL(backendPath, API_BASE);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};

  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.text();
    }

    const res = await fetch(url.toString(), fetchOptions);
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    console.error('[subscription proxy]', request.method, backendPath, err);
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export const GET = proxySubscription;
export const POST = proxySubscription;
export const PUT = proxySubscription;
export const DELETE = proxySubscription;
