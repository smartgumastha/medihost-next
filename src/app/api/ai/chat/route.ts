import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prompt } = await request.json();
    const text = await generateText(prompt, 1000);
    return NextResponse.json({ success: true, response: text });
  } catch {
    return NextResponse.json({ success: false, error: 'AI not available' });
  }
}
