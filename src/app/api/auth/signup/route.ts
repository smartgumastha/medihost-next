import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    // Step 1: Register via partner signup
    const res = await fetch(`${API_BASE}/api/presence/partner-auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospital_name: body.business_name,
        first_name: (body.owner_name || 'Doctor').split(' ')[0],
        last_name: (body.owner_name || '').split(' ').slice(1).join(' ') || 'User',
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
      // Step 2: Auto-login via partner login to get a PARTNER token
      const loginRes = await fetch(`${API_BASE}/api/presence/partner-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      const loginData = await loginRes.json();

      if (loginData.success && loginData.token) {
        const partner = loginData.partner || {};
        const user = {
          id: String(partner.id || ''),
          email: partner.email || body.email,
          name: body.owner_name || partner.owner_name || partner.business_name || body.email,
          role: partner.role || 'HOSPITAL_ADMIN',
          hospitalId: String(partner.hospital_id || ''),
          token: loginData.token,
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

      // Partner login failed after signup — account created but couldn't auto-login
      console.error('Signup succeeded but partner login failed:', loginData);
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
