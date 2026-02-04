// Smart Clustering - Groups similar feedback into single tickets
// Uses semantic similarity to avoid 1 feedback = 1 ticket

import type { FeedbackItem, ClassificationResult } from '@/types/pipeline';

export interface ClusteredFeedback {
  id: string;
  theme: string;
  summary: string;
  items: Array<{
    item: FeedbackItem;
    classification: ClassificationResult;
  }>;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  mentionCount: number;
  sources: string[];
  suggestedTicket: {
    title: string;
    description: string;
    labels: string[];
  };
}

// Cluster feedback by similarity using keywords and categories
export function clusterFeedback(
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>
): ClusteredFeedback[] {
  if (items.length === 0) return [];

  // Group by category first
  const byCategory = new Map<string, typeof items>();

  items.forEach(({ item, classification }) => {
    const category = classification.category;
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push({ item, classification });
  });

  const clusters: ClusteredFeedback[] = [];

  // For each category, further cluster by keywords/themes
  byCategory.forEach((categoryItems, category) => {
    const themeClusters = clusterByTheme(categoryItems);

    themeClusters.forEach((themeItems, theme) => {
      const cluster = createCluster(theme, themeItems, category);
      clusters.push(cluster);
    });
  });

  // Sort by priority and mention count
  return clusters.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.mentionCount - a.mentionCount;
  });
}

// Cluster items within a category by theme/keywords
function clusterByTheme(
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>
): Map<string, typeof items> {
  const themes = new Map<string, typeof items>();
  const assigned = new Set<string>();

  // Extract keywords from all items
  const itemKeywords = items.map(({ item, classification }) => ({
    id: item.id,
    keywords: extractKeywords(item.content + ' ' + (item.title || '')),
    classification,
    item,
  }));

  // Group by common keywords
  itemKeywords.forEach((current) => {
    if (assigned.has(current.id)) return;

    // Find similar items
    const similar = itemKeywords.filter((other) => {
      if (assigned.has(other.id) || other.id === current.id) return false;
      const commonKeywords = current.keywords.filter(k => other.keywords.includes(k));
      return commonKeywords.length >= 2; // At least 2 common keywords
    });

    // Create theme from common keywords
    const allKeywords = [...current.keywords];
    similar.forEach(s => {
      s.keywords.forEach(k => {
        if (!allKeywords.includes(k)) allKeywords.push(k);
      });
    });

    const theme = allKeywords.slice(0, 3).join(' + ') || 'General';

    if (!themes.has(theme)) {
      themes.set(theme, []);
    }

    themes.get(theme)!.push({ item: current.item, classification: current.classification });
    assigned.add(current.id);

    similar.forEach(s => {
      themes.get(theme)!.push({ item: s.item, classification: s.classification });
      assigned.add(s.id);
    });
  });

  // Handle unclustered items
  itemKeywords.forEach((current) => {
    if (!assigned.has(current.id)) {
      const theme = current.keywords[0] || 'Other';
      if (!themes.has(theme)) {
        themes.set(theme, []);
      }
      themes.get(theme)!.push({ item: current.item, classification: current.classification });
    }
  });

  return themes;
}

