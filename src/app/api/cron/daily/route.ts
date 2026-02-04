// Daily Automation Cron Job
// Runs the full pipeline on schedule
// Configure in vercel.json or external cron service

import { runPipeline, PipelineConfig } from '@/lib/automation/pipeline';

export const runtime = 'edge';
export const maxDuration = 300;

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret configured, allow (for development)
  if (!cronSecret) return true;

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  // Verify authorization
  if (!verifyCronSecret(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  // Get config from environment variables
  const config: PipelineConfig = {
    sources: {},
    analysis: {
      openaiApiKey,
      productContext: process.env.PRODUCT_CONTEXT,
    },
  };

  // Reddit source (if configured)
  const redditQuery = process.env.REDDIT_MONITOR_QUERY;
  const redditSubreddits = process.env.REDDIT_MONITOR_SUBREDDITS;
  if (redditQuery) {
    config.sources.reddit = {
      query: redditQuery,
      subreddit: redditSubreddits,
      limit: 50,
    };
  }

  // Ticketing (if configured)
  const ticketPlatform = process.env.TICKET_PLATFORM as 'linear' | 'github' | 'jira' | 'notion' | undefined;
  const ticketToken = process.env.TICKET_ACCESS_TOKEN;
  if (ticketPlatform && ticketToken) {
    config.ticketing = {
      enabled: true,
      platform: ticketPlatform,
      config: {
        platform: ticketPlatform,
        accessToken: ticketToken,
        teamId: process.env.LINEAR_TEAM_ID,
        projectId: process.env.TICKET_PROJECT_ID,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        baseUrl: process.env.JIRA_BASE_URL,
        databaseId: process.env.NOTION_DATABASE_ID,
      },
      minPriority: (process.env.TICKET_MIN_PRIORITY as 'urgent' | 'high' | 'medium' | 'low') || 'high',
      categories: ['bug', 'feature_request'],
    };
  }

  // Slack notification (if configured)
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhook) {
    config.notifications = {
      slack: {
        webhookUrl: slackWebhook,
        mentionOnUrgent: process.env.SLACK_MENTION_ON_URGENT,
      },
    };
  }

  // Check if any sources configured
  if (!config.sources.reddit && !config.sources.files?.length) {
    return Response.json({
      success: false,
      error: 'No data sources configured. Set REDDIT_MONITOR_QUERY environment variable.',
    }, { status: 400 });
  }

  try {
    const result = await runPipeline(config);

    return Response.json({
      success: true,
      summary: {
        itemsProcessed: result.analysis.summary.total,
        ticketsCreated: result.tickets?.created.length || 0,
        slackNotified: result.notificationsSent.slack || false,
        duration: result.duration,
        timestamp: result.timestamp,
      },
      recommendations: result.analysis.recommendations,
    });
  } catch (error) {
    console.error('Cron pipeline error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Pipeline failed',
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST(req: Request) {
  return GET(req);
}
