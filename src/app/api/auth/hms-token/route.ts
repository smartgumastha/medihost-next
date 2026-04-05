import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let user;
  try { user = JSON.parse(authCookie); } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  // If user already has an HMS token (logged in via HMS endpoint), return it
  if (user.hmsToken) {
    return NextResponse.json({
      success: true,
      hms_token: user.hmsToken,
      hospital_id: user.hospitalId,
      user_id: user.id,
      first_name: user.name?.split(' ')[0] || '',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
    });
  }

  // Otherwise, try to get HMS token from the presence API
  try {
    const res = await fetch(`${API_BASE}/api/presence/partner-auth/hms-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: '{}',
    });
    const data = await res.json();

    if (data.success && data.hms_token) {
      return NextResponse.json({
        success: true,
        hms_token: data.hms_token,
        hospital_id: data.hospital_id,
        user_id: data.user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: user.email,
        role: user.role,
      });
    }

    return NextResponse.json({ success: false, error: 'Could not get HMS token' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to connect to HMS' });
  }
}