// Create a cluster from grouped items
function createCluster(
  theme: string,
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>,
  category: string
): ClusteredFeedback {
  // Determine overall priority (highest wins)
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  const priority = items.reduce((max, { classification }) => {
    return priorityOrder[classification.priority] > priorityOrder[max]
      ? classification.priority
      : max;
  }, 'low' as 'urgent' | 'high' | 'medium' | 'low');

  // Determine overall sentiment (majority wins)
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  items.forEach(({ classification }) => {
    sentimentCounts[classification.sentiment]++;
  });
  const sentiment = Object.entries(sentimentCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as 'positive' | 'negative' | 'neutral';

  // Collect unique sources
  const sources = [...new Set(items.map(({ item }) => item.source))];

  // Generate summary
  const summary = items.length === 1
    ? items[0].item.content.slice(0, 200)
    : `${items.length} users mentioned issues related to ${theme}. Common concerns include: ${items.slice(0, 3).map(i => i.item.content.slice(0, 50)).join('; ')}...`;

  // Generate suggested ticket
  const suggestedTicket = generateTicketFromCluster(theme, items, category, priority);

  return {
    id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    theme,
    summary,
    items,
    category,
    priority,
    sentiment,
    mentionCount: items.length,
    sources,
    suggestedTicket,
  };
}

// Generate a ticket from a cluster
function generateTicketFromCluster(
  theme: string,
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>,
  category: string,
  priority: string
): ClusteredFeedback['suggestedTicket'] {
  const categoryPrefix: Record<string, string> = {
    bug: 'Fix',
    feature_request: 'Add',
    complaint: 'Address',
    question: 'Document',
    praise: 'Note',
    other: 'Review',
  };

  const prefix = categoryPrefix[category] || 'Review';
  const title = `${prefix}: ${capitalize(theme)} (${items.length} mentions)`;

  const description = `## Summary
${items.length} customer${items.length > 1 ? 's' : ''} reported issues related to **${theme}**.

## Customer Quotes
${items.slice(0, 5).map((i, idx) => `${idx + 1}. "${i.item.content.slice(0, 150)}${i.item.content.length > 150 ? '...' : ''}" - ${i.item.source}`).join('\n')}
${items.length > 5 ? `\n... and ${items.length - 5} more` : ''}

## Sources
${[...new Set(items.map(i => i.item.source))].join(', ')}

## Analysis
- **Category:** ${category}
- **Priority:** ${priority}
- **Sentiment:** ${items.filter(i => i.classification.sentiment === 'negative').length > items.length / 2 ? 'Mostly negative' : 'Mixed'}
- **Total mentions:** ${items.length}

---
_Auto-generated by Lark AI - Clustered from ${items.length} feedback items_`;

  const labels = [
    category.replace('_', '-'),
    priority,
    `mentions-${items.length}`,
  ];

  return { title, description, labels };
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'they',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when',
    'where', 'why', 'how', 'all', 'each', 'some', 'any', 'no', 'not',
    'and', 'but', 'or', 'if', 'so', 'just', 'very', 'really', 'get',
    'would', 'like', 'want', 'think', 'know', 'see', 'use', 'try',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10);
}

function capitalize(str: string): string {
  return str.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// AI-powered clustering (uses OpenAI when available)
export async function clusterFeedbackWithAI(
  items: Array<{ item: FeedbackItem; classification: ClassificationResult }>,
  apiKey?: string
): Promise<ClusteredFeedback[]> {
  // If no API key or few items, use basic clustering
  if (!apiKey || items.length < 5) {
    return clusterFeedback(items);
  }

  try {
    // Use AI to identify themes
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a PM assistant that groups customer feedback into themes.
Given a list of feedback items, identify 3-7 main themes and assign each item to a theme.
Return JSON: { "themes": [{ "name": "theme name", "itemIds": ["id1", "id2"] }] }`
          },
          {
            role: 'user',
            content: JSON.stringify(items.map(i => ({
              id: i.item.id,
              content: i.item.content.slice(0, 200),
              category: i.classification.category,
            })))
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return clusterFeedback(items);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Build clusters from AI themes
    const clusters: ClusteredFeedback[] = [];
    const itemMap = new Map(items.map(i => [i.item.id, i]));

    result.themes.forEach((theme: { name: string; itemIds: string[] }) => {
      const themeItems = theme.itemIds
        .map(id => itemMap.get(id))
        .filter(Boolean) as typeof items;

      if (themeItems.length > 0) {
        const category = themeItems[0].classification.category;
        clusters.push(createCluster(theme.name, themeItems, category));
      }
    });

    return clusters.length > 0 ? clusters : clusterFeedback(items);
  } catch (error) {
    console.error('AI clustering error:', error);
    return clusterFeedback(items);
  }
}
