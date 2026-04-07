import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

var API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(req: NextRequest) {
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

  var body = await req.json();

  var res = await fetch(API_BASE + '/api/payment-orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(body),
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
