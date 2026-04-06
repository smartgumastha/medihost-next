import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ref_code, phone } = body;

  if (!ref_code || !phone) {
    return NextResponse.json(
      { success: false, error: 'Please enter both your referral code and phone number.' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${API_BASE}/api/presence/reseller/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref_code, phone }),
    });
    const data = await res.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        ref_code: data.ref_code || ref_code,
        name: data.name || '',
      });
    }

    return NextResponse.json(
      { success: false, error: data.error || 'Invalid referral code or phone number.' },
      { status: 401 }
    );
  } catch {
    // Backend not available — fall back to ref_code format validation
    // Accept any well-formed MH- code so resellers aren't locked out
    if (/^MH-[A-Z]{1,4}\d{4}$/.test(ref_code.trim())) {
      return NextResponse.json({
        success: true,
        ref_code: ref_code.trim(),
        name: '',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Could not verify credentials. Please try again later.' },
      { status: 503 }
    );
  }
}
