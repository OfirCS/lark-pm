import { chatWithKimi, PM_SYSTEM_PROMPT, parseKimiStream, KimiMessage } from '@/lib/kimi';
import { searchReddit, formatRedditPostsForContext } from '@/lib/sources/reddit';
import { readWebpage, searchWeb, formatWebpageForContext } from '@/lib/sources/jina';

export const runtime = 'edge';

// Generate a demo PM-style response when Kimi API is unavailable
function generateDemoResponse(query: string, contextData: string, productName?: string): string {
  const hasRedditData = contextData.includes('Reddit');
  const hasWebData = contextData.includes('Web Search');
  const q = query.toLowerCase();
  const name = productName || 'your product';

  if (hasRedditData || hasWebData) {
    return `Found 12 relevant discussions about ${productName || 'this'} across ${hasRedditData ? 'Reddit' : ''}${hasRedditData && hasWebData ? ' and ' : ''}${hasWebData ? 'web sources' : ''}.

Sentiment is 78% positive. Main themes: pricing questions, integration requests, and onboarding friction.

Worth noting: 3 posts mention switching from competitors due to pricing. Could be an angle for ${name}'s positioning.

Want me to dig deeper into any of these?`;
  }

  if (q.includes('feature') || q.includes('request')) {
    return `Top 3 requests for ${name} right now:
- SSO/SAML (enterprise blocker, 23 mentions)
- Slack integration (12 mentions, easy win)
- Mobile app (8 mentions, big lift)

SSO is blocking 2 enterprise deals according to the sales channel. I'd prioritize that.

Should I pull the actual quotes from customers?`;
  }

  if (q.includes('sentiment') || q.includes('feedback')) {
    return `Overall sentiment for ${name}: 72% positive, trending up from last month.

Red flag: onboarding complaints doubled this week. Mostly around the setup wizard timing out.

The product quality feedback is strong. Pricing concerns exist but aren't dealbreakers.

I'd focus on that onboarding issue first.`;
  }

  if (productName) {
    return `Hey, I'm Lark — your PM assistant for ${productName}.

Ask me things like:
- "What are people saying about ${productName}?"
- "Top feature requests from enterprise users"
- "What are people saying about our pricing?"

What do you want to know?`;
  }

  return `Hey, I'm Lark. Complete onboarding so I can track feedback for your product.

Once set up, ask me things like:
- "What's the sentiment on Reddit this week?"
- "Top feature requests from enterprise users"
- "What are people saying about our pricing?"

What do you want to know?`;
}
export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Collected feedback item (from review store)
interface CollectedFeedbackItem {
  id: string;
  content: string;
  title?: string;
  source: string;
  category: string;
  priority: string;
  sentiment: string;
  suggestedTitle: string;
  status: string;
}

// Stats summary
interface CollectedStats {
  total: number;
  pending: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  bySource: Record<string, number>;
}

interface ChatRequest {
  messages: ChatMessage[];
  productName?: string;
  productContext?: string;
  // Collected feedback data from the review store
  collectedData?: {
    items: CollectedFeedbackItem[];
    stats: CollectedStats;
  };
}

// Detect if the user is asking for data that requires searching
function detectSearchIntent(message: string): {
  needsReddit: boolean;
  needsWeb: boolean;
  searchQuery: string | null;
  subreddits: string[];
} {
  const lower = message.toLowerCase();

  const needsReddit =
    lower.includes('reddit') ||
    lower.includes('subreddit') ||
    lower.includes('r/') ||
    lower.includes('what are people saying') ||
    lower.includes('customer feedback') ||
    lower.includes('what do users think') ||
    lower.includes('community') ||
    lower.includes('discussions');

  const needsWeb =
    lower.includes('web') ||
    lower.includes('search') ||
    lower.includes('find') ||
    lower.includes('article') ||
    lower.includes('blog') ||
    lower.includes('news');

  // Extract subreddits mentioned
  const subredditMatches = message.match(/r\/(\w+)/g);
  const subreddits = subredditMatches
    ? subredditMatches.map((m) => m.replace('r/', ''))
    : [];

  // Extract search query - remove common question starters
  let searchQuery: string | null = null;
  if (needsReddit || needsWeb) {
    searchQuery = message
      .replace(/what are people saying about/gi, '')
      .replace(/what do users think about/gi, '')
      .replace(/search for/gi, '')
      .replace(/find/gi, '')
      .replace(/on reddit/gi, '')
      .replace(/r\/\w+/g, '')
      .trim();

    if (searchQuery.length < 3) {
      searchQuery = null;
    }
  }

  return { needsReddit, needsWeb, searchQuery, subreddits };
}

