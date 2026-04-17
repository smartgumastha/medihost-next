import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

async function forwardRequest(req: NextRequest, params: { path: string[] }, method: string) {
  const ADMIN_KEY = process.env.ADMIN_KEY;
  if (!ADMIN_KEY) {
    return NextResponse.json({ error: 'ADMIN_KEY env var is not set on this deployment' }, { status: 500 });
  }

  const path = params.path.join('/');
  const search = req.nextUrl.search || '';
  const url = `${API_BASE}/api/presence/pricing/admin/${path}${search}`;

  const headers: Record<string, string> = {
    'x-admin-key': ADMIN_KEY,
  };

  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const res = await fetch(url, { method, headers, body });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    console.error('[presence-pricing-admin proxy]', method, url, err);
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, await params, 'GET');
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, await params, 'POST');
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, await params, 'PUT');
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, await params, 'DELETE');
}
