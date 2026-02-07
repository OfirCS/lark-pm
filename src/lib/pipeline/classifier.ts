// AI Classification Brain
// Categorizes feedback items and assigns priority

import type {
  FeedbackItem,
  ClassificationResult,
  FeedbackCategory,
  Priority,
  Sentiment,
  CustomerSegment,
} from '@/types/pipeline';

const CLASSIFICATION_PROMPT = `You are a PM assistant classifying customer feedback.

Analyze this feedback and return a JSON object with:
{
  "category": "bug" | "feature_request" | "praise" | "question" | "complaint" | "other",
  "confidence": 0-100,
  "priority": "low" | "medium" | "high" | "urgent",
  "priorityReasons": ["reason1", "reason2"],
  "sentiment": "positive" | "negative" | "neutral",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "customerSegment": "enterprise" | "mid-market" | "smb" | "unknown"
}

Priority rules:
- URGENT: Revenue blocker, security issue, data loss, system down
- HIGH: Enterprise customer, multiple people affected, competitor comparison
- MEDIUM: Clear feature request, reasonable engagement, specific use case
- LOW: General question, praise, minor suggestion

Category rules:
- bug: Something broken, error, crash, not working as expected
- feature_request: Wants new capability, integration, improvement
- praise: Positive feedback, recommendation, compliment
- question: Asking how to do something, unclear about feature
- complaint: Negative about existing feature, pricing, support quality
- other: Doesn't fit above categories

Customer segment detection:
- enterprise: Mentions team size >100, compliance, SSO, enterprise features
- mid-market: Mentions team of 20-100, growing company
- smb: Individual or small team, price sensitive
- unknown: Can't determine

Return ONLY the JSON object, no explanation.`;

/**
 * Classify a single feedback item using AI
 */
export async function classifyFeedback(
  item: FeedbackItem,
  companyContext?: string
): Promise<ClassificationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return default classification if no API key
    return getDefaultClassification(item);
  }

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
          { role: 'system', content: companyContext
            ? `You are classifying feedback for:\n${companyContext}\n\nPrioritize items relevant to this product's market and current focus.\n\n${CLASSIFICATION_PROMPT}`
            : CLASSIFICATION_PROMPT },
          {
            role: 'user',
            content: `Source: ${item.source}
${item.metadata.subreddit ? `Subreddit: r/${item.metadata.subreddit}` : ''}
Author: ${item.authorHandle || item.author}
Engagement Score: ${item.engagementScore}/100

${item.title ? `Title: ${item.title}\n` : ''}Content: ${item.content}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('Classification API error:', response.status);
      return getDefaultClassification(item);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return getDefaultClassification(item);
    }

    // Parse JSON response
    const result = JSON.parse(content);

    return {
      category: result.category || 'other',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      priority: result.priority || 'medium',
      priorityReasons: result.priorityReasons || [],
      sentiment: result.sentiment || 'neutral',
      keywords: result.keywords || [],
      customerSegment: result.customerSegment || 'unknown',
    };
  } catch (error) {
    console.error('Classification error:', error);
    return getDefaultClassification(item);
  }
}

/**
 * Batch classify multiple feedback items
 */
export async function classifyFeedbackBatch(
  items: FeedbackItem[],
  companyContext?: string
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();

  // Process in parallel with concurrency limit
  const BATCH_SIZE = 5;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const classification = await classifyFeedback(item, companyContext);
        return { id: item.id, classification };
      })
    );

    batchResults.forEach(({ id, classification }) => {
      results.set(id, classification);
    });
  }

  return results;
}

/**
 * Get default classification based on heuristics (when AI is unavailable)
 */
function getDefaultClassification(item: FeedbackItem): ClassificationResult {
  const content = (item.content + (item.title || '')).toLowerCase();

  // Category detection
  let category: FeedbackCategory = 'other';
  if (
    content.includes('bug') ||
    content.includes('broken') ||
    content.includes('error') ||
    content.includes('crash') ||
    content.includes('not working')
  ) {
    category = 'bug';
  } else if (
    content.includes('feature') ||
    content.includes('would be great') ||
    content.includes('please add') ||
    content.includes('wish') ||
    content.includes('need')
  ) {
    category = 'feature_request';
  } else if (
    content.includes('love') ||
    content.includes('amazing') ||
    content.includes('great') ||
    content.includes('awesome')
  ) {
    category = 'praise';
  } else if (
    content.includes('how do') ||
    content.includes('how to') ||
    content.includes('?')
  ) {
    category = 'question';
  } else if (
    content.includes('terrible') ||
    content.includes('worst') ||
    content.includes('hate') ||
    content.includes('disappointed')
  ) {
    category = 'complaint';
  }

  // Sentiment detection
  let sentiment: Sentiment = 'neutral';
  const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excellent', 'best'];
  const negativeWords = ['hate', 'terrible', 'worst', 'broken', 'frustrated', 'disappointed'];

  if (positiveWords.some((word) => content.includes(word))) {
    sentiment = 'positive';
  } else if (negativeWords.some((word) => content.includes(word))) {
    sentiment = 'negative';
  }

  // Priority detection
  let priority: Priority = 'medium';
  const priorityReasons: string[] = [];

  if (
    content.includes('enterprise') ||
    content.includes('team of') ||
    content.includes('company')
  ) {
    priority = 'high';
    priorityReasons.push('Enterprise mention');
  }

  if (content.includes('blocking') || content.includes('blocker')) {
    priority = 'urgent';
    priorityReasons.push('Blocker mentioned');
  }

  if (item.engagementScore > 70) {
    if (priority === 'medium') priority = 'high';
    priorityReasons.push('High engagement');
  }

  // Customer segment detection
  let customerSegment: CustomerSegment = 'unknown';
  if (
    content.includes('enterprise') ||
    content.includes('sso') ||
    content.includes('500') ||
    content.includes('1000')
  ) {
    customerSegment = 'enterprise';
  } else if (content.includes('team') || content.includes('company')) {
    customerSegment = 'mid-market';
  } else if (content.includes('personal') || content.includes('solo')) {
    customerSegment = 'smb';
  }

  // Extract keywords (simple approach)
  const keywords = extractKeywords(content);

  return {
    category,
    confidence: 60, // Lower confidence for heuristic classification
    priority,
    priorityReasons,
    sentiment,
    keywords,
    customerSegment,
  };
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i',
    'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'they', 'them',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const freq = new Map<string, number>();
  words.forEach((word) => {
    freq.set(word, (freq.get(word) || 0) + 1);
  });

  // Return top 5 by frequency
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
