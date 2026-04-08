import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const res = await fetch(`${API_BASE}/api/presence/pricing/plans`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const body = await request.json();
    const { plan_tier, ...updates } = body;
    if (!plan_tier) return NextResponse.json({ error: 'plan_tier required' }, { status: 400 });

    const res = await fetch(`${API_BASE}/api/presence/pricing/plans/${plan_tier}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
