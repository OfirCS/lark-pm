import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `You are Lark, an AI assistant for product managers. You help analyze customer feedback, sentiment, and feature requests across multiple platforms.

Your capabilities:
1. Search social platforms (Reddit, Twitter/X, LinkedIn) for customer mentions
2. Analyze sentiment and identify trends
3. Calculate business impact by stakeholder role (developers, UI/UX, stakeholders)
4. Generate recommendations on feature prioritization

When responding:
- Be concise and data-driven
- Always cite specific numbers and sources
- Proactively offer helpful follow-up actions
- Use a conversational but professional tone

When the user asks about customer feedback or features:
1. First acknowledge their question
2. Ask which platforms they want to search (offer options)
3. Show search progress as you gather data
4. Present findings with sentiment breakdown
5. Offer to analyze business impact or generate PRD

Format your responses for streaming - keep initial responses short and build up.`;

// Mock data for demonstration (in production, this would call actual APIs)
const mockSearchResults = [
  {
    platform: 'reddit',
    id: '1',
    content: 'Really need SSO for our enterprise deployment. This is blocking our entire team.',
    author: 'u/pm_enthusiast',
    metadata: { subreddit: 'r/SaaS', upvotes: 127, comments: 34, timestamp: '2h ago' },
    sentiment: 'neutral',
    relevanceScore: 95,
    extractedInsights: ['SSO requirement', 'enterprise blocker'],
  },
  {
    platform: 'twitter',
    id: '2',
    content: 'Trying this new PM tool, love the UI but desperately need Figma integration',
    author: '@ProductHuntCEO',
    metadata: { likes: 284, retweets: 45, timestamp: '4h ago' },
    sentiment: 'positive',
    relevanceScore: 88,
    extractedInsights: ['Figma integration request', 'positive UI feedback'],
  },
  {
    platform: 'reddit',
    id: '3',
    content: 'Compared vs Productboard - wins on Reddit monitoring but needs better Jira sync',
    author: 'u/startup_founder',
    metadata: { subreddit: 'r/startups', upvotes: 89, comments: 12, timestamp: '6h ago' },
    sentiment: 'positive',
    relevanceScore: 82,
    extractedInsights: ['competitor comparison', 'Jira integration gap'],
  },
];