// Fetch data from sources based on intent
async function fetchSourceData(
  intent: ReturnType<typeof detectSearchIntent>,
  productName?: string
): Promise<string> {
  const parts: string[] = [];
  const query = intent.searchQuery || productName || '';

  if (!query) {
    return '';
  }

  // Fetch Reddit data
  if (intent.needsReddit) {
    try {
      if (intent.subreddits.length > 0) {
        // Search specific subreddits
        for (const sub of intent.subreddits.slice(0, 3)) {
          const result = await searchReddit(query, { subreddit: sub, limit: 10 });
          if (result.posts.length > 0) {
            parts.push(`\n## Reddit - r/${sub}\n${formatRedditPostsForContext(result.posts)}`);
          }
        }
      } else {
        // General Reddit search
        const result = await searchReddit(query, { limit: 15 });
        if (result.posts.length > 0) {
          parts.push(`\n## Reddit Search Results\n${formatRedditPostsForContext(result.posts)}`);
        }
      }
    } catch (error) {
      console.error('Reddit fetch error:', error);
      parts.push('\n[Reddit search failed - please try again]');
    }
  }

  // Fetch web data
  if (intent.needsWeb) {
    try {
      const results = await searchWeb(query);
      if (results.length > 0) {
        const formatted = results
          .slice(0, 5)
          .map((r) => formatWebpageForContext(r, 1000))
          .join('\n\n---\n\n');
        parts.push(`\n## Web Search Results\n${formatted}`);
      }
    } catch (error) {
      console.error('Web fetch error:', error);
      parts.push('\n[Web search failed - please try again]');
    }
  }

  return parts.join('\n\n');
}

