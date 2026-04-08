import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  console.log('[LOGIN ROUTE] Received:', JSON.stringify({ email, passLength: password?.length, passStart: password?.substring(0, 2) }));

  // Try partner login first
  try {
    const partnerRes = await fetch(`${API_BASE}/api/presence/partner-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const partnerData = await partnerRes.json();

    console.log('[LOGIN ROUTE] Partner backend:', partnerRes.status, JSON.stringify({ success: partnerData.success, error: partnerData.error, hasToken: !!partnerData.token }));

    if (partnerData.success && partnerData.token) {
      const partner = partnerData.partner || {};
      const user = {
        id: String(partner.id || ''),
        email: partner.email || email,
        name: partner.owner_name || partner.business_name || email,
        role: partner.role || 'PARTNER',
        hospitalId: String(partner.hospital_id || ''),
        partnerId: String(partner.id || ''),
        token: partnerData.token,
        plan_tier: String(partner.plan_tier || 'starter'),
        is_super_admin: Boolean(partner.is_super_admin),
      };

      const response = NextResponse.json({ success: true, user });
      response.cookies.set('medihost_auth', JSON.stringify(user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }
  } catch (err) {
    console.error('[LOGIN ROUTE] Partner login fetch error:', err);
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

    console.log('[LOGIN ROUTE] HMS backend:', hmsRes.status, JSON.stringify({ hasToken: !!hmsData.token, error: hmsData.error }));

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
        httpOnly: false,
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
