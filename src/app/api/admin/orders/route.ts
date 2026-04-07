import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

var API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function GET() {
  var cookieStore = await cookies();
  var authCookie = cookieStore.get('medihost_auth');
  var token = '';

  if (authCookie) {
    try {
      var auth = JSON.parse(authCookie.value);
      token = auth.token || '';
    } catch { /* silent */ }
  }

  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    var res = await fetch(API_BASE + '/api/payment-orders/all', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    var data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