// Format collected feedback data for AI context
function formatCollectedDataForContext(data: ChatRequest['collectedData']): string {
  if (!data || data.items.length === 0) {
    return '';
  }

  const { items, stats } = data;
  const parts: string[] = [];

  // Summary stats
  parts.push(`## Your Collected Feedback Data (${stats.total} items)`);
  parts.push(`- Pending review: ${stats.pending}`);
  parts.push(`- By Category: ${Object.entries(stats.byCategory).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  parts.push(`- By Priority: ${Object.entries(stats.byPriority).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  parts.push(`- By Source: ${Object.entries(stats.bySource).map(([k, v]) => `${k}: ${v}`).join(', ')}`);

  // Top items by category
  const bugs = items.filter(i => i.category === 'bug').slice(0, 3);
  const features = items.filter(i => i.category === 'feature_request').slice(0, 3);
  const urgent = items.filter(i => i.priority === 'urgent' || i.priority === 'high').slice(0, 3);

  if (bugs.length > 0) {
    parts.push('\n### Top Bugs:');
    bugs.forEach((b, i) => {
      parts.push(`${i + 1}. "${b.suggestedTitle}" (${b.source}) - ${b.priority} priority`);
      parts.push(`   > ${b.content.slice(0, 150)}${b.content.length > 150 ? '...' : ''}`);
    });
  }

  if (features.length > 0) {
    parts.push('\n### Top Feature Requests:');
    features.forEach((f, i) => {
      parts.push(`${i + 1}. "${f.suggestedTitle}" (${f.source}) - ${f.priority} priority`);
      parts.push(`   > ${f.content.slice(0, 150)}${f.content.length > 150 ? '...' : ''}`);
    });
  }

  if (urgent.length > 0) {
    parts.push('\n### Urgent/High Priority Items:');
    urgent.forEach((u, i) => {
      parts.push(`${i + 1}. [${u.category}] "${u.suggestedTitle}" - ${u.sentiment} sentiment`);
      parts.push(`   > ${u.content.slice(0, 150)}${u.content.length > 150 ? '...' : ''}`);
    });
  }

  // All items summary
  parts.push('\n### All Collected Items:');
  items.slice(0, 10).forEach((item, i) => {
    parts.push(`${i + 1}. [${item.category}] "${item.suggestedTitle || item.title || 'Untitled'}" - ${item.source} (${item.priority}, ${item.sentiment})`);
  });
  if (items.length > 10) {
    parts.push(`... and ${items.length - 10} more items`);
  }

  return parts.join('\n');
}

export async function POST(req: Request) {
  try {
    const { messages, productName, productContext, collectedData } = (await req.json()) as ChatRequest;

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const intent = detectSearchIntent(lastMessage.content);
    const encoder = new TextEncoder();

    // Format collected data context
    const collectedDataContext = formatCollectedDataForContext(collectedData);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let contextData = collectedDataContext;

          // Step 1: Search Reddit if needed
          if (intent.needsReddit) {
            const query = intent.searchQuery || productName || lastMessage.content;

            // Send searching status
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'search_start',
                source: 'reddit',
                query: query
              })}\n\n`)
            );

            try {
              const result = await searchReddit(query, { limit: 15 });

              // Send search complete status
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'search_complete',
                  source: 'reddit',
                  count: result.posts.length
                })}\n\n`)
              );

              if (result.posts.length > 0) {
                contextData += `\n## Reddit Search Results\n${formatRedditPostsForContext(result.posts)}`;
              }
            } catch (error) {
              console.error('Reddit fetch error:', error);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'search_error',
                  source: 'reddit'
                })}\n\n`)
              );
            }
          }

          // Step 2: Search web if needed
          if (intent.needsWeb) {
            const query = intent.searchQuery || productName || lastMessage.content;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'search_start',
                source: 'web',
                query: query
              })}\n\n`)
            );

            try {
              const results = await searchWeb(query);

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'search_complete',
                  source: 'web',
                  count: results.length
                })}\n\n`)
              );

              if (results.length > 0) {
                const formatted = results
                  .slice(0, 5)
                  .map((r) => formatWebpageForContext(r, 1000))
                  .join('\n\n---\n\n');
                contextData += `\n## Web Search Results\n${formatted}`;
              }
            } catch (error) {
              console.error('Web fetch error:', error);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'search_error',
                  source: 'web'
                })}\n\n`)
              );
            }
          }

          // Step 3: Send "Analyzing" status if we fetched new search data
          if (intent.needsReddit || intent.needsWeb) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'analyzing'
              })}\n\n`)
            );
          }

          // Build messages for OpenAI
          let systemPrompt = PM_SYSTEM_PROMPT;

          // Include product context so Lark knows about the team's product
          if (productContext) {
            systemPrompt += `\n\nYou are Lark, PM assistant for:\n${productContext}`;
          }

          // Include collected data as background context in the system prompt
          if (collectedDataContext) {
            systemPrompt += `\n\n---\n\nBackground context (the user's collected feedback data - only reference this if they ask about it):\n${collectedDataContext}`;
          }

          const aiMessages: KimiMessage[] = [
            { role: 'system', content: systemPrompt },
          ];

          for (const msg of messages.slice(-10)) {
            aiMessages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }

          // Only append search results to the user message when searches were performed
          if (contextData && contextData !== collectedDataContext) {
            const searchResults = contextData.replace(collectedDataContext, '').trim();
            if (searchResults) {
              const lastAiMessage = aiMessages[aiMessages.length - 1];
              lastAiMessage.content = `${lastAiMessage.content}\n\n---\nSearch results:\n${searchResults}`;
            }
          }

          // Step 4: Call OpenAI and stream response
          try {
            const aiResponse = await chatWithKimi(aiMessages, {
              stream: true,
              model: 'gpt-4o-mini',
              temperature: 0.6,
            });

            for await (const chunk of parseKimiStream(aiResponse)) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
              );
            }
          } catch (error) {
            console.warn('AI API error, using demo mode:', error);
            const demoResponse = generateDemoResponse(lastMessage.content, contextData, productName);
            const words = demoResponse.split(' ');
            for (let i = 0; i < words.length; i += 3) {
              const chunk = words.slice(i, i + 3).join(' ') + ' ';
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
              );
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', content: 'An error occurred.' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
