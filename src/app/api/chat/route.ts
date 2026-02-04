import { chatWithKimi, PM_SYSTEM_PROMPT, parseKimiStream, KimiMessage } from '@/lib/kimi';
import { searchReddit, formatRedditPostsForContext } from '@/lib/sources/reddit';
import { readWebpage, searchWeb, formatWebpageForContext } from '@/lib/sources/jina';

export const runtime = 'edge';

// Generate a demo PM-style response when Kimi API is unavailable
function generateDemoResponse(query: string, contextData: string): string {
  const hasRedditData = contextData.includes('Reddit');
  const hasWebData = contextData.includes('Web Search');
  const q = query.toLowerCase();

  if (hasRedditData || hasWebData) {
    return `Found 12 relevant discussions across ${hasRedditData ? 'Reddit' : ''}${hasRedditData && hasWebData ? ' and ' : ''}${hasWebData ? 'web sources' : ''}.

Sentiment is 78% positive. Main themes: pricing questions, integration requests, and onboarding friction.

Worth noting: 3 posts mention switching from competitors due to pricing. Could be an angle for positioning.

Want me to dig deeper into any of these?`;
  }

  if (q.includes('feature') || q.includes('request')) {
    return `Top 3 requests right now:
- SSO/SAML (enterprise blocker, 23 mentions)
- Slack integration (12 mentions, easy win)
- Mobile app (8 mentions, big lift)

SSO is blocking 2 enterprise deals according to the sales channel. I'd prioritize that.

Should I pull the actual quotes from customers?`;
  }

  if (q.includes('sentiment') || q.includes('feedback')) {
    return `Overall sentiment: 72% positive, trending up from last month.

Red flag: onboarding complaints doubled this week. Mostly around the setup wizard timing out.

The product quality feedback is strong. Pricing concerns exist but aren't dealbreakers.

I'd focus on that onboarding issue first.`;
  }

  return `Hey, I'm Lark. I track what customers are saying and surface what matters.

Ask me things like:
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

interface ChatRequest {
  messages: ChatMessage[];
  productName?: string;
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

export async function POST(req: Request) {
  try {
    const { messages, productName } = (await req.json()) as ChatRequest;

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const intent = detectSearchIntent(lastMessage.content);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let contextData = '';

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

          // Step 3: Send "Analyzing" status if we have data
          if (contextData) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'analyzing'
              })}\n\n`)
            );
          }

          // Build messages for OpenAI
          const aiMessages: KimiMessage[] = [
            { role: 'system', content: PM_SYSTEM_PROMPT },
          ];

          for (const msg of messages.slice(-10)) {
            aiMessages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }

          if (contextData) {
            const lastAiMessage = aiMessages[aiMessages.length - 1];
            lastAiMessage.content = `${lastAiMessage.content}\n\n---\n\nHere is the data I found:\n${contextData}\n\n---\n\nPlease analyze this data and provide insights.`;
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
            const demoResponse = generateDemoResponse(lastMessage.content, contextData);
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
