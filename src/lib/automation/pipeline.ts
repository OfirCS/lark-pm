// Main automation pipeline
// Orchestrates: Ingest → Analyze → Create Tickets → Notify

import { parseFile, ParseResult, ParsedFeedback } from '../parsers';
import { analyzeFeedbackBatch, AnalysisResult, AnalyzedFeedback } from './analyzer';
import { createTicketsFromFeedback, sendSlackDigest, TicketCreationConfig, SlackNotificationConfig, TicketCreationResult } from './ticketCreator';
import { searchReddit } from '../sources/reddit';
import { IntegrationPlatform } from '../integrations';

export interface PipelineConfig {
  // Data sources
  sources: {
    files?: { content: string; fileName: string }[];
    reddit?: { query: string; subreddit?: string; limit?: number };
    // Future: twitter, slack, intercom, zoom
  };

  // Analysis
  analysis: {
    openaiApiKey: string;
    productContext?: string;
  };

  // Ticket creation
  ticketing?: {
    enabled: boolean;
    platform: IntegrationPlatform;
    config: TicketCreationConfig['config'];
    minPriority?: TicketCreationConfig['minPriority'];
    categories?: string[];
    dryRun?: boolean;
  };

  // Notifications
  notifications?: {
    slack?: SlackNotificationConfig;
  };
}

export interface PipelineResult {
  // Ingestion results
  ingested: {
    files: ParseResult[];
    reddit?: { posts: number; query: string };
    totalItems: number;
  };

  // Analysis results
  analysis: AnalysisResult;

  // Ticket creation results
  tickets?: TicketCreationResult;

  // Notifications
  notificationsSent: {
    slack?: boolean;
  };

  // Metadata
  duration: number;
  timestamp: string;
}

/**
 * Run the full automation pipeline
 *
 * 1. Ingest data from all configured sources
 * 2. Analyze with AI (classify, prioritize, cluster)
 * 3. Create tickets automatically
 * 4. Send notifications
 */
export async function runPipeline(config: PipelineConfig): Promise<PipelineResult> {
  const startTime = Date.now();
  const allFeedback: ParsedFeedback[] = [];

  // Track ingestion results
  const ingested: PipelineResult['ingested'] = {
    files: [],
    totalItems: 0,
  };

  // ========== STEP 1: INGEST ==========

  // 1a. Parse files
  if (config.sources.files && config.sources.files.length > 0) {
    for (const file of config.sources.files) {
      const result = parseFile(file.content, file.fileName);
      ingested.files.push(result);

      if (result.success) {
        allFeedback.push(...result.items);
      }
    }
  }

  // 1b. Fetch from Reddit
  if (config.sources.reddit) {
    try {
      const redditResult = await searchReddit(config.sources.reddit.query, {
        subreddit: config.sources.reddit.subreddit,
        limit: config.sources.reddit.limit || 25,
      });

      const redditFeedback: ParsedFeedback[] = redditResult.posts.map(post => ({
        id: post.id,
        content: `${post.title}\n\n${post.selftext || ''}`.trim(),
        source: `reddit:r/${post.subreddit}`,
        author: post.author,
        date: new Date(post.created_utc * 1000).toISOString(),
        metadata: {
          url: post.url,
          score: post.score,
          numComments: post.num_comments,
        },
      }));

      allFeedback.push(...redditFeedback);
      ingested.reddit = {
        posts: redditFeedback.length,
        query: config.sources.reddit.query,
      };
    } catch (error) {
      console.error('Reddit fetch error:', error);
    }
  }

  ingested.totalItems = allFeedback.length;

  // If no feedback, return early
  if (allFeedback.length === 0) {
    return {
      ingested,
      analysis: {
        items: [],
        summary: {
          total: 0,
          byCategory: { bug: 0, feature_request: 0, complaint: 0, praise: 0, question: 0, other: 0 },
          bySentiment: { positive: 0, neutral: 0, negative: 0 },
          byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
          topTags: [],
          topProductAreas: [],
        },
        recommendations: ['No feedback items to analyze'],
      },
      notificationsSent: {},
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  // ========== STEP 2: ANALYZE ==========

  const analysis = await analyzeFeedbackBatch(allFeedback, {
    apiKey: config.analysis.openaiApiKey,
    productContext: config.analysis.productContext,
  });

  // ========== STEP 3: CREATE TICKETS ==========

  let tickets: TicketCreationResult | undefined;

  if (config.ticketing?.enabled) {
    tickets = await createTicketsFromFeedback(analysis.items, {
      platform: config.ticketing.platform,
      config: config.ticketing.config,
      minPriority: config.ticketing.minPriority,
      categories: config.ticketing.categories,
      dryRun: config.ticketing.dryRun,
    });
  }

  // ========== STEP 4: NOTIFY ==========

  const notificationsSent: PipelineResult['notificationsSent'] = {};

  if (config.notifications?.slack) {
    notificationsSent.slack = await sendSlackDigest(
      analysis.items,
      config.notifications.slack,
      tickets
    );
  }

  // ========== RETURN RESULTS ==========

  return {
    ingested,
    analysis,
    tickets,
    notificationsSent,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quick analyze - just parse and analyze, no tickets or notifications
 */
export async function quickAnalyze(
  content: string,
  fileName: string,
  openaiApiKey: string,
  productContext?: string
): Promise<{
  parsed: ParseResult;
  analysis: AnalysisResult | null;
}> {
  const parsed = parseFile(content, fileName);

  if (!parsed.success || parsed.items.length === 0) {
    return { parsed, analysis: null };
  }

  const analysis = await analyzeFeedbackBatch(parsed.items, {
    apiKey: openaiApiKey,
    productContext,
  });

  return { parsed, analysis };
}
