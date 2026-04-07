import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

const FALLBACK = {
  success: true,
  available: true,
  pricing: { selling_price: 699, gst: 126, total_with_gst: 825, gst_percent: 18, markup_percent: 25, rc_base_price: 550, price_source: 'fallback' },
};

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || '';
  if (!domain) {
    return NextResponse.json({ success: false, error: 'Missing domain param' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/presence/pricing/domain-price?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    if (data.success) return NextResponse.json(data);
    return NextResponse.json(FALLBACK);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
