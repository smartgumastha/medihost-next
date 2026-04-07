import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Try partner login first
  try {
    const partnerRes = await fetch(`${API_BASE}/api/presence/partner-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const partnerData = await partnerRes.json();

    if (partnerData.success && partnerData.token) {
      const user = {
        id: String(partnerData.partner?.id || ''),
        email: partnerData.partner?.email || email,
        name: partnerData.partner?.owner_name || partnerData.partner?.business_name || email,
        role: partnerData.partner?.role || 'HOSPITAL_ADMIN',
        hospitalId: String(partnerData.partner?.hospital_id || ''),
        token: partnerData.token,
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
  } catch (err) {
    console.error('Partner login failed:', err);
  }

  // Fallback: try HMS login
  try {
    const hmsRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const hmsResp = await hmsRes.json();
    const hmsData = hmsResp.data || hmsResp;

    if (hmsData.token) {
      const user = {
        id: String(hmsData.userid || hmsData.user_id || ''),
        email: hmsData.email || email,
        name: `${hmsData.first_name || ''} ${hmsData.last_name || ''}`.trim() || email,
        role: hmsData.role || 'HOSPITAL_ADMIN',
        hospitalId: String(hmsData.hospital_id || hmsData.hospitalId || ''),
        token: hmsData.token,
        hmsToken: hmsData.token,
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
  } catch (err) {
    console.error('HMS login failed:', err);
  }

  return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
}
