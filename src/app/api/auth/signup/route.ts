import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    // Step 1: Try signup via partner-auth
    const signupRes = await fetch(`${API_BASE}/api/presence/partner-auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: body.owner_name?.split(' ')[0] || body.owner_name || '',
        last_name: body.owner_name?.split(' ').slice(1).join(' ') || '',
        email: (body.email || '').toLowerCase().trim(),
        password: body.password,
        phone: body.phone || '',
        clinic_name: body.business_name || body.clinic_name || '',
        city: body.city || '',
        plan_tier: body.plan_tier || 'starter',
        signup_source: body.signup_source || 'website',
        signup_intent: body.intent || '',
        selected_domain: body.selected_domain || '',
      }),
    });

    const signupData = await signupRes.json();

    // Step 2: Determine if this is new signup or existing user
    let token = '';
    let partnerId = '';
    let partnerData: Record<string, unknown> = {};

    if (signupData.success && signupData.token) {
      // New signup succeeded
      token = signupData.token;
      partnerId = String(signupData.partner?.id || '');
      partnerData = signupData.partner || {};
    } else if (signupData.error?.includes('already') || signupData.error?.includes('exists') || signupRes.status === 409) {
      // Email exists — try login instead (handle existing users gracefully)
      const loginRes = await fetch(`${API_BASE}/api/presence/partner-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: (body.email || '').toLowerCase().trim(),
          password: body.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginData.success && loginData.token) {
        token = loginData.token;
        partnerId = String(loginData.partner?.id || '');
        partnerData = loginData.partner || {};
      } else {
        // Password wrong for existing account
        return NextResponse.json(
          { success: false, error: 'Account exists. Check your password or use Google login.', existing: true },
          { status: 400 }
        );
      }
    } else {
      // Genuine error
      console.error('Signup error:', signupData.error);
      return NextResponse.json(
        { success: false, error: signupData.error || 'Registration failed. Please try again.' },
        { status: 400 }
      );
    }

    // Step 3: Build user object and set cookie
    const user = {
      id: partnerId,
      email: body.email,
      name: body.owner_name || body.business_name || '',
      role: 'PARTNER' as const,
      hospitalId: String(partnerData.hospital_id || ''),
      partnerId: partnerId,
      token: token,
      plan_tier: String(partnerData.plan_tier || 'starter'),
      is_super_admin: Boolean(partnerData.is_super_admin),
    };

    const response = NextResponse.json({ success: true, user, existing: !signupData.success });

    // Set medihost_auth cookie — client-readable for dashboard/payment pages
    response.cookies.set('medihost_auth', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' }, { status: 500 });
  }
}
