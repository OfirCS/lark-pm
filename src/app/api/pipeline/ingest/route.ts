// Pipeline Ingest API
// Fetches data from Reddit and Twitter, normalizes to FeedbackItems

import { searchReddit } from '@/lib/sources/reddit';
import { searchTwitter } from '@/lib/sources/twitter';
import {
  normalizeRedditPosts,
  normalizeTweets,
  deduplicateFeedbackItems,
  sortByPriority,
} from '@/lib/pipeline/normalizer';
import type { FeedbackItem } from '@/types/pipeline';

export const runtime = 'edge';
export const maxDuration = 60;

interface IngestRequest {
  sources: ('reddit' | 'twitter')[];
  queries?: string[];
  productName?: string;
  subreddits?: string[];
  limit?: number;
}

export async function POST(req: Request) {
  try {
    const body: IngestRequest = await req.json();
    const {
      sources = ['reddit'],
      queries = ['saas feedback', 'product feedback'],
      productName,
      subreddits = ['SaaS', 'startups', 'ProductManagement'],
      limit = 20,
    } = body;

    const encoder = new TextEncoder();
    const allItems: FeedbackItem[] = [];

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        try {
          // Ingest from Reddit
          if (sources.includes('reddit')) {
            sendEvent({
              type: 'status',
              source: 'reddit',
              status: 'starting',
            });

            for (const subreddit of subreddits.slice(0, 3)) {
              try {
                const searchQuery = productName || queries[0];
                sendEvent({
                  type: 'status',
                  source: 'reddit',
                  status: 'searching',
                  detail: `r/${subreddit}`,
                });

                const result = await searchReddit(searchQuery, {
                  subreddit,
                  limit: Math.ceil(limit / subreddits.length),
                  time: 'week',
                });

                const items = normalizeRedditPosts(result.posts);
                allItems.push(...items);

                sendEvent({
                  type: 'progress',
                  source: 'reddit',
                  subreddit,
                  count: items.length,
                });
              } catch (error) {
                console.error(`Reddit r/${subreddit} error:`, error);
                sendEvent({
                  type: 'error',
                  source: 'reddit',
                  subreddit,
                  error: error instanceof Error ? error.message : 'Unknown error',
                });
              }
            }

            sendEvent({
              type: 'status',
              source: 'reddit',
              status: 'complete',
              totalCount: allItems.filter((i) => i.source === 'reddit').length,
            });
          }

          // Ingest from Twitter
          if (sources.includes('twitter')) {
            sendEvent({
              type: 'status',
              source: 'twitter',
              status: 'starting',
            });

            for (const query of queries.slice(0, 2)) {
              try {
                sendEvent({
                  type: 'status',
                  source: 'twitter',
                  status: 'searching',
                  detail: query,
                });

                const result = await searchTwitter(query, {
                  maxResults: Math.ceil(limit / queries.length),
                });

                const items = normalizeTweets(result.tweets);
                allItems.push(...items);

                sendEvent({
                  type: 'progress',
                  source: 'twitter',
                  query,
                  count: items.length,
                });
              } catch (error) {
                console.error(`Twitter "${query}" error:`, error);
                sendEvent({
                  type: 'error',
                  source: 'twitter',
                  query,
                  error: error instanceof Error ? error.message : 'Unknown error',
                });
              }
            }

            sendEvent({
              type: 'status',
              source: 'twitter',
              status: 'complete',
              totalCount: allItems.filter((i) => i.source === 'twitter').length,
            });
          }

          // Deduplicate and sort
          sendEvent({ type: 'status', status: 'deduplicating' });
          const deduplicated = deduplicateFeedbackItems(allItems, []);
          const sorted = sortByPriority(deduplicated);

          // Send final results
          sendEvent({
            type: 'complete',
            items: sorted,
            stats: {
              total: sorted.length,
              reddit: sorted.filter((i) => i.source === 'reddit').length,
              twitter: sorted.filter((i) => i.source === 'twitter').length,
              removed: allItems.length - sorted.length,
            },
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Ingest pipeline error:', error);
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'Pipeline error',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Ingest API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to start ingestion',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
