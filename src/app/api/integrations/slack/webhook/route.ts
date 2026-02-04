// Slack Events API Webhook
// Receives real-time messages from monitored channels
// Set this URL as the Request URL in Slack App settings

import { analyzeOneFeedback } from '@/lib/automation/analyzer';

export const runtime = 'edge';

interface SlackEvent {
  type: string;
  event?: {
    type: string;
    text?: string;
    user?: string;
    channel?: string;
    ts?: string;
    thread_ts?: string;
  };
  challenge?: string;
  token?: string;
  team_id?: string;
  event_id?: string;
}

// Store for processed events (in production, use Redis or similar)
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json() as SlackEvent;

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification' && body.challenge) {
      return Response.json({ challenge: body.challenge });
    }

    // Verify token (optional but recommended)
    const verificationToken = process.env.SLACK_VERIFICATION_TOKEN;
    if (verificationToken && body.token !== verificationToken) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Handle events
    if (body.type === 'event_callback' && body.event) {
      const event = body.event;

      // Deduplicate events
      if (body.event_id && processedEvents.has(body.event_id)) {
        return Response.json({ ok: true, duplicate: true });
      }
      if (body.event_id) {
        processedEvents.add(body.event_id);
        // Clean up old events (keep last 1000)
        if (processedEvents.size > 1000) {
          const iterator = processedEvents.values();
          for (let i = 0; i < 100; i++) {
            const next = iterator.next();
            if (next.done) break;
            processedEvents.delete(next.value);
          }
        }
      }

      // Handle message events
      if (event.type === 'message' && event.text && !event.thread_ts) {
        // Skip bot messages, thread replies, and empty messages
        if (event.text.length < 10) {
          return Response.json({ ok: true, skipped: 'too_short' });
        }

        // Check if this is a feedback channel
        const feedbackChannels = process.env.SLACK_FEEDBACK_CHANNELS?.split(',') || [];
        if (feedbackChannels.length > 0 && !feedbackChannels.includes(event.channel || '')) {
          return Response.json({ ok: true, skipped: 'not_feedback_channel' });
        }

        // Analyze the message
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (openaiApiKey) {
          try {
            const analysis = await analyzeOneFeedback(event.text, openaiApiKey);

            // If high priority or bug/feature request, take action
            if (
              analysis.priority === 'urgent' ||
              analysis.priority === 'high' ||
              analysis.category === 'bug'
            ) {
              // Log for now - in production, create ticket or alert
              console.log('High priority Slack message:', {
                text: event.text.slice(0, 100),
                analysis,
                channel: event.channel,
                user: event.user,
              });

              // Could auto-create ticket here
              // await createTicketFromSlack(event, analysis);

              // Could send alert to another channel
              // await sendSlackAlert(event, analysis);
            }

            return Response.json({
              ok: true,
              analyzed: true,
              category: analysis.category,
              priority: analysis.priority,
            });
          } catch (error) {
            console.error('Analysis error:', error);
          }
        }

        return Response.json({ ok: true, analyzed: false });
      }

      // Handle app_mention events (when someone @mentions the bot)
      if (event.type === 'app_mention' && event.text) {
        // Remove the mention and analyze
        const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

        if (text.length > 5) {
          // This could trigger the AI chat response
          console.log('Bot mentioned:', text);
        }

        return Response.json({ ok: true, mention: true });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 500 }
    );
  }
}

// GET for health check
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'Slack Webhook',
    timestamp: new Date().toISOString(),
  });
}
