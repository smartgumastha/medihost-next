import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { specialty, city, refLink } = await request.json();

  // Try AI generation
  try {
    const { generateJSON } = await import('@/lib/ai');
    const prompt = `Generate 3 marketing messages for a MediHost reseller targeting a ${specialty} in ${city}.

MediHost is AI-powered clinic software — website, domain, appointments, billing, EMR, marketing — all in one.
Referral link: ${refLink || 'medihost.in/signup'}

Generate JSON with:
1. whatsapp: A brief WhatsApp message (under 200 chars, casual, compelling, include link)
2. linkedin: A professional LinkedIn post (under 300 chars, include link)
3. instagram: An Instagram caption (under 200 chars, with 3-4 hashtags)

Respond ONLY with valid JSON: {"whatsapp":"...","linkedin":"...","instagram":"..."}`;

    const content = await generateJSON(prompt);
    return NextResponse.json({ success: true, content });
  } catch {
    // Fallback templates
    return NextResponse.json({
      success: true,
      content: {
        whatsapp: `Hi Doctor! 👋 MediHost AI gives your ${specialty || 'clinic'} a professional website + appointments + billing — all free to start. Check it out: ${refLink || 'medihost.in/signup'} 🏥`,
        linkedin: `Attention healthcare professionals in ${city || 'India'}! MediHost AI is transforming how ${specialty || 'clinics'} go digital — AI-powered website, domain, EMR, and marketing in 60 seconds. Free to start: ${refLink || 'medihost.in/signup'} #HealthTech #DigitalHealth #MediHost`,
        instagram: `Your ${specialty || 'clinic'} deserves to be online ✨ MediHost AI builds your website in 60 seconds! Link in bio 🏥 #MediHost #ClinicSoftware #HealthTech #${(city || 'India').replace(/\s/g, '')}`,
      },
    });
  }
}
