import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const res = await fetch(`${API_BASE}/api/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: body.business_name,
        owner_name: body.owner_name,
        email: body.email,
        phone: body.phone || '',
        password: body.password,
        partner_type: body.partner_type || 'clinic',
        selected_domain: body.selected_domain || '',
        selected_product: body.selected_product || 'hms',
        ref_code: body.ref_code || '',
      }),
    });

    const data = await res.json();

    if (data.success) {
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      const loginData = await loginRes.json();

      // token and hospital_id are nested under loginData.data
      const d = loginData.data || {};
      const token = d.token || '';
      const hospitalId = String(d.hospital_id || '');
      const name = body.owner_name || body.business_name;

      if (loginData.success && token) {
        const user = {
          id: String(d.userid || hospitalId),
          email: body.email,
          name: name,
          role: 'HOSPITAL_ADMIN' as const,
          hospitalId: hospitalId,
          token: token,
        };

        const response = NextResponse.json({ success: true, user });

        response.cookies.set('mh_auth', JSON.stringify(user), {
          httpOnly: false,
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
      { success: false, error: data.error || data.message || 'Registration failed' },
      { status: 400 }
    );
  } catch (e) {
    console.error('Signup route error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
