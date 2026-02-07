// Automation Pipeline API
// POST /api/automation/run - Run the full pipeline
// Can be triggered manually, by cron, or webhook

import { runPipeline, PipelineConfig, PipelineResult } from '@/lib/automation/pipeline';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes for large batches

interface RunRequest {
  // Sources
  files?: { content: string; fileName: string }[];
  reddit?: { query: string; subreddit?: string; limit?: number };

  // Product context for better analysis
  productContext?: string;

  // Ticketing config
  ticketing?: {
    enabled: boolean;
    platform: 'linear' | 'github' | 'jira' | 'notion';
    accessToken: string;
    teamId?: string; // Linear
    projectId?: string; // Linear, Jira
    owner?: string; // GitHub
    repo?: string; // GitHub
    baseUrl?: string; // Jira
    databaseId?: string; // Notion
    minPriority?: 'urgent' | 'high' | 'medium' | 'low';
    categories?: string[];
    dryRun?: boolean;
  };

  // Slack notification
  slack?: {
    webhookUrl: string;
    channel?: string;
    mentionOnUrgent?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RunRequest;

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return Response.json({
        success: false,
        demo: true,
        error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your environment to enable the automation pipeline.',
      }, { status: 200 });
    }

    // Validate at least one source
    if (!body.files?.length && !body.reddit) {
      return Response.json(
        { success: false, error: 'At least one data source (files or reddit) is required' },
        { status: 400 }
      );
    }

    // Build pipeline config
    const config: PipelineConfig = {
      sources: {
        files: body.files,
        reddit: body.reddit,
      },
      analysis: {
        openaiApiKey,
        productContext: body.productContext,
      },
    };

    // Add ticketing if enabled
    if (body.ticketing?.enabled) {
      config.ticketing = {
        enabled: true,
        platform: body.ticketing.platform,
        config: {
          platform: body.ticketing.platform,
          accessToken: body.ticketing.accessToken,
          teamId: body.ticketing.teamId,
          projectId: body.ticketing.projectId,
          owner: body.ticketing.owner,
          repo: body.ticketing.repo,
          baseUrl: body.ticketing.baseUrl,
          databaseId: body.ticketing.databaseId,
        },
        minPriority: body.ticketing.minPriority,
        categories: body.ticketing.categories,
        dryRun: body.ticketing.dryRun,
      };
    }

    // Add Slack notification
    if (body.slack?.webhookUrl) {
      config.notifications = {
        slack: body.slack,
      };
    }

    // Run the pipeline
    const result: PipelineResult = await runPipeline(config);

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline failed',
      },
      { status: 500 }
    );
  }
}

// GET /api/automation/run - Health check for cron
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Automation pipeline ready. POST to run.',
    timestamp: new Date().toISOString(),
  });
}
