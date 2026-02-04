// AI-powered feedback analyzer
// Classifies, scores, and clusters feedback items

import { ParsedFeedback } from '../parsers';

export type FeedbackCategory = 'bug' | 'feature_request' | 'complaint' | 'praise' | 'question' | 'other';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface AnalyzedFeedback extends ParsedFeedback {
  category: FeedbackCategory;
  sentiment: Sentiment;
  priority: Priority;
  priorityScore: number; // 0-100
  summary: string;
  suggestedTitle: string;
  tags: string[];
  productArea?: string;
  revenueImpact?: 'high' | 'medium' | 'low';
  userSegment?: string;
}

export interface AnalysisResult {
  items: AnalyzedFeedback[];
  summary: {
    total: number;
    byCategory: Record<FeedbackCategory, number>;
    bySentiment: Record<Sentiment, number>;
    byPriority: Record<Priority, number>;
    topTags: { tag: string; count: number }[];
    topProductAreas: { area: string; count: number }[];
  };
  recommendations: string[];
}

// System prompt for AI analysis
const ANALYSIS_SYSTEM_PROMPT = `You are a senior product manager analyzing customer feedback.

For each piece of feedback, you must determine:

1. CATEGORY (exactly one):
   - bug: Technical issues, errors, things not working
   - feature_request: Wants new functionality or improvements
   - complaint: Unhappy about experience, pricing, support
   - praise: Positive feedback, compliments
   - question: Asking how to do something
   - other: Doesn't fit above categories

2. SENTIMENT:
   - positive: Happy, satisfied, excited
   - neutral: Factual, neither happy nor unhappy
   - negative: Frustrated, angry, disappointed

3. PRIORITY (based on business impact):
   - urgent: Blocking users, data loss, security issue, many affected
   - high: Significant pain point, affects revenue, enterprise blocker
   - medium: Notable issue but workarounds exist
   - low: Nice to have, minor inconvenience

4. PRIORITY SCORE: 0-100 based on:
   - Frequency (how many users mention similar)
   - Revenue impact (enterprise vs free users)
   - Severity (blocking vs inconvenience)
   - Effort to fix (quick win vs major project)

5. SUMMARY: 1 sentence capturing the core issue/request

6. SUGGESTED TITLE: Short ticket title (max 60 chars)

7. TAGS: 1-3 relevant tags (e.g., "onboarding", "mobile", "pricing", "API")

8. PRODUCT AREA: Which part of product (e.g., "Dashboard", "API", "Mobile App", "Billing")

Respond in JSON format for each item.`;

// Analyze a batch of feedback items using AI
export async function analyzeFeedbackBatch(
  items: ParsedFeedback[],
  options: {
    apiKey: string;
    productContext?: string;
    batchSize?: number;
  }
): Promise<AnalysisResult> {
  const { apiKey, productContext, batchSize = 10 } = options;
  const analyzedItems: AnalyzedFeedback[] = [];

  // Process in batches to avoid token limits
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await analyzeBatch(batch, apiKey, productContext);
    analyzedItems.push(...batchResults);
  }

  // Generate summary
  const summary = generateSummary(analyzedItems);
  const recommendations = generateRecommendations(analyzedItems, summary);

  return {
    items: analyzedItems,
    summary,
    recommendations,
  };
}

