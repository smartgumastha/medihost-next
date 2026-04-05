import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const user = JSON.parse(authCookie);
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
