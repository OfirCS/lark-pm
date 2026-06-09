import { chatWithKimiSync } from '@/lib/kimi';
import type { KimiMessage } from '@/lib/kimi';

export const runtime = 'edge';
export const maxDuration = 60;

type Audience = 'engineering' | 'leadership' | 'sales';

interface DigestRequest {
  audience: Audience;
  productName: string;
  productContext?: string;
  data: {
    total: number;
    pending: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    bySource: Record<string, number>;
    items: Array<{
      title: string;
      content: string;
      source: string;
      category: string;
      priority: string;
      sentiment: string;
    }>;
  };
}

const AUDIENCE_PROMPTS: Record<Audience, string> = {
  engineering: `You are generating an Engineering Team Digest. Focus on:
- Bugs first, with reproduction steps if available
- Technical details and acceptance criteria
- API/infrastructure issues
- Performance concerns
- Group by technical area (frontend, backend, API, infra)
Format: Use markdown with ## headers. Start each item with priority emoji (🔴 urgent, 🟠 high, 🔵 medium, ⚪ low).
Tone: Technical, concise, actionable. Like a JIRA sprint summary.`,

  leadership: `You are generating a Leadership/Executive Digest. Focus on:
- Revenue impact and business metrics
- Strategic alignment with company goals
- Customer churn risk indicators
- Competitive positioning insights
- High-level trends, not individual bugs
Format: Use markdown with ## headers. Lead with key numbers. Include a TL;DR at the top.
Tone: Strategic, data-driven, brief. Like a board update memo.`,

  sales: `You are generating a Sales/CS Team Digest. Focus on:
- Customer quotes and verbatim feedback
- Churn risk signals and "switching from" mentions
- Feature requests that could close deals
- Competitive mentions and positioning
- Positive feedback for case studies
Format: Use markdown with ## headers. Include direct quotes in blockquotes.
Tone: Customer-centric, actionable, empathetic. Like a customer success report.`,
};

export async function POST(req: Request) {
  try {
    const { audience, productName, productContext, data } = (await req.json()) as DigestRequest;

    if (!audience || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing audience or data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = AUDIENCE_PROMPTS[audience];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: 'Invalid audience type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build data context
    const context = buildDataContext(productName, data, productContext);

    const messages: KimiMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate a stakeholder digest for ${productName || 'our product'} based on this collected feedback data:\n\n${context}\n\nGenerate a well-structured digest. Be specific and reference actual data points.`,
      },
    ];

    try {
      const content = await chatWithKimiSync(messages, {
        model: 'gpt-4o-mini',
        temperature: 0.5,
        maxTokens: 2048,
      });

      return new Response(
        JSON.stringify({ content, audience }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (aiError) {
      // Fallback with demo content
      const demo = generateDemoDigest(audience, productName, data);
      return new Response(
        JSON.stringify({ content: demo, audience, demo: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Digest API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate digest' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildDataContext(productName: string, data: DigestRequest['data'], productContext?: string): string {
  const parts: string[] = [];

  if (productContext) {
    parts.push(productContext);
  } else {
    parts.push(`Product: ${productName || 'Unknown'}`);
  }
  parts.push(`Total feedback items: ${data.total}`);
  parts.push(`Pending review: ${data.pending}`);
  parts.push(`By Category: ${Object.entries(data.byCategory).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  parts.push(`By Priority: ${Object.entries(data.byPriority).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  parts.push(`By Source: ${Object.entries(data.bySource).map(([k, v]) => `${k}: ${v}`).join(', ')}`);

  parts.push('\nFeedback Items:');
  data.items.slice(0, 20).forEach((item, i) => {
    parts.push(`${i + 1}. [${item.category}] [${item.priority}] "${item.title}" (${item.source}, ${item.sentiment})`);
    parts.push(`   Content: ${item.content.slice(0, 200)}`);
  });

  return parts.join('\n');
}

function generateDemoDigest(audience: Audience, productName: string, data: DigestRequest['data']): string {
  const name = productName || 'the product';
  const totalBugs = data.byCategory.bug || 0;
  const totalFeatures = data.byCategory.feature_request || 0;
  const urgentCount = data.byPriority.urgent || 0;

  if (audience === 'engineering') {
    return `## Engineering Digest - ${name}

**${data.total} items collected** | ${totalBugs} bugs | ${totalFeatures} feature requests | ${urgentCount} urgent

### 🔴 Urgent Items
${urgentCount > 0 ? `${urgentCount} items require immediate attention. Check the Review Queue for details.` : 'No urgent items at this time.'}

### Bug Summary
${totalBugs > 0 ? `${totalBugs} bug reports across ${Object.keys(data.bySource).length} sources. Review and triage in the Review Queue.` : 'No bugs reported in current collection.'}

### Feature Requests
${totalFeatures > 0 ? `${totalFeatures} feature requests collected. Top themes need clustering analysis.` : 'No feature requests in current collection.'}

### Sources
${Object.entries(data.bySource).map(([k, v]) => `- ${k}: ${v} items`).join('\n')}`;
  }

  if (audience === 'leadership') {
    return `## Executive Summary - ${name}

**TL;DR:** ${data.total} feedback items collected from ${Object.keys(data.bySource).length} channels. ${urgentCount > 0 ? `${urgentCount} urgent items need escalation.` : 'No critical escalations.'}

### Key Metrics
- **Total Feedback:** ${data.total} items
- **Bug Reports:** ${totalBugs}
- **Feature Requests:** ${totalFeatures}
- **Urgent Items:** ${urgentCount}

### Channel Distribution
${Object.entries(data.bySource).map(([k, v]) => `- ${k}: ${v} items (${Math.round(v / data.total * 100)}%)`).join('\n')}

### Recommended Actions
1. Review ${data.pending} pending items in the queue
2. ${urgentCount > 0 ? 'Address urgent escalations immediately' : 'Continue monitoring feedback channels'}
3. Schedule roadmap review based on feature request patterns`;
  }

  return `## Customer Voice Report - ${name}

### What Customers Are Saying
${data.total} feedback items collected from ${Object.keys(data.bySource).length} sources.

### Sentiment Breakdown
- **${totalFeatures} feature requests** - Customers want ${name} to do more
- **${totalBugs} bug reports** - Issues impacting customer experience
- **${data.byCategory.praise || 0} positive mentions** - What customers love

### Churn Risk Indicators
${urgentCount > 0 ? `⚠️ ${urgentCount} urgent items could indicate churn risk. Review immediately.` : 'No immediate churn risk indicators detected.'}

### Customer Quotes
Review the feedback items in the Intelligence Hub for verbatim customer quotes.

### Competitive Mentions
Scan feedback for competitor mentions in the Competitors tab.`;
}
