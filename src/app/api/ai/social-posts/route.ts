import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { businessName, practiceType, city, topic } = await request.json();

    const prompt = `You are a healthcare social media manager. Generate 3 social media post options for a ${practiceType} named "${businessName}" in ${city || 'India'}.

${topic ? `Topic: ${topic}` : 'Generate posts about health awareness, clinic services, or seasonal health tips.'}

For each post, provide content for:
1. Google Business post (professional, 150 words max)
2. Instagram caption (engaging, with hashtags, 100 words max)
3. WhatsApp broadcast message (conversational, brief, 50 words max)

Respond ONLY in this JSON format:
{"posts":[{"title":"Post Title","google":"...","instagram":"...","whatsapp":"..."},{"title":"...","google":"...","instagram":"...","whatsapp":"..."},{"title":"...","google":"...","instagram":"...","whatsapp":"..."}]}`;

    const data = await generateJSON<Record<string, unknown>>(prompt);
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: false, error: 'AI generation failed' });
  }
}
