// Pipeline Process API
// Full pipeline: Ingest → Classify → Draft → Return DraftedTickets

import { searchReddit } from '@/lib/sources/reddit';
import { searchTwitter } from '@/lib/sources/twitter';
import {
  normalizeRedditPosts,
  normalizeTweets,
  deduplicateFeedbackItems,
  sortByPriority,
} from '@/lib/pipeline/normalizer';
import { classifyFeedback } from '@/lib/pipeline/classifier';
import { draftTicket, createDraftedTicket } from '@/lib/pipeline/drafter';
import type { FeedbackItem, DraftedTicket } from '@/types/pipeline';

export const runtime = 'edge';
export const maxDuration = 120;

interface ProcessRequest {
  sources: ('reddit' | 'twitter')[];
  queries?: string[];
  productName?: string;
  subreddits?: string[];
  limit?: number;
}

export async function POST(req: Request) {
  try {
    const body: ProcessRequest = await req.json();
    const {
      sources = ['reddit'],
      queries = ['saas feedback', 'product feedback'],
      productName,
      subreddits = ['SaaS', 'startups'],
      limit = 10,
    } = body;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        try {
          const allItems: FeedbackItem[] = [];

          // === PHASE 1: INGEST ===
          sendEvent({ type: 'phase', phase: 'ingest', status: 'starting' });

          // Reddit
          if (sources.includes('reddit')) {
            sendEvent({ type: 'status', message: 'Searching Reddit...' });

            for (const subreddit of subreddits.slice(0, 2)) {
              try {
                const searchQuery = productName || queries[0];
                const result = await searchReddit(searchQuery, {
                  subreddit,
                  limit: Math.ceil(limit / 2),
                  time: 'week',
                });

                const items = normalizeRedditPosts(result.posts);
                allItems.push(...items);

                sendEvent({
                  type: 'progress',
                  source: 'reddit',
                  subreddit,
                  found: items.length,
                });
              } catch (error) {
                console.error(`Reddit error:`, error);
              }
            }
          }

          // Twitter
          if (sources.includes('twitter')) {
            sendEvent({ type: 'status', message: 'Searching Twitter...' });

            try {
              const searchQuery = productName || queries[0];
              const result = await searchTwitter(searchQuery, {
                maxResults: limit,
              });

              const items = normalizeTweets(result.tweets);
              allItems.push(...items);

              sendEvent({
                type: 'progress',
                source: 'twitter',
                found: items.length,
              });
            } catch (error) {
              console.error(`Twitter error:`, error);
              sendEvent({
                type: 'warning',
                message: 'Twitter search failed (API key may not be set)',
              });
            }
          }

          // Deduplicate
          const feedbackItems = sortByPriority(
            deduplicateFeedbackItems(allItems, [])
          ).slice(0, limit);

          sendEvent({
            type: 'phase',
            phase: 'ingest',
            status: 'complete',
            count: feedbackItems.length,
          });

          if (feedbackItems.length === 0) {
            sendEvent({
              type: 'complete',
              drafts: [],
              message: 'No feedback items found',
            });
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          // === PHASE 2: CLASSIFY ===
          sendEvent({ type: 'phase', phase: 'classify', status: 'starting' });

          const classifiedItems: Array<{
            item: FeedbackItem;
            classification: Awaited<ReturnType<typeof classifyFeedback>>;
          }> = [];

          for (let i = 0; i < feedbackItems.length; i++) {
            const item = feedbackItems[i];
            sendEvent({
              type: 'status',
              message: `Classifying ${i + 1}/${feedbackItems.length}...`,
            });

            const classification = await classifyFeedback(item);
            classifiedItems.push({ item, classification });

            sendEvent({
              type: 'classified',
              index: i + 1,
              total: feedbackItems.length,
              category: classification.category,
              priority: classification.priority,
            });
          }

          sendEvent({
            type: 'phase',
            phase: 'classify',
            status: 'complete',
          });

          // === PHASE 3: DRAFT ===
          sendEvent({ type: 'phase', phase: 'draft', status: 'starting' });

          const draftedTickets: DraftedTicket[] = [];

          for (let i = 0; i < classifiedItems.length; i++) {
            const { item, classification } = classifiedItems[i];
            sendEvent({
              type: 'status',
              message: `Drafting ticket ${i + 1}/${classifiedItems.length}...`,
            });

            const draft = await draftTicket(item, classification);
            const draftedTicket = createDraftedTicket(
              item,
              classification,
              draft
            );
            draftedTickets.push(draftedTicket);

            sendEvent({
              type: 'drafted',
              index: i + 1,
              total: classifiedItems.length,
              title: draft.title,
            });
          }

          sendEvent({
            type: 'phase',
            phase: 'draft',
            status: 'complete',
          });

          // === COMPLETE ===
          sendEvent({
            type: 'complete',
            drafts: draftedTickets,
            stats: {
              total: draftedTickets.length,
              urgent: draftedTickets.filter(
                (d) => d.classification.priority === 'urgent'
              ).length,
              high: draftedTickets.filter(
                (d) => d.classification.priority === 'high'
              ).length,
              byCategory: {
                bug: draftedTickets.filter(
                  (d) => d.classification.category === 'bug'
                ).length,
                feature_request: draftedTickets.filter(
                  (d) => d.classification.category === 'feature_request'
                ).length,
                other: draftedTickets.filter(
                  (d) =>
                    !['bug', 'feature_request'].includes(
                      d.classification.category
                    )
                ).length,
              },
            },
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Pipeline error:', error);
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'Pipeline failed',
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
    console.error('Process API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process pipeline',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
