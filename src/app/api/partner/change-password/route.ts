import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  var cookie = request.cookies.get('medihost_auth')?.value;
  if (!cookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  var token = '';
  try { token = JSON.parse(cookie).token; } catch { /* */ }
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    var body = await request.json();
    var res = await fetch(`${API_BASE}/api/presence/partner-auth/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body),
    });
    var data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
