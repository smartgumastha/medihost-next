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
        selected_domain: body.selected_domain || '',
        plan_tier: body.plan_tier || 'starter',
        signup_intent: body.signup_intent || 'website',
      }),
    });

    const data = await res.json();

    if (data.success) {
      const user = {
        id: String(data.partner_id || ''),
        email: data.email || '',
        name: data.name || '',
        role: 'PARTNER' as const,
        hospitalId: String(data.hospital_id || ''),
        partnerId: String(data.partner_id || ''),
        token: data.token || '',
        plan_tier: String(data.plan_tier || 'starter'),
        is_super_admin: Boolean(data.is_super_admin),
      };

      const response = NextResponse.json({ success: true, user, existing: !!data.existing });
      response.cookies.set('medihost_auth', JSON.stringify(user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: data.error || 'Google signup failed' },
      { status: 400 }
    );
  } catch (e) {
    console.error('Google signup route error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
