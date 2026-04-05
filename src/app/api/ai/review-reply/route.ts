import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { reviewText, rating, businessName } = await request.json();

    const prompt = `You are responding to a patient review for "${businessName}". Write a professional, warm reply.

Review (${rating}/5 stars): "${reviewText}"

Guidelines:
- Thank the patient
- If positive: express gratitude, invite them back
- If negative: apologize, offer to resolve, be empathetic
- Keep it under 50 words
- Don't be overly formal
- Sound human, not corporate

Reply:`;

    const reply = await generateText(prompt, 200);
    return NextResponse.json({ success: true, reply: reply.trim() });
  } catch {
    return NextResponse.json({
      success: true,
      reply: 'Thank you for your feedback! We value your experience and are always working to improve our services.',
    });
  }
}
