import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const res = await fetch(`${API_BASE}/api/presence/pricing/offers`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/api/presence/pricing/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1] || '';
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'offer id required' }, { status: 400 });

    const res = await fetch(`${API_BASE}/api/presence/pricing/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}
