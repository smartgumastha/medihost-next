import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

function getTokenFromRequest(request: NextRequest): { token: string; partnerId: string } {
  var cookie = request.cookies.get('medihost_auth')?.value;
  if (!cookie) return { token: '', partnerId: '' };
  try {
    var user = JSON.parse(cookie);
    return { token: user.token || '', partnerId: user.partnerId || user.id || '' };
  } catch { return { token: '', partnerId: '' }; }
}

export async function GET(request: NextRequest) {
  var { token, partnerId } = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    // Try partner-auth/me first (returns full partner object)
    var res = await fetch(`${API_BASE}/api/presence/partner-auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      var data = await res.json();
      return NextResponse.json({ success: true, partner: data.partner || data });
    }

    // Fallback: fetch by ID
    if (partnerId) {
      var res2 = await fetch(`${API_BASE}/api/presence/partners/${partnerId}`, {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res2.ok) {
        var data2 = await res2.json();
        return NextResponse.json({ success: true, partner: data2.partner || data2 });
      }
    }

    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  var { token, partnerId } = getTokenFromRequest(request);
  if (!token || !partnerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    var body = await request.json();
    var res = await fetch(`${API_BASE}/api/presence/partners/${partnerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body),
    });
    var data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
