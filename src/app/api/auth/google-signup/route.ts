import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const res = await fetch(`${API_BASE}/api/presence/payment-landing/register-google`, {
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
        role: 'HOSPITAL_ADMIN' as const,
        hospitalId: '',
        token: data.token || '',
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

    // Handle 409 — already registered
    if (data.existing) {
      return NextResponse.json(
        { success: false, error: data.error || 'Account already exists. Please sign in.' },
        { status: 409 }
      );
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