async function analyzeBatch(
  items: ParsedFeedback[],
  apiKey: string,
  productContext?: string
): Promise<AnalyzedFeedback[]> {
  const feedbackList = items.map((item, i) => `[${i}] ${item.content}`).join('\n\n');

  const userPrompt = `${productContext ? `Product Context: ${productContext}\n\n` : ''}Analyze these ${items.length} feedback items:

${feedbackList}

Return a JSON array with analysis for each item (use the index [0], [1], etc. to match):
[
  {
    "index": 0,
    "category": "bug|feature_request|complaint|praise|question|other",
    "sentiment": "positive|neutral|negative",
    "priority": "urgent|high|medium|low",
    "priorityScore": 0-100,
    "summary": "One sentence summary",
    "suggestedTitle": "Short ticket title",
    "tags": ["tag1", "tag2"],
    "productArea": "Area of product"
  },
  ...
]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    const analyses = Array.isArray(parsed) ? parsed : parsed.items || parsed.analysis || [];

    return items.map((item, i) => {
      const analysis = analyses.find((a: { index: number }) => a.index === i) || analyses[i] || {};

      return {
        ...item,
        category: analysis.category || 'other',
        sentiment: analysis.sentiment || 'neutral',
        priority: analysis.priority || 'medium',
        priorityScore: analysis.priorityScore || 50,
        summary: analysis.summary || item.content.slice(0, 100),
        suggestedTitle: analysis.suggestedTitle || item.content.slice(0, 60),
        tags: analysis.tags || [],
        productArea: analysis.productArea,
      };
    });
  } catch (error) {
    console.error('Analysis error:', error);
    // Return items with default analysis on error
    return items.map(item => ({
      ...item,
      category: 'other' as FeedbackCategory,
      sentiment: 'neutral' as Sentiment,
      priority: 'medium' as Priority,
      priorityScore: 50,
      summary: item.content.slice(0, 100),
      suggestedTitle: item.content.slice(0, 60),
      tags: [],
    }));
  }
}

function generateSummary(items: AnalyzedFeedback[]): AnalysisResult['summary'] {
  const byCategory: Record<FeedbackCategory, number> = {
    bug: 0, feature_request: 0, complaint: 0, praise: 0, question: 0, other: 0
  };
  const bySentiment: Record<Sentiment, number> = {
    positive: 0, neutral: 0, negative: 0
  };
  const byPriority: Record<Priority, number> = {
    urgent: 0, high: 0, medium: 0, low: 0
  };
  const tagCounts: Record<string, number> = {};
  const areaCounts: Record<string, number> = {};

  items.forEach(item => {
    byCategory[item.category]++;
    bySentiment[item.sentiment]++;
    byPriority[item.priority]++;

    item.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    if (item.productArea) {
      areaCounts[item.productArea] = (areaCounts[item.productArea] || 0) + 1;
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  const topProductAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area, count]) => ({ area, count }));

  return {
    total: items.length,
    byCategory,
    bySentiment,
    byPriority,
    topTags,
    topProductAreas,
  };
}

function generateRecommendations(
  items: AnalyzedFeedback[],
  summary: AnalysisResult['summary']
): string[] {
  const recommendations: string[] = [];

  // Urgent items recommendation
  if (summary.byPriority.urgent > 0) {
    recommendations.push(
      `🚨 ${summary.byPriority.urgent} urgent issue(s) need immediate attention`
    );
  }

  // Bug ratio
  const bugRatio = summary.byCategory.bug / summary.total;
  if (bugRatio > 0.3) {
    recommendations.push(
      `⚠️ High bug ratio (${Math.round(bugRatio * 100)}%) - consider a stability sprint`
    );
  }

  // Negative sentiment
  const negativeRatio = summary.bySentiment.negative / summary.total;
  if (negativeRatio > 0.4) {
    recommendations.push(
      `📉 ${Math.round(negativeRatio * 100)}% negative sentiment - review top complaints`
    );
  }

  // Feature requests
  if (summary.byCategory.feature_request > 3) {
    const topFeatureTags = items
      .filter(i => i.category === 'feature_request')
      .flatMap(i => i.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topTag = Object.entries(topFeatureTags).sort((a, b) => b[1] - a[1])[0];
    if (topTag) {
      recommendations.push(
        `💡 Top feature request area: "${topTag[0]}" (${topTag[1]} mentions)`
      );
    }
  }

  // Product area focus
  if (summary.topProductAreas.length > 0) {
    const topArea = summary.topProductAreas[0];
    if (topArea.count >= 3) {
      recommendations.push(
        `🎯 Focus area: "${topArea.area}" has the most feedback (${topArea.count} items)`
      );
    }
  }

  return recommendations;
}

// Quick single-item analysis (for real-time processing)
export async function analyzeOneFeedback(
  content: string,
  apiKey: string
): Promise<Omit<AnalyzedFeedback, keyof ParsedFeedback>> {
  const result = await analyzeBatch(
    [{ id: 'single', content, source: 'realtime' }],
    apiKey
  );

  const { id, content: _, source, ...analysis } = result[0];
  return analysis;
}
