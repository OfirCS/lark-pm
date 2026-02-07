// AI Ticket Drafter
// Generates ticket title and description from classified feedback

import type {
  FeedbackItem,
  ClassificationResult,
  DraftedTicket,
  Priority,
} from '@/types/pipeline';
import { SOURCE_CONFIG } from '@/types/pipeline';

const DRAFTING_PROMPT = `You are a PM assistant drafting tickets from customer feedback.

Create a ticket with:
1. Title: Clear, actionable, max 80 chars (e.g., "Add SSO/SAML authentication")
2. Description: Structured markdown with:
   - ## Context (1-2 sentences about the feedback source)
   - ## User Quote (direct quote from feedback)
   - ## Impact (who is affected, business impact)
   - ## Recommendation (suggested action)
   - ## Source (link to original)

Keep it concise. No fluff. Focus on actionable information.

Return JSON:
{
  "title": "Clear ticket title",
  "description": "Markdown description",
  "suggestedLabels": ["label1", "label2"],
  "suggestedPriority": "low" | "medium" | "high" | "urgent"
}

Return ONLY the JSON, no explanation.`;

/**
 * Draft a ticket from classified feedback
 */
export async function draftTicket(
  item: FeedbackItem,
  classification: ClassificationResult,
  companyContext?: string
): Promise<{
  title: string;
  description: string;
  suggestedLabels: string[];
  suggestedPriority: Priority;
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return default draft if no API key
    return getDefaultDraft(item, classification);
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
            ? `You are drafting tickets for:\n${companyContext}\n\nFrame business impact and recommendations for this specific product.\n\n${DRAFTING_PROMPT}`
            : DRAFTING_PROMPT },
          {
            role: 'user',
            content: `Feedback to draft ticket from:

Source: ${SOURCE_CONFIG[item.source]?.label || item.source}
${item.metadata.subreddit ? `Subreddit: r/${item.metadata.subreddit}` : ''}
Author: ${item.authorHandle || item.author}
URL: ${item.sourceUrl}

Classification:
- Category: ${classification.category}
- Priority: ${classification.priority}
- Sentiment: ${classification.sentiment}
- Customer Segment: ${classification.customerSegment}
- Keywords: ${classification.keywords.join(', ')}

${item.title ? `Title: ${item.title}\n` : ''}Content:
"${item.content}"`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('Drafting API error:', response.status);
      return getDefaultDraft(item, classification);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return getDefaultDraft(item, classification);
    }

    // Parse JSON response
    const result = JSON.parse(content);

    return {
      title: result.title || getDefaultTitle(item, classification),
      description: result.description || getDefaultDescription(item, classification),
      suggestedLabels: result.suggestedLabels || getDefaultLabels(classification),
      suggestedPriority: result.suggestedPriority || classification.priority,
    };
  } catch (error) {
    console.error('Drafting error:', error);
    return getDefaultDraft(item, classification);
  }
}

/**
 * Batch draft tickets
 */
export async function draftTicketBatch(
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>,
  companyContext?: string
): Promise<
  Map<
    string,
    {
      title: string;
      description: string;
      suggestedLabels: string[];
      suggestedPriority: Priority;
    }
  >
> {
  const results = new Map();

  // Process in parallel with concurrency limit
  const BATCH_SIZE = 3;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async ({ item, classification }) => {
        const draft = await draftTicket(item, classification, companyContext);
        return { id: item.id, draft };
      })
    );

    batchResults.forEach(({ id, draft }) => {
      results.set(id, draft);
    });
  }

  return results;
}

/**
 * Get default draft when AI is unavailable
 */
function getDefaultDraft(
  item: FeedbackItem,
  classification: ClassificationResult
): {
  title: string;
  description: string;
  suggestedLabels: string[];
  suggestedPriority: Priority;
} {
  return {
    title: getDefaultTitle(item, classification),
    description: getDefaultDescription(item, classification),
    suggestedLabels: getDefaultLabels(classification),
    suggestedPriority: classification.priority,
  };
}

/**
 * Generate default title
 */
function getDefaultTitle(
  item: FeedbackItem,
  classification: ClassificationResult
): string {
  const categoryPrefix: Record<string, string> = {
    bug: 'Fix:',
    feature_request: 'Add:',
    complaint: 'Address:',
    question: 'Document:',
    praise: 'Note:',
    other: 'Review:',
  };

  const prefix = categoryPrefix[classification.category] || 'Review:';

  // Use item title if available, otherwise extract from content
  if (item.title) {
    return `${prefix} ${truncate(item.title, 70)}`;
  }

  // Extract first meaningful sentence
  const firstSentence = item.content.split(/[.!?]/)[0].trim();
  return `${prefix} ${truncate(firstSentence, 70)}`;
}

/**
 * Generate default description
 */
function getDefaultDescription(
  item: FeedbackItem,
  classification: ClassificationResult
): string {
  const sourceLabel = SOURCE_CONFIG[item.source]?.label || item.source;
  const subreddit = item.metadata.subreddit ? ` r/${item.metadata.subreddit}` : '';

  return `## Context
Feedback received from ${sourceLabel}${subreddit} by ${item.authorHandle || item.author}.
Classified as **${formatCategory(classification.category)}** with **${classification.priority}** priority.

## User Quote
> "${truncate(item.content, 500)}"

## Classification Details
- **Category:** ${formatCategory(classification.category)}
- **Sentiment:** ${classification.sentiment}
- **Confidence:** ${classification.confidence}%
- **Customer Segment:** ${classification.customerSegment}
${classification.priorityReasons.length > 0 ? `- **Priority Reasons:** ${classification.priorityReasons.join(', ')}` : ''}

## Keywords
${classification.keywords.map((k) => `\`${k}\``).join(' ')}

## Source
[View original](${item.sourceUrl})`;
}

/**
 * Generate default labels
 */
function getDefaultLabels(classification: ClassificationResult): string[] {
  const labels: string[] = [];

  // Add category label
  labels.push(classification.category.replace('_', '-'));

  // Add priority label if high/urgent
  if (classification.priority === 'urgent' || classification.priority === 'high') {
    labels.push(classification.priority);
  }

  // Add customer segment if enterprise
  if (classification.customerSegment === 'enterprise') {
    labels.push('enterprise');
  }

  // Add some keywords as labels
  const keywordLabels = classification.keywords
    .slice(0, 2)
    .filter((k) => k.length <= 20);
  labels.push(...keywordLabels);

  return labels;
}

// Helper functions
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a complete DraftedTicket from feedback and classification
 */
export function createDraftedTicket(
  feedbackItem: FeedbackItem,
  classification: ClassificationResult,
  draft: {
    title: string;
    description: string;
    suggestedLabels: string[];
    suggestedPriority: Priority;
  }
): DraftedTicket {
  const now = new Date().toISOString();

  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    feedbackItem,
    classification,
    draft,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}
