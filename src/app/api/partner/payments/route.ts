import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function GET(request: NextRequest) {
  var cookie = request.cookies.get('medihost_auth')?.value;
  if (!cookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  var user = { token: '', partnerId: '' };
  try { var u = JSON.parse(cookie); user = { token: u.token || '', partnerId: u.partnerId || u.id || '' }; } catch { /* */ }
  if (!user.token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    var res = await fetch(`${API_BASE}/api/presence/payments/history?partner_id=${user.partnerId}`, {
      headers: { 'Authorization': 'Bearer ' + user.token },
    });
    if (res.ok) {
      var data = await res.json();
      return NextResponse.json({ success: true, payments: data.payments || data.orders || [] });
    }
    return NextResponse.json({ success: true, payments: [] });
  } catch {
    return NextResponse.json({ success: true, payments: [] });
  }
}