const mockImpactAnalysis = {
  feature: 'SSO / SAML Authentication',
  recommendation: 'ship_now',
  confidence: 94,
  roles: [
    {
      role: 'developer',
      sentimentScore: 56,
      mentionCount: 34,
      keyConcerns: [],
      keyBenefits: ['Enterprise unblock', 'Security compliance'],
      representativeQuote: 'Would unblock our enterprise customers immediately',
    },
    {
      role: 'uiux',
      sentimentScore: 4,
      mentionCount: 8,
      keyConcerns: ['Login flow complexity', 'Additional screens'],
      keyBenefits: ['Better enterprise UX'],
      representativeQuote: 'Concerned about added complexity in the auth flow',
    },
    {
      role: 'stakeholder',
      sentimentScore: 90,
      mentionCount: 12,
      keyConcerns: ['Timeline'],
      keyBenefits: ['Revenue unlock', 'Enterprise market'],
      representativeQuote: '$450K ARR blocked on this single feature',
    },
  ],
  revenueImpact: {
    atRiskArr: 780000,
    potentialExpansion: 240000,
    churnMentions: 4,
  },
  effortEstimate: {
    tShirt: 'M',
    confidence: 75,
  },
};

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json();

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process in background
    (async () => {
      try {
        // Send initial thinking state
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'thinking',
              data: {
                steps: [
                  { id: '1', text: 'Understanding your question...', status: 'in_progress', timestamp: new Date() },
                ],
              },
            })}\n\n`
          )
        );

        // Check if API key is available
        if (!process.env.ANTHROPIC_API_KEY) {
          // Demo mode - simulate responses
          await simulateDemoResponse(writer, encoder, messages);
        } else {
          // Real API mode
          await processWithClaude(writer, encoder, messages, context);
        }
      } catch (error) {
        console.error('Stream error:', error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'text',
              content: 'Sorry, I encountered an error. Please try again.',
            })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

async function simulateDemoResponse(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  messages: { role: string; content: string }[]
) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Simulate delay
  await new Promise((r) => setTimeout(r, 500));

  // Update thinking
  await writer.write(
    encoder.encode(
      `data: ${JSON.stringify({
        type: 'thinking',
        data: {
          steps: [
            { id: '1', text: 'Understanding your question...', status: 'completed', timestamp: new Date() },
            { id: '2', text: 'Analyzing context...', status: 'in_progress', timestamp: new Date() },
          ],
        },
      })}\n\n`
    )
  );

  await new Promise((r) => setTimeout(r, 300));

  // Check for keywords and respond appropriately
  if (lastMessage.includes('sso') || lastMessage.includes('feature') || lastMessage.includes('customer')) {
    // Show options first
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'options',
          content: "I can search for customer feedback about this. Where should I look?",
          data: {
            options: [
              { id: 'reddit', label: 'Reddit', icon: 'reddit', count: 34 },
              { id: 'twitter', label: 'Twitter/X', icon: 'twitter', count: 19 },
              { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', count: 8 },
              { id: 'all', label: 'All Sources', icon: 'all', count: 61 },
            ],
          },
        })}\n\n`
      )
    );
  } else if (lastMessage.includes('all') || lastMessage.includes('search')) {
    // Show search progress
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'search_progress',
          data: {
            progress: {
              platforms: [
                { platform: 'reddit', status: 'searching' },
                { platform: 'twitter', status: 'pending' },
                { platform: 'linkedin', status: 'pending' },
              ],
              totalFound: 0,
            },
          },
        })}\n\n`
      )
    );

    await new Promise((r) => setTimeout(r, 800));

    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'search_progress',
          data: {
            progress: {
              platforms: [
                { platform: 'reddit', status: 'completed', count: 34 },
                { platform: 'twitter', status: 'searching' },
                { platform: 'linkedin', status: 'pending' },
              ],
              totalFound: 34,
            },
          },
        })}\n\n`
      )
    );

    await new Promise((r) => setTimeout(r, 600));

    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'search_progress',
          data: {
            progress: {
              platforms: [
                { platform: 'reddit', status: 'completed', count: 34 },
                { platform: 'twitter', status: 'completed', count: 19 },
                { platform: 'linkedin', status: 'completed', count: 8 },
              ],
              totalFound: 61,
            },
          },
        })}\n\n`
      )
    );

    await new Promise((r) => setTimeout(r, 400));

    // Show results
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'results',
          content: "Found 61 relevant mentions. Here's what customers are saying:",
          data: {
            results: mockSearchResults,
            sentiment: {
              positive: 67,
              negative: 12,
              neutral: 21,
              trend: 'up',
              topThemes: [
                { theme: 'SSO/Authentication', count: 23, sentiment: 'neutral' },
                { theme: 'Integrations', count: 18, sentiment: 'positive' },
                { theme: 'Pricing', count: 8, sentiment: 'negative' },
              ],
            },
          },
        })}\n\n`
      )
    );

    await new Promise((r) => setTimeout(r, 500));

    // Offer follow-up
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'options',
          content: 'Would you like me to analyze the business impact?',
          data: {
            options: [
              { id: 'impact', label: 'Analyze Impact', description: 'By stakeholder role' },
              { id: 'prd', label: 'Generate PRD', description: 'From customer insights' },
              { id: 'roadmap', label: 'Add to Roadmap', description: 'Create feature ticket' },
            ],
          },
        })}\n\n`
      )
    );
  } else if (lastMessage.includes('impact') || lastMessage.includes('analyze')) {
    // Show impact analysis
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'impact',
          data: {
            impact: mockImpactAnalysis,
          },
        })}\n\n`
      )
    );
  } else {
    // Default response
    await writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          type: 'text',
          content: "I can help you analyze customer feedback, search for feature requests, or calculate business impact. What would you like to know about?",
        })}\n\n`
      )
    );
  }
}

async function processWithClaude(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  messages: { role: string; content: string }[],
  context: unknown
) {
  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'text',
            content: event.delta.text,
          })}\n\n`
        )
      );
    }
  }
}
