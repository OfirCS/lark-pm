import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ExtractionResult {
  feature_requests: Array<{
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  pain_points: string[];
  competitive_mentions: Array<{
    competitor: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency_signals: string[];
  summary: string;
}

export async function extractInsightsFromSocialPost(
  platform: 'reddit' | 'twitter',
  content: string,
  title?: string
): Promise<ExtractionResult> {
  const prompt = `Analyze this ${platform} post and extract product intelligence insights.

${title ? `Title: ${title}\n` : ''}Content: ${content}

Extract the following in JSON format:
1. feature_requests: Array of {title, description, urgency: 'low'|'medium'|'high'|'critical'}
2. pain_points: Array of specific user frustrations or problems mentioned
3. competitive_mentions: Array of {competitor, context, sentiment: 'positive'|'negative'|'neutral'}
4. sentiment: Overall sentiment of the post ('positive', 'negative', or 'neutral')
5. urgency_signals: Array of phrases indicating urgency (e.g., "desperately need", "blocking us", "deal-breaker")
6. summary: One-sentence summary of the key insight

Respond with valid JSON only, no markdown.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  } catch (error) {
    console.error('AI extraction error:', error);
    return {
      feature_requests: [],
      pain_points: [],
      competitive_mentions: [],
      sentiment: 'neutral',
      urgency_signals: [],
      summary: 'Unable to extract insights',
    };
  }
}

export async function extractInsightsFromCallTranscript(
  transcript: string,
  context?: {
    customer_name?: string;
    deal_size?: number;
    stage?: string;
  }
): Promise<{
  feature_requests: string[];
  pain_points: string[];
  objections: string[];
  competitive_mentions: string[];
  buying_signals: string[];
  technical_requirements: string[];
  integration_needs: string[];
  urgency_level: 'low' | 'medium' | 'high';
  summary: string;
}> {
  const contextStr = context
    ? `Customer: ${context.customer_name || 'Unknown'}, Deal Size: ${context.deal_size ? `$${context.deal_size}` : 'Unknown'}, Stage: ${context.stage || 'Unknown'}`
    : '';

  const prompt = `Analyze this customer/sales call transcript and extract product intelligence insights.

${contextStr ? `Context: ${contextStr}\n` : ''}Transcript:
${transcript}

Extract the following in JSON format:
1. feature_requests: Array of specific features or capabilities requested
2. pain_points: Array of problems or frustrations mentioned by the customer
3. objections: Array of concerns or hesitations about the product
4. competitive_mentions: Array of competitor products or alternatives mentioned
5. buying_signals: Array of positive indicators of purchase intent
6. technical_requirements: Array of specific technical needs mentioned
7. integration_needs: Array of systems/tools they need to integrate with
8. urgency_level: 'low', 'medium', or 'high' based on timeline mentions
9. summary: 2-3 sentence summary of the key takeaways for the PM

Respond with valid JSON only, no markdown.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  } catch (error) {
    console.error('AI extraction error:', error);
    return {
      feature_requests: [],
      pain_points: [],
      objections: [],
      competitive_mentions: [],
      buying_signals: [],
      technical_requirements: [],
      integration_needs: [],
      urgency_level: 'low',
      summary: 'Unable to extract insights from transcript',
    };
  }
}

export async function groupSimilarRequests(
  requests: Array<{ title: string; description: string }>
): Promise<Array<{ group_name: string; items: string[] }>> {
  const prompt = `Group these feature requests by semantic similarity.

Requests:
${requests.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join('\n')}

Return JSON array of groups:
[{group_name: "Category Name", items: ["title1", "title2"]}]

Group similar concepts together (e.g., "SSO", "SAML", "single sign-on" → "Enterprise Authentication").
Respond with valid JSON only, no markdown.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  } catch (error) {
    console.error('AI grouping error:', error);
    return [];
  }
}

export async function generatePRD(
  featureTitle: string,
  sources: Array<{
    type: string;
    content: string;
    customer?: string;
  }>
): Promise<string> {
  const sourcesStr = sources
    .map((s) => `[${s.type}${s.customer ? ` - ${s.customer}` : ''}]: "${s.content}"`)
    .join('\n');

  const prompt = `Generate a Product Requirements Document (PRD) for this feature based on actual customer feedback.

Feature: ${featureTitle}

Customer Feedback Sources:
${sourcesStr}

Generate a comprehensive PRD with these sections:
1. Problem Statement (use actual customer quotes)
2. User Stories (derived from feedback)
3. Acceptance Criteria (based on requested functionality)
4. Edge Cases (from complaints/bug reports if any)
5. Success Metrics

Format in clean markdown.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('PRD generation error:', error);
    return '# Error generating PRD\n\nUnable to generate PRD from the provided sources.';
  }
}
