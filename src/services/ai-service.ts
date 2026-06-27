/**
 * AI Service Adapter
 * OpenAI-compatible adapter for message drafting and property descriptions.
 */

interface AIResult {
  success: boolean;
  content?: string;
  error?: string;
  dryRun: boolean;
}

const isDryRun = () => !process.env.OPENAI_API_KEY;

/**
 * Generate AI content
 */
export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<AIResult> {
  if (isDryRun()) {
    console.log(`[DRY RUN] AI generation requested:`);
    console.log(`  Prompt: ${prompt.substring(0, 100)}...`);
    
    // Return a placeholder response
    return {
      success: true,
      content: `[AI Generated Placeholder] Based on your prompt, here's a suggested response. Configure OPENAI_API_KEY for real AI generation.`,
      dryRun: true,
    };
  }

  try {
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return { success: true, content, dryRun: false };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dryRun: false,
    };
  }
}

/**
 * Generate a social media caption
 */
export async function generateCaption(
  propertyTitle: string,
  location: string,
  postType: string,
  additionalContext?: string
): Promise<AIResult> {
  const prompt = `Write a compelling ${postType} caption for a real estate property listing:
Property: ${propertyTitle}
Location: ${location}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Keep it engaging, professional, and include relevant emojis and hashtags.`;

  return generateContent(prompt, 'You are a real estate social media marketing expert. Write engaging captions that drive inquiries.');
}

/**
 * Generate a property description
 */
export async function generatePropertyDescription(
  title: string,
  location: string,
  type: string,
  bedrooms?: number,
  size?: number,
  amenities?: string[]
): Promise<AIResult> {
  const prompt = `Write a compelling property description:
Title: ${title}
Location: ${location}
Type: ${type}
${bedrooms ? `Bedrooms: ${bedrooms}` : ''}
${size ? `Size: ${size} sqft` : ''}
${amenities?.length ? `Amenities: ${amenities.join(', ')}` : ''}

Write a professional, appealing description highlighting key features. Keep it under 200 words.`;

  return generateContent(prompt, 'You are a luxury real estate copywriter. Write descriptions that make buyers excited about properties.');
}

export const aiService = {
  generateContent,
  generateCaption,
  generatePropertyDescription,
  isDryRun,
};

export default aiService;
