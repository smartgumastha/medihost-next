import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not set');
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export async function generateText(prompt: string, maxTokens = 1000): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function generateJSON<T>(prompt: string, maxTokens = 1500): Promise<T> {
  const text = await generateText(prompt, maxTokens);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
