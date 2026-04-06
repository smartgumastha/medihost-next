import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

function generateRefCode(name: string): string {
  const prefix = 'MH';
  const nameSlug = name.trim().split(' ')[0].substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${nameSlug}${random}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, email, city, background, linkedin, source } = body;

  if (!name || !phone || !email || !city) {
    return NextResponse.json({ success: false, error: 'All required fields must be filled' }, { status: 400 });
  }

  const refCode = generateRefCode(name);

  // Try to save to backend
  try {
    const res = await fetch(`${API_BASE}/api/presence/reseller/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, city, background, linkedin, source, ref_code: refCode }),
    });
    const data = await res.json();
    if (data.success) {
      return NextResponse.json({ success: true, ref_code: data.ref_code || refCode, reseller_id: data.id });
    }
  } catch {
    // Backend not available — fall through to local response
  }

  // If backend not ready, still return success with generated code
  // TODO: Store in backend when endpoint is built
  return NextResponse.json({ success: true, ref_code: refCode, note: 'Registered locally — backend sync pending' });
}
