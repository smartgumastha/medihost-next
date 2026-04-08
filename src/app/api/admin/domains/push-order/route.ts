import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  var token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  try {
    var body = await request.json();
    var res = await fetch(`${API_BASE}/api/presence/admin/domains/push-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body),
    });
    var data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to push order' }, { status: 500 });
  }
}
