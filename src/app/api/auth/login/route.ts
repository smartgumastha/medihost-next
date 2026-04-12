import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  console.log('[LOGIN DEBUG] email:', email, '| passLength:', password?.length, '| API_BASE:', API_BASE);

  // Step 1: Try partner login first
  var partnerUser: Record<string, unknown> | null = null;
  try {
    var partnerUrl = `${API_BASE}/api/presence/partner-auth/login`;
    console.log('[LOGIN DEBUG] Calling partner:', partnerUrl);
    var partnerRes = await fetch(partnerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    var partnerData = await partnerRes.json();

    console.log('[LOGIN DEBUG] Partner response:', partnerRes.status, JSON.stringify({ success: partnerData.success, error: partnerData.error, hasToken: !!partnerData.token, message: partnerData.message }));

    if (partnerData.success && partnerData.token) {
      var partner = partnerData.partner || {};
      var isSuperAdmin = partner.is_super_admin === true || partner.is_super_admin === 'true';
      partnerUser = {
        id: String(partner.id || ''),
        email: partner.email || email,
        name: partner.owner_name || partner.business_name || email,
        role: isSuperAdmin ? 'SUPER_ADMIN' : (partner.role || 'PARTNER'),
        hospitalId: String(partner.hospital_id || ''),
        partnerId: String(partner.id || ''),
        token: partnerData.token,
        plan_tier: isSuperAdmin ? 'enterprise' : String(partner.plan_tier || 'starter'),
        is_super_admin: isSuperAdmin,
        trial_ends_at: partner.trial_ends_at ? Number(partner.trial_ends_at) : undefined,
        subscription_status: isSuperAdmin ? 'active' : (partner.subscription_status || undefined),
      };
    }
  } catch (err) {
    console.error('[LOGIN ROUTE] Partner login fetch error:', err);
  }

  // Step 2: For ALL partner users, also try HMS login to get hmsToken
  // (HMS endpoints require HMS token, not partner token)
  if (partnerUser) {
    try {
      var hmsRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      var hmsResp = await hmsRes.json();
      var hmsData = hmsResp.data || hmsResp;

      console.log('[LOGIN DEBUG] HMS merge:', hmsRes.status, JSON.stringify({ hasToken: !!hmsData.token, plan_tier: hmsData.plan_tier }));

      if (hmsData.token) {
        partnerUser.hospitalId = String(hmsData.hospital_id || hmsData.hospitalId || partnerUser.hospitalId || '');
        partnerUser.hmsToken = hmsData.token;
        if (partnerUser.is_super_admin === true || partnerUser.is_super_admin === 'true') {
          partnerUser.role = 'SUPER_ADMIN';
        }
        // plan_tier from HMS login reads from subscriptions table (source of truth)
        if (hmsData.plan_tier) {
          partnerUser.plan_tier = hmsData.plan_tier;
        }
        if (hmsData.subscription_status) {
          partnerUser.subscription_status = hmsData.subscription_status;
        }
        if (!partnerUser.name || partnerUser.name === email) {
          partnerUser.name = `${hmsData.first_name || ''} ${hmsData.last_name || ''}`.trim() || partnerUser.name;
        }
      } else {
        // HMS login failed — try token exchange via partner-auth endpoint
        console.log('[LOGIN DEBUG] HMS login failed, trying partner-auth/hms-token exchange');
        var exchangeRes = await fetch(`${API_BASE}/api/presence/partner-auth/hms-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${partnerUser.token}`,
          },
          body: '{}',
        });
        var exchangeData = await exchangeRes.json();
        if (exchangeData.success && exchangeData.hms_token) {
          partnerUser.hmsToken = exchangeData.hms_token;
          partnerUser.hospitalId = String(exchangeData.hospital_id || partnerUser.hospitalId || '');
          console.log('[LOGIN DEBUG] HMS token exchange succeeded, hospital_id:', partnerUser.hospitalId);
        } else {
          console.log('[LOGIN DEBUG] HMS token exchange also failed:', exchangeData.error);
        }
      }
    } catch (err) {
      console.error('[LOGIN ROUTE] HMS merge failed (non-fatal):', err);
      // Partner login still succeeds — HMS merge is best-effort
    }
  }

  // Step 3: Return partner user if we have one
  if (partnerUser) {
    console.log('[LOGIN DEBUG] SUCCESS — returning partnerUser, plan_tier:', partnerUser.plan_tier, 'role:', partnerUser.role);
    var response = NextResponse.json({ success: true, user: partnerUser });
    response.cookies.set('medihost_auth', JSON.stringify(partnerUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  }

  // Step 4: Fallback — try HMS login only (non-partner users)
  try {
    var hmsOnlyRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    var hmsOnlyResp = await hmsOnlyRes.json();
    var hmsOnlyData = hmsOnlyResp.data || hmsOnlyResp;

    console.log('[LOGIN DEBUG] HMS fallback:', hmsOnlyRes.status, JSON.stringify({ hasToken: !!hmsOnlyData.token, error: hmsOnlyData.error || hmsOnlyData.message }));

    if (hmsOnlyData.token) {
      var hmsUser = {
        id: String(hmsOnlyData.userid || hmsOnlyData.user_id || ''),
        email: hmsOnlyData.email || email,
        name: `${hmsOnlyData.first_name || ''} ${hmsOnlyData.last_name || ''}`.trim() || email,
        role: hmsOnlyData.role || 'HOSPITAL_ADMIN',
        hospitalId: String(hmsOnlyData.hospital_id || hmsOnlyData.hospitalId || ''),
        token: hmsOnlyData.token,
        hmsToken: hmsOnlyData.token,
        plan_tier: hmsOnlyData.plan_tier || 'free',
        subscription_status: hmsOnlyData.subscription_status || 'active',
      };

      var hmsResponse = NextResponse.json({ success: true, user: hmsUser });
      hmsResponse.cookies.set('medihost_auth', JSON.stringify(hmsUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return hmsResponse;
    }
  } catch (err) {
    console.error('[LOGIN ROUTE] HMS fallback failed:', err);
  }

  console.log('[LOGIN DEBUG] FAIL — no partnerUser, no HMS fallback. Returning 401.');
  return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
}
