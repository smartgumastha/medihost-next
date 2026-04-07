import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const res = await fetch(`${API_BASE}/api/presence/partner-auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: body.business_name,
        owner_name: body.owner_name || [body.first_name, body.last_name].filter(Boolean).join(' ') || '',
        email: body.email,
        phone: body.phone || '',
        password: body.password,
        partner_type: body.partner_type || 'clinic',
        signup_source: body.signup_source || 'medihost-web',
      }),
    });

    const data = await res.json();

    if (data.success && data.token) {
      // Direct signup with password — token returned immediately
      const partner = data.partner || {};
      const user = {
        id: String(partner.id || ''),
        email: partner.email || body.email,
        name: partner.owner_name || partner.business_name || body.owner_name || body.email,
        role: 'HOSPITAL_ADMIN' as const,
        hospitalId: '',
        token: data.token,
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

    if (data.success && data.requires_verification) {
      // No-password flow — email verification required
      return NextResponse.json({ success: true, requires_verification: true, message: data.message });
    }

    return NextResponse.json(
      { success: false, error: data.error || data.message || 'Registration failed' },
      { status: 400 }
    );
  } catch (e) {
    console.error('Signup route error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
