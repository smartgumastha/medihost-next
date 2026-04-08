import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest, { params }: { params: Promise<{ partnerId: string }> }) {
  var token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  var { partnerId } = await params;
  try {
    var res = await fetch(`${API_BASE}/api/presence/admin/domains/retry/${partnerId}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    var data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to retry' }, { status: 500 });
  }
}
