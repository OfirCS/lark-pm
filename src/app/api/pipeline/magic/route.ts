// Magic Pipeline API - One-click E2E: Search → Extract → Cluster → Analyze
// POST /api/pipeline/magic

import { NextRequest, NextResponse } from 'next/server';
import { searchReddit } from '@/lib/sources/reddit';
import { searchTwitter } from '@/lib/sources/twitter';
import { normalizeRedditPosts, normalizeTweets } from '@/lib/pipeline/normalizer';
import { classifyFeedback } from '@/lib/pipeline/classifier';
import { clusterFeedbackWithAI, ClusteredFeedback } from '@/lib/pipeline/clusterer';
import type { FeedbackItem, ClassificationResult } from '@/types/pipeline';

export const maxDuration = 120; // 2 minutes for full pipeline

interface MagicPipelineRequest {
  // What to search for
  productName: string;
  searchTerms?: string[];
  competitors?: string[];

  // Where to search
  sources?: {
    reddit?: { subreddits?: string[]; enabled?: boolean };
    twitter?: { enabled?: boolean };
  };

  // Options
  maxItems?: number;
  autoCluster?: boolean;
}

interface MagicPipelineResponse {
  success: boolean;
  // Raw items found
  rawItems: Array<{
    item: FeedbackItem;
    classification: ClassificationResult;
  }>;
  // Clustered into potential tickets
  clusters: ClusteredFeedback[];
  // Summary stats
  stats: {
    totalFound: number;
    totalClusters: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    bySentiment: Record<string, number>;
    bySource: Record<string, number>;
  };
  // Insights
  insights: {
    topIssues: string[];
    urgentItems: number;
    sentimentScore: number;
    recommendations: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MagicPipelineRequest;
    const { productName, searchTerms = [], competitors = [], sources, maxItems = 30 } = body;

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const allItems: Array<{ item: FeedbackItem; classification: ClassificationResult }> = [];

    // Build search queries
    const queries = [
      productName,
      `${productName} feedback`,
      `${productName} review`,
      ...searchTerms,
      ...competitors.map(c => `${productName} vs ${c}`),
    ].slice(0, 5);

    // === STEP 1: SEARCH SOURCES ===

    // Search Reddit
    if (sources?.reddit?.enabled !== false) {
      const subreddits = sources?.reddit?.subreddits || ['SaaS', 'startups', 'ProductManagement', 'Entrepreneur'];

      for (const query of queries.slice(0, 2)) {
        for (const subreddit of subreddits.slice(0, 3)) {
          try {
            // Use the API route instead of direct call to avoid CORS
            const baseUrl = request.nextUrl.origin;
            const response = await fetch(`${baseUrl}/api/sources/reddit/search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, subreddit, limit: 5 }),
            });

            if (response.ok) {
              const result = await response.json();
              if (result.posts?.length > 0) {
                const normalized = normalizeRedditPosts(result.posts);
                for (const item of normalized.slice(0, 3)) {
                  if (allItems.length >= maxItems) break;
                  const classification = await classifyFeedback(item);
                  allItems.push({ item, classification });
                }
              }
            }
          } catch (error) {
            console.error(`Reddit search error for ${query} in r/${subreddit}:`, error);
          }

          if (allItems.length >= maxItems) break;
        }
        if (allItems.length >= maxItems) break;
      }
    }

    // Search Twitter (if configured)
    if (sources?.twitter?.enabled !== false) {
      for (const query of queries.slice(0, 2)) {
        try {
          const baseUrl = request.nextUrl.origin;
          const response = await fetch(`${baseUrl}/api/sources/twitter/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, maxResults: 10 }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.tweets?.length > 0) {
              const normalized = normalizeTweets(result.tweets);
              for (const item of normalized.slice(0, 5)) {
                if (allItems.length >= maxItems) break;
                const classification = await classifyFeedback(item);
                allItems.push({ item, classification });
              }
            }
          }
        } catch (error) {
          console.error(`Twitter search error for ${query}:`, error);
        }

        if (allItems.length >= maxItems) break;
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({
        success: true,
        rawItems: [],
        clusters: [],
        stats: {
          totalFound: 0,
          totalClusters: 0,
          byCategory: {},
          byPriority: {},
          bySentiment: {},
          bySource: {},
        },
        insights: {
          topIssues: [],
          urgentItems: 0,
          sentimentScore: 0,
          recommendations: ['No feedback found. Try different search terms or check back later.'],
        },
      });
    }

    // === STEP 2: CLUSTER FEEDBACK ===

    const apiKey = process.env.OPENAI_API_KEY;
    const clusters = await clusterFeedbackWithAI(allItems, apiKey);

    // === STEP 3: CALCULATE STATS ===

    const stats = {
      totalFound: allItems.length,
      totalClusters: clusters.length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    allItems.forEach(({ item, classification }) => {
      stats.byCategory[classification.category] = (stats.byCategory[classification.category] || 0) + 1;
      stats.byPriority[classification.priority] = (stats.byPriority[classification.priority] || 0) + 1;
      stats.bySentiment[classification.sentiment] = (stats.bySentiment[classification.sentiment] || 0) + 1;
      stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;
    });

    // === STEP 4: GENERATE INSIGHTS ===

    const urgentItems = allItems.filter(i => i.classification.priority === 'urgent' || i.classification.priority === 'high').length;
    const negativeCount = stats.bySentiment['negative'] || 0;
    const positiveCount = stats.bySentiment['positive'] || 0;
    const sentimentScore = allItems.length > 0
      ? Math.round(((positiveCount - negativeCount) / allItems.length + 1) * 50)
      : 50;

    const topIssues = clusters
      .filter(c => c.priority === 'urgent' || c.priority === 'high')
      .slice(0, 3)
      .map(c => c.theme);

    const recommendations: string[] = [];

    if (urgentItems > 0) {
      recommendations.push(`Address ${urgentItems} urgent/high priority items immediately`);
    }

    if (stats.byCategory['bug'] > 0) {
      recommendations.push(`${stats.byCategory['bug']} bug reports need triage`);
    }

    if (stats.byCategory['feature_request'] > 2) {
      recommendations.push(`${stats.byCategory['feature_request']} feature requests - consider adding to roadmap discussion`);
    }

    if (sentimentScore < 40) {
      recommendations.push('Overall sentiment is negative - prioritize addressing customer concerns');
    }

    if (recommendations.length === 0) {
      recommendations.push('Feedback looks manageable. Review clusters and create tickets as needed.');
    }

    const response: MagicPipelineResponse = {
      success: true,
      rawItems: allItems,
      clusters,
      stats,
      insights: {
        topIssues,
        urgentItems,
        sentimentScore,
        recommendations,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Magic pipeline error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Pipeline failed' },
      { status: 500 }
    );
  }
}
