import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const res = await fetch(`${API_BASE}/api/presence/register-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospital_name: body.business_name,
        owner_name: body.owner_name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        partner_type: body.partner_type,
        selected_domain: '',
        plan_tier: 'starter',
      }),
    });
    const data = await res.json();

    if (data.success || data.partner_id) {
      // Auto-login after signup
      const loginRes = await fetch(`${API_BASE}/api/presence/partner-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      const loginData = await loginRes.json();

      if (loginData.success && loginData.token) {
        const user = {
          id: String(loginData.partner?.id || data.partner_id || ''),
          email: body.email,
          name: body.owner_name || body.business_name,
          role: 'HOSPITAL_ADMIN' as const,
          hospitalId: String(loginData.partner?.hospital_id || ''),
          token: loginData.token,
        };
        const response = NextResponse.json({ success: true, user });
        response.cookies.set('medihost_auth', JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
        return response;
      }

      return NextResponse.json({ success: true, message: 'Account created. Please login.' });
    }

    return NextResponse.json(
      { success: false, error: data.error || 'Registration failed' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
