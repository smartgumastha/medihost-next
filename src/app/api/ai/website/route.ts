import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('medihost_auth')?.value;
  if (!authCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { businessName, ownerName, practiceType, city } = await request.json();

    const prompt = `You are a healthcare marketing expert. Generate website content for a ${practiceType} clinic.

Clinic: ${businessName}
Owner: ${ownerName || 'Doctor'}
City: ${city || 'India'}
Type: ${practiceType}

Generate a JSON object with:
- tagline: One compelling headline (max 10 words)
- about: 2-3 sentence professional description (max 200 chars)
- features: Array of 5 short feature highlights (2-4 words each)
- stats: Object with 4 key-value pairs (impressive but realistic numbers)
- metaTitle: SEO title (max 60 chars)
- metaDescription: SEO description (max 155 chars)

Respond ONLY with valid JSON, no other text.`;

    const content = await generateJSON(prompt);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    // Fallback to template-based generation if AI fails
    return NextResponse.json({ success: false, error: 'AI generation failed. Using template.' });
  }
}
