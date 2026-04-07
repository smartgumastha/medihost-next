import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const res = await fetch(`${API_BASE}/api/presence/register-google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_token: body.google_token,
      }),
    });

    const data = await res.json();

    if (data.success) {
      const user = {
        id: String(data.partner_id || ''),
        email: data.email || '',
        name: data.name || '',
        role: 'HOSPITAL_ADMIN' as const,
        hospitalId: String(data.hospital_id || ''),
        token: data.token || '',
        hmsToken: data.hms_token || data.token || '',
        authProvider: 'google',
      };

      const response = NextResponse.json({ success: true, user });
      response.cookies.set('medihost_auth', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Backend returns existing account data on 409 — still a successful login
    if (data.existing && data.token) {
      const user = {
        id: String(data.partner_id || ''),
        email: data.email || '',
        name: data.name || '',
        role: 'HOSPITAL_ADMIN' as const,
        hospitalId: String(data.hospital_id || ''),
        token: data.token || '',
        hmsToken: data.hms_token || data.token || '',
        authProvider: 'google',
      };

      const response = NextResponse.json({ success: true, user });
      response.cookies.set('medihost_auth', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: data.error || 'Google sign-in failed. Try email login or sign up first.' },
      { status: 400 }
    );
  } catch (e) {
    console.error('Google login route error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
