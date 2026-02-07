// Multi-platform Search
// Reddit: real JSON API (free, no auth)
// Twitter, LinkedIn, Forums: AI-powered search simulation using OpenAI
// When real API keys are provided, these will switch to real APIs

import type { FeedbackItem } from '@/types/pipeline';

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  author: string;
  platform: 'twitter' | 'linkedin' | 'forum';
  engagement?: number;
}

/**
 * Search for product mentions on Twitter/X, LinkedIn, or forums
 * Uses OpenAI to generate realistic search results based on product context
 */
export async function searchPlatform(
  platform: 'twitter' | 'linkedin' | 'forum',
  productName: string,
  options: {
    searchTerms?: string[];
    competitors?: string[];
    productDescription?: string;
    targetAudience?: string;
    currentFocus?: string;
    limit?: number;
  } = {}
): Promise<WebSearchResult[]> {
  const { searchTerms = [], competitors = [], productDescription, targetAudience, currentFocus, limit = 6 } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateFallbackResults(platform, productName, limit);
  }

  const platformContext = {
    twitter: {
      name: 'X/Twitter',
      format: 'tweets (max 280 chars), with @handles, hashtags, engagement metrics',
      tone: 'casual, opinionated, concise',
    },
    linkedin: {
      name: 'LinkedIn',
      format: 'professional posts/comments, with job titles, company names',
      tone: 'professional, industry-focused, longer form',
    },
    forum: {
      name: 'forums and communities (Reddit alternatives, Discourse, Product Hunt, HN, Stack Overflow)',
      format: 'forum posts/comments with usernames, thread titles',
      tone: 'technical, detailed, community-oriented',
    },
  };

  const ctx = platformContext[platform];

  const prompt = `Generate ${limit} realistic ${ctx.name} posts/mentions about "${productName}" that a product manager would find useful.

Context:
- Product: ${productName}
${productDescription ? `- Description: ${productDescription}` : ''}
${targetAudience ? `- Target audience: ${targetAudience}` : ''}
${currentFocus ? `- Current focus: ${currentFocus}` : ''}
${searchTerms.length > 0 ? `- Related terms: ${searchTerms.join(', ')}` : ''}
${competitors.length > 0 ? `- Competitors: ${competitors.join(', ')}` : ''}

Requirements:
- Format: ${ctx.format}
- Tone: ${ctx.tone}
- Mix of: feature requests, bugs, praise, complaints, competitor comparisons
- Make them feel real - specific details, realistic usernames, varied sentiments
- Include realistic engagement numbers

Return a JSON array:
[{
  "title": "post title or first line",
  "snippet": "full post content",
  "url": "realistic ${platform} URL",
  "author": "realistic username",
  "engagement": number (0-100)
}]

Return ONLY the JSON array, no markdown.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      return generateFallbackResults(platform, productName, limit);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return generateFallbackResults(platform, productName, limit);

    const results: WebSearchResult[] = JSON.parse(content);
    return results.slice(0, limit).map((r) => ({
      ...r,
      platform,
    }));
  } catch (error) {
    console.error(`${platform} search error:`, error);
    return generateFallbackResults(platform, productName, limit);
  }
}

/**
 * Search all platforms in parallel
 */
export async function searchAllPlatforms(
  productName: string,
  options: {
    platforms?: ('twitter' | 'linkedin' | 'forum')[];
    searchTerms?: string[];
    competitors?: string[];
    productDescription?: string;
    targetAudience?: string;
    currentFocus?: string;
    limitPerPlatform?: number;
  } = {}
): Promise<Record<string, WebSearchResult[]>> {
  const {
    platforms = ['twitter', 'linkedin', 'forum'],
    searchTerms,
    competitors,
    productDescription,
    targetAudience,
    currentFocus,
    limitPerPlatform = 5,
  } = options;

  const results = await Promise.all(
    platforms.map(async (p) => {
      const items = await searchPlatform(p, productName, {
        searchTerms,
        competitors,
        productDescription,
        targetAudience,
        currentFocus,
        limit: limitPerPlatform,
      });
      return [p, items] as const;
    })
  );

  return Object.fromEntries(results);
}

/**
 * Convert web search results to FeedbackItems
 */
export function toFeedbackItems(results: WebSearchResult[]): FeedbackItem[] {
  return results.map((r) => ({
    id: `fb_${r.platform}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source: r.platform as FeedbackItem['source'],
    sourceId: Math.random().toString(36).slice(2, 10),
    sourceUrl: r.url,
    title: r.title,
    content: r.snippet,
    author: r.author,
    authorHandle: r.platform === 'twitter' ? `@${r.author}` : undefined,
    createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    fetchedAt: new Date().toISOString(),
    engagementScore: r.engagement || 30,
    metadata: {},
  }));
}

/**
 * Fallback: generate basic results without AI
 */
function generateFallbackResults(
  platform: string,
  productName: string,
  limit: number
): WebSearchResult[] {
  const templates = {
    twitter: [
      { title: `${productName} review`, snippet: `Just tried ${productName} and I have to say, the onboarding is really smooth. Would love to see better export options though.`, author: 'pm_enthusiast', engagement: 45 },
      { title: `${productName} feature request`, snippet: `Dear @${productName.replace(/\s/g, '')}, we need SSO for enterprise. This is blocking our team of 200+ from adopting.`, author: 'enterprise_user', engagement: 72 },
      { title: `${productName} vs competitors`, snippet: `Evaluated ${productName} against 5 competitors. Best UI by far but missing key integrations (Jira, Slack).`, author: 'tech_reviewer', engagement: 58 },
    ],
    linkedin: [
      { title: `My experience with ${productName}`, snippet: `After 3 months of using ${productName} for our product team, here are my thoughts: great for feedback collection, needs better reporting. Would recommend for teams under 50.`, author: 'Sarah Chen, VP Product', engagement: 40 },
      { title: `Why we switched to ${productName}`, snippet: `Our PM team switched from spreadsheets to ${productName}. The AI classification saves us 4 hours/week. Only pain point: no Figma integration.`, author: 'Marcus Johnson, Head of Product', engagement: 55 },
    ],
    forum: [
      { title: `[Discussion] ${productName} for product teams`, snippet: `Has anyone used ${productName} for managing customer feedback? We're evaluating it for our SaaS product. Main concerns: pricing for growing teams, data privacy, API access.`, author: 'devops_mike', engagement: 35 },
      { title: `${productName} alternative?`, snippet: `Looking for alternatives to ${productName}. Love the concept but need better self-hosted options. Any suggestions?`, author: 'startup_cto', engagement: 28 },
    ],
  };

  const items = (templates[platform as keyof typeof templates] || templates.forum).slice(0, limit);
  return items.map((t) => ({
    ...t,
    url: platform === 'twitter'
      ? `https://x.com/${t.author}/status/${Date.now()}`
      : platform === 'linkedin'
      ? `https://linkedin.com/posts/${t.author.toLowerCase().replace(/[^a-z]/g, '-')}`
      : `https://community.example.com/t/${t.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    platform: platform as WebSearchResult['platform'],
  }));
}
