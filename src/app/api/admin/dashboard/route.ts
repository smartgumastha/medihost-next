import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const res = await fetch(`${API_BASE}/api/presence/admin/dashboard`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
