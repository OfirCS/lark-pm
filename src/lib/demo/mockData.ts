// Rich, realistic demo data powering the static showcase build.
// Everything here is fictional sample content — no real customer data, no secrets.

import type {
  DraftedTicket,
  FeedbackItem,
  FeedbackCategory,
  Priority,
  Sentiment,
  CustomerSegment,
  ReviewStatus,
} from '@/types/pipeline';
import type { ClusteredFeedback } from '@/lib/pipeline/clusterer';
import type {
  SearchResult,
  SentimentData,
  ImpactAnalysis,
  StreamChunk,
} from '@/types/agent';

// ---------------------------------------------------------------------------
// Company / product context (served by GET /api/company)
// ---------------------------------------------------------------------------

export const demoCompany = {
  product_name: 'Lark',
  product_description:
    'AI customer-intelligence assistant that turns scattered feedback from Reddit, X, sales calls, and support tickets into prioritized, ready-to-ship tickets.',
  competitors: ['Productboard', 'Canny', 'Savio', 'Cycle'],
  search_terms: ['Lark', 'Lark feedback', 'Lark PM tool', 'feedback to tickets'],
  subreddits: ['ProductManagement', 'SaaS', 'startups'],
  twitter_keywords: ['Lark', '#productmanagement'],
  enabled_sources: ['reddit', 'twitter', 'linkedin', 'forum', 'support', 'call'],
  selected_integrations: ['linear', 'slack', 'github'],
  onboarding_completed: true,
};

// ---------------------------------------------------------------------------
// Seed drafted tickets (hydrated into the review store on first load)
// ---------------------------------------------------------------------------

let seq = 0;
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

interface DraftSpec {
  source: FeedbackItem['source'];
  author: string;
  handle?: string;
  subreddit?: string;
  url?: string;
  title?: string;
  content: string;
  engagement?: number;
  category: FeedbackCategory;
  priority: Priority;
  sentiment: Sentiment;
  segment?: CustomerSegment;
  keywords?: string[];
  reasons?: string[];
  draftTitle: string;
  draftDesc: string;
  labels: string[];
  status?: ReviewStatus;
  ageMin: number;
}

function makeDraft(s: DraftSpec): DraftedTicket {
  seq += 1;
  const created = minutesAgo(s.ageMin);
  return {
    id: `seed_${seq}`,
    feedbackItem: {
      id: `fb_seed_${seq}`,
      source: s.source,
      sourceId: `${s.source}_${seq}`,
      sourceUrl: s.url ?? `https://example.com/${s.source}/${seq}`,
      title: s.title,
      content: s.content,
      author: s.author,
      authorHandle: s.handle,
      createdAt: created,
      fetchedAt: created,
      engagementScore: s.engagement ?? 40,
      metadata: {
        subreddit: s.subreddit,
        likeCount: s.engagement,
      },
    },
    classification: {
      category: s.category,
      confidence: 86,
      priority: s.priority,
      priorityReasons: s.reasons ?? [],
      sentiment: s.sentiment,
      keywords: s.keywords ?? [],
      customerSegment: s.segment ?? 'unknown',
    },
    draft: {
      title: s.draftTitle,
      description: s.draftDesc,
      suggestedLabels: s.labels,
      suggestedPriority: s.priority,
    },
    status: s.status ?? 'pending',
    createdAt: created,
    updatedAt: created,
  };
}

const SEED_SPECS: DraftSpec[] = [
  {
    source: 'reddit',
    subreddit: 'ProductManagement',
    author: 'u/scaling_sam',
    handle: 'u/scaling_sam',
    url: 'https://reddit.com/r/ProductManagement/comments/demo1',
    title: 'No SSO is a dealbreaker for our security review',
    content:
      "We love the product but our security team blocked the rollout because there's no SAML/SSO. We're a 400-person company and this is now a hard requirement to renew. Productboard has it out of the box.",
    engagement: 92,
    category: 'feature_request',
    priority: 'urgent',
    sentiment: 'negative',
    segment: 'enterprise',
    keywords: ['sso', 'saml', 'security', 'enterprise'],
    reasons: ['Revenue blocker — renewal at risk', 'Enterprise account', 'Competitor parity gap'],
    draftTitle: 'Add SAML/SSO authentication for enterprise accounts',
    draftDesc:
      '## Context\nEnterprise prospect blocked during security review.\n\n## User Quote\n> "Our security team blocked the rollout because there\'s no SAML/SSO."\n\n## Impact\nRenewal at risk for a 400-seat account. Competitor (Productboard) ships this by default.\n\n## Recommendation\nPrioritize SAML 2.0 + SCIM provisioning for the enterprise tier.',
    labels: ['feature-request', 'urgent', 'enterprise', 'auth'],
    ageMin: 18,
  },
  {
    source: 'support',
    author: 'Maria Gonzalez',
    url: 'https://support.example.com/ticket/4821',
    title: 'CSV export silently drops rows over 10k',
    content:
      'When I export more than ~10,000 feedback items to CSV the file is truncated with no warning. We lost data in our QBR deck because of this. Please fix urgently.',
    engagement: 70,
    category: 'bug',
    priority: 'urgent',
    sentiment: 'negative',
    segment: 'mid-market',
    keywords: ['export', 'csv', 'data-loss', 'truncation'],
    reasons: ['Data loss', 'Affects reporting workflows'],
    draftTitle: 'Fix: CSV export silently truncates beyond 10k rows',
    draftDesc:
      '## Context\nLarge CSV exports are silently truncated.\n\n## User Quote\n> "The file is truncated with no warning. We lost data in our QBR deck."\n\n## Impact\nData loss in customer reporting. High churn signal.\n\n## Recommendation\nStream exports / paginate, and surface a row-count confirmation.',
    labels: ['bug', 'urgent', 'export'],
    ageMin: 47,
  },
  {
    source: 'twitter',
    author: 'Devon Price',
    handle: '@devonbuilds',
    url: 'https://x.com/devonbuilds/status/demo3',
    title: 'Mobile app please',
    content:
      'Honestly @LarkHQ is the best feedback tool I\'ve used this year. The one thing missing is a real mobile app — I want to triage tickets from my phone on the train. Canny has one already.',
    engagement: 64,
    category: 'feature_request',
    priority: 'high',
    sentiment: 'positive',
    segment: 'smb',
    keywords: ['mobile', 'app', 'triage'],
    reasons: ['Repeated request', 'Competitor parity (Canny)'],
    draftTitle: 'Add native mobile app for on-the-go triage',
    draftDesc:
      '## Context\nPositive power user requesting mobile triage.\n\n## User Quote\n> "I want to triage tickets from my phone on the train."\n\n## Impact\nFrequently requested; engagement driver. Competitor Canny ships a mobile app.\n\n## Recommendation\nScope a lightweight mobile triage experience (React Native).',
    labels: ['feature-request', 'high', 'mobile'],
    ageMin: 95,
  },
  {
    source: 'call',
    author: 'Acme Corp (Sales call)',
    url: 'https://calls.example.com/demo4',
    title: 'Slack digest would close the deal',
    content:
      'On the call the VP of Product said: "If you can push a weekly digest into our Slack automatically, we\'ll sign the annual contract." They want it segmented by engineering vs leadership.',
    engagement: 80,
    category: 'feature_request',
    priority: 'high',
    sentiment: 'neutral',
    segment: 'enterprise',
    keywords: ['slack', 'digest', 'automation'],
    reasons: ['Expansion revenue tied to feature'],
    draftTitle: 'Automated weekly Slack digest, segmented by audience',
    draftDesc:
      '## Context\nDeal-influencing request surfaced on a sales call.\n\n## User Quote\n> "If you can push a weekly digest into our Slack automatically, we\'ll sign the annual contract."\n\n## Impact\nDirectly tied to a new annual contract.\n\n## Recommendation\nShip scheduled Slack digests with audience templates (already prototyped in Digest).',
    labels: ['feature-request', 'high', 'integrations', 'slack'],
    ageMin: 140,
  },
  {
    source: 'reddit',
    subreddit: 'SaaS',
    author: 'u/pm_in_progress',
    handle: 'u/pm_in_progress',
    url: 'https://reddit.com/r/SaaS/comments/demo5',
    title: 'Clustering is genuinely impressive',
    content:
      'Switched from a spreadsheet to Lark and the automatic clustering of duplicate feedback saved me hours. It grouped 40 messages into 6 themes correctly. Really well done.',
    engagement: 55,
    category: 'praise',
    priority: 'low',
    sentiment: 'positive',
    segment: 'smb',
    keywords: ['clustering', 'duplicates', 'time-saving'],
    draftTitle: 'Note: Users love automatic feedback clustering',
    draftDesc:
      '## Context\nPositive sentiment about the clustering engine.\n\n## User Quote\n> "It grouped 40 messages into 6 themes correctly."\n\n## Impact\nKey differentiator and retention driver.\n\n## Recommendation\nFeature in marketing; consider exposing cluster confidence.',
    labels: ['praise', 'low', 'clustering'],
    status: 'approved',
    ageMin: 320,
  },
  {
    source: 'linkedin',
    author: 'Priya Nair',
    url: 'https://linkedin.com/posts/demo6',
    title: 'Comparing Lark vs Productboard for a 50-person startup',
    content:
      'Evaluating feedback tools. Lark is more affordable and the AI drafting is better, but Productboard wins on roadmap views and integrations. Wish Lark had a Jira two-way sync.',
    engagement: 48,
    category: 'feature_request',
    priority: 'medium',
    sentiment: 'neutral',
    segment: 'mid-market',
    keywords: ['jira', 'integration', 'roadmap', 'productboard'],
    reasons: ['Competitive comparison', 'Integration gap'],
    draftTitle: 'Add two-way Jira sync to close competitive gap',
    draftDesc:
      '## Context\nComparison post weighing Lark against Productboard.\n\n## User Quote\n> "Wish Lark had a Jira two-way sync."\n\n## Impact\nIntegration gap cited in competitive evaluations.\n\n## Recommendation\nPrioritize bi-directional Jira sync (status + comments).',
    labels: ['feature-request', 'medium', 'integrations', 'jira'],
    ageMin: 540,
  },
  {
    source: 'twitter',
    author: 'Kenji Watanabe',
    handle: '@kenjiships',
    url: 'https://x.com/kenjiships/status/demo7',
    title: 'Dark mode hurts my eyes at night',
    content:
      'Small thing but the dark mode contrast is too low — text is hard to read. Otherwise loving Lark for our weekly planning.',
    engagement: 22,
    category: 'bug',
    priority: 'low',
    sentiment: 'neutral',
    segment: 'smb',
    keywords: ['dark-mode', 'accessibility', 'contrast'],
    draftTitle: 'Improve dark mode contrast for readability',
    draftDesc:
      '## Context\nAccessibility nit on dark theme.\n\n## User Quote\n> "The dark mode contrast is too low — text is hard to read."\n\n## Impact\nAccessibility / polish.\n\n## Recommendation\nAudit dark theme tokens against WCAG AA.',
    labels: ['bug', 'low', 'accessibility', 'ui'],
    ageMin: 610,
  },
  {
    source: 'forum',
    author: 'growth_greg',
    url: 'https://forum.example.com/t/demo8',
    title: 'API rate limits are too aggressive',
    content:
      'We built an internal integration on the Lark API but keep hitting 429s at 60 req/min. For a paid plan this feels low — we need at least 300/min to sync nightly.',
    engagement: 38,
    category: 'complaint',
    priority: 'medium',
    sentiment: 'negative',
    segment: 'mid-market',
    keywords: ['api', 'rate-limit', '429'],
    reasons: ['Blocks paid-tier integration'],
    draftTitle: 'Raise API rate limits for paid plans',
    draftDesc:
      '## Context\nPaid customer blocked by API rate limits.\n\n## User Quote\n> "We keep hitting 429s at 60 req/min... we need at least 300/min."\n\n## Impact\nBlocks integrations on paid tier.\n\n## Recommendation\nTier rate limits by plan; document headers.',
    labels: ['complaint', 'medium', 'api'],
    ageMin: 880,
  },
  {
    source: 'reddit',
    subreddit: 'startups',
    author: 'u/founder_fatigue',
    handle: 'u/founder_fatigue',
    url: 'https://reddit.com/r/startups/comments/demo9',
    title: 'How do I bulk-import feedback from Intercom?',
    content:
      'New to Lark — is there a way to import historical Intercom conversations in bulk? I have 2 years of support data I want analyzed.',
    engagement: 30,
    category: 'question',
    priority: 'medium',
    sentiment: 'neutral',
    segment: 'smb',
    keywords: ['import', 'intercom', 'onboarding'],
    draftTitle: 'Document bulk import from Intercom',
    draftDesc:
      '## Context\nOnboarding question about historical data import.\n\n## User Quote\n> "Is there a way to import historical Intercom conversations in bulk?"\n\n## Impact\nOnboarding friction; activation risk.\n\n## Recommendation\nAdd an Intercom importer + docs.',
    labels: ['question', 'medium', 'import', 'intercom'],
    ageMin: 1320,
  },
  {
    source: 'support',
    author: 'Tom Becker',
    url: 'https://support.example.com/ticket/4790',
    title: 'Notifications fire twice',
    content:
      'I get duplicate email + Slack notifications for the same drafted ticket. Annoying but not blocking.',
    engagement: 18,
    category: 'bug',
    priority: 'medium',
    sentiment: 'negative',
    segment: 'smb',
    keywords: ['notifications', 'duplicate'],
    draftTitle: 'Fix: duplicate notifications for a single ticket',
    draftDesc:
      '## Context\nDuplicate notification delivery.\n\n## User Quote\n> "I get duplicate email + Slack notifications for the same drafted ticket."\n\n## Impact\nNotification noise.\n\n## Recommendation\nDeduplicate on ticket id + channel.',
    labels: ['bug', 'medium', 'notifications'],
    status: 'rejected',
    ageMin: 1600,
  },
  {
    source: 'twitter',
    author: 'Lena Fischer',
    handle: '@lenaproduct',
    url: 'https://x.com/lenaproduct/status/demo11',
    title: 'AI ticket drafts save me an hour a day',
    content:
      'The AI-written ticket descriptions in @LarkHQ are shockingly good. I barely edit them. This is what Canny should have built.',
    engagement: 73,
    category: 'praise',
    priority: 'low',
    sentiment: 'positive',
    segment: 'mid-market',
    keywords: ['ai', 'drafting', 'canny'],
    draftTitle: 'Note: AI drafting praised vs competitor (Canny)',
    draftDesc:
      '## Context\nStrong positive sentiment on AI drafting.\n\n## User Quote\n> "The AI-written ticket descriptions are shockingly good."\n\n## Impact\nDifferentiator vs Canny.\n\n## Recommendation\nCollect as testimonial.',
    labels: ['praise', 'low', 'ai'],
    status: 'approved',
    ageMin: 2100,
  },
  {
    source: 'reddit',
    subreddit: 'ProductManagement',
    author: 'u/roadmap_rachel',
    handle: 'u/roadmap_rachel',
    url: 'https://reddit.com/r/ProductManagement/comments/demo12',
    title: 'Need role-based permissions',
    content:
      'Our whole team is in one Lark workspace but I don\'t want every PM to be able to approve and push tickets to Linear. Need viewer/editor/admin roles.',
    engagement: 44,
    category: 'feature_request',
    priority: 'high',
    sentiment: 'neutral',
    segment: 'enterprise',
    keywords: ['permissions', 'rbac', 'roles'],
    reasons: ['Enterprise governance requirement'],
    draftTitle: 'Add role-based access control (viewer/editor/admin)',
    draftDesc:
      '## Context\nGovernance request for larger teams.\n\n## User Quote\n> "Need viewer/editor/admin roles."\n\n## Impact\nEnterprise governance / security requirement.\n\n## Recommendation\nIntroduce RBAC with three default roles.',
    labels: ['feature-request', 'high', 'enterprise', 'permissions'],
    ageMin: 2600,
  },
];

export function buildSeedDrafts(): DraftedTicket[] {
  seq = 0;
  return SEED_SPECS.map(makeDraft);
}

// ---------------------------------------------------------------------------
// Magic pipeline result (POST /api/pipeline/magic)
// ---------------------------------------------------------------------------

function clusterFromDraft(d: DraftedTicket, theme: string, mentionCount: number): ClusteredFeedback {
  return {
    id: `cluster_${d.id}`,
    theme,
    summary: `${mentionCount} users raised feedback related to ${theme}. Representative: "${d.feedbackItem.content.slice(0, 90)}..."`,
    items: [{ item: d.feedbackItem, classification: d.classification }],
    category: d.classification.category,
    priority: d.classification.priority,
    sentiment: d.classification.sentiment,
    mentionCount,
    sources: [d.feedbackItem.source],
    suggestedTicket: {
      title: d.draft.title,
      description: d.draft.description,
      labels: d.draft.suggestedLabels,
    },
  };
}

export function buildMagicResult() {
  const drafts = buildSeedDrafts();
  const clusters: ClusteredFeedback[] = [
    clusterFromDraft(drafts[0], 'SSO / enterprise auth', 9),
    clusterFromDraft(drafts[1], 'CSV export reliability', 4),
    clusterFromDraft(drafts[2], 'Mobile triage app', 7),
    clusterFromDraft(drafts[3], 'Slack digest automation', 5),
    clusterFromDraft(drafts[5], 'Jira two-way sync', 6),
    clusterFromDraft(drafts[11], 'Role-based permissions', 3),
  ];

  const rawItems = drafts.map((d) => ({
    item: {
      id: d.feedbackItem.id,
      content: d.feedbackItem.content,
      title: d.feedbackItem.title,
      source: d.feedbackItem.source,
    },
    classification: {
      category: d.classification.category,
      priority: d.classification.priority,
      sentiment: d.classification.sentiment,
    },
  }));

  const tally = (key: 'category' | 'priority' | 'sentiment') =>
    drafts.reduce<Record<string, number>>((acc, d) => {
      const v = d.classification[key];
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});

  const bySource = drafts.reduce<Record<string, number>>((acc, d) => {
    acc[d.feedbackItem.source] = (acc[d.feedbackItem.source] || 0) + 1;
    return acc;
  }, {});

  return {
    success: true,
    rawItems,
    clusters,
    stats: {
      totalFound: 34,
      totalClusters: clusters.length,
      byCategory: tally('category'),
      byPriority: tally('priority'),
      bySentiment: tally('sentiment'),
      bySource,
    },
    insights: {
      topIssues: [
        'Enterprise SSO/SAML is the #1 blocker on renewals',
        'CSV export data loss is eroding trust in reporting',
        'Mobile triage and Slack digests are deal-influencing asks',
      ],
      urgentItems: drafts.filter((d) => d.classification.priority === 'urgent').length,
      sentimentScore: 58,
      recommendations: [
        'Ship SAML/SSO + SCIM this quarter to unblock enterprise renewals',
        'Patch CSV export truncation immediately (data-loss severity)',
        'Bundle Slack digest automation to convert the Acme annual contract',
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Automation analysis (POST /api/automation/analyze and /run)
// ---------------------------------------------------------------------------

export function buildAnalysis() {
  const drafts = buildSeedDrafts();
  const items = drafts.map((d, i) => ({
    id: `an_${i}`,
    content: d.feedbackItem.content,
    category: d.classification.category,
    sentiment: d.classification.sentiment,
    priority: d.classification.priority,
    priorityScore:
      d.classification.priority === 'urgent'
        ? 95
        : d.classification.priority === 'high'
        ? 78
        : d.classification.priority === 'medium'
        ? 55
        : 30,
    suggestedTitle: d.draft.title,
    summary: d.feedbackItem.content.slice(0, 120),
    tags: d.classification.keywords.slice(0, 3),
    productArea: d.classification.keywords[0],
  }));

  const count = (k: 'category' | 'priority' | 'sentiment') =>
    items.reduce<Record<string, number>>((acc, it) => {
      acc[it[k]] = (acc[it[k]] || 0) + 1;
      return acc;
    }, {});

  const tagCounts = items
    .flatMap((it) => it.tags)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, c]) => ({ tag, count: c }));

  return {
    items,
    summary: {
      total: items.length,
      byCategory: count('category'),
      bySentiment: count('sentiment'),
      byPriority: count('priority'),
      topTags,
      topProductAreas: topTags.map((t) => ({ area: t.tag, count: t.count })),
    },
    recommendations: [
      'Cluster the 3 SSO mentions into one urgent epic — highest revenue impact.',
      'Escalate the CSV export bug; it is a data-loss severity issue.',
      'Two competitor (Productboard/Canny) mentions flag integration gaps.',
    ],
  };
}

// ---------------------------------------------------------------------------
// Stakeholder digests (POST /api/digest)
// ---------------------------------------------------------------------------

export const demoDigests: Record<string, string> = {
  engineering: `# Engineering Digest — Lark
_This week · 34 feedback items · 12 drafted tickets_

## 🐞 Bugs to fix first
1. **CSV export silently truncates beyond 10k rows** (urgent) — data loss in customer reporting.
2. **Duplicate notifications** (medium) — dedupe on ticket id + channel.
3. **Dark mode contrast** (low) — fails WCAG AA in a few tokens.

## 🛠️ Engineering-relevant requests
- **SAML/SSO + SCIM** — unblock enterprise renewals. T-shirt: L.
- **Two-way Jira sync** — bi-directional status + comments. T-shirt: M.
- **Higher API rate limits on paid plans** — tier by plan.

## Acceptance criteria highlights
- CSV export must confirm exported row count and stream large files.
- SSO must support SAML 2.0 IdP-initiated + SP-initiated flows.`,

  leadership: `# Leadership Digest — Lark
_This week · sentiment 58/100 (▲ 6)_

## 💰 Revenue at stake
- **$48k ARR** at risk on renewal — blocked by missing **SSO/SAML**.
- **Acme annual contract** gated on **automated Slack digests**.

## 📈 What customers love
- AI ticket drafting and automatic clustering are repeatedly praised — clear differentiators vs Canny/Productboard.

## 🎯 Recommended bets
1. Ship **SSO/SAML** this quarter (unblocks enterprise).
2. Bundle **Slack digest automation** to convert Acme.
3. Patch **CSV export** to protect trust in reporting.`,

  sales: `# Sales / CS Digest — Lark
_This week · 4 competitive mentions_

## 🗣️ Customer quotes you can use
- "The AI-written ticket descriptions are shockingly good. This is what Canny should have built." — @lenaproduct
- "Automatic clustering saved me hours." — u/pm_in_progress

## ⚠️ Churn / risk signals
- 400-seat account blocked on **SSO** during security review.
- Mid-market customer hitting **API rate limits**.

## 🥊 Competitive intel
- **Productboard**: wins on roadmap views + integrations (Jira).
- **Canny**: has a mobile app; we don't (yet).
- Pricing + AI drafting consistently cited as Lark advantages.`,
};

// ---------------------------------------------------------------------------
// Source search results (reddit + web-search)
// ---------------------------------------------------------------------------

export const demoRedditPosts = [
  {
    id: 'rd1',
    title: 'Best way to turn customer feedback into a roadmap?',
    selftext:
      'Drowning in feedback across Slack, email and Reddit. Looking for a tool that uses AI to cluster and prioritize. Tried Lark and it auto-drafted tickets surprisingly well.',
    author: 'pm_overwhelmed',
    subreddit: 'ProductManagement',
    score: 128,
    num_comments: 34,
    created_utc: Math.floor(Date.now() / 1000) - 7200,
    permalink: '/r/ProductManagement/comments/demo_rd1',
    url: 'https://reddit.com/r/ProductManagement/comments/demo_rd1',
  },
  {
    id: 'rd2',
    title: 'SSO should be table stakes for B2B SaaS in 2025',
    selftext:
      'Our security team rejects any vendor without SAML. Surprised how many feedback tools still lack it. Otherwise Lark has been great for us.',
    author: 'security_first',
    subreddit: 'SaaS',
    score: 95,
    num_comments: 21,
    created_utc: Math.floor(Date.now() / 1000) - 18000,
    permalink: '/r/SaaS/comments/demo_rd2',
    url: 'https://reddit.com/r/SaaS/comments/demo_rd2',
  },
];

export const demoWebResults = (platform: string): Array<Record<string, unknown>> => [
  {
    id: `${platform}_w1`,
    platform,
    title: `${platform === 'twitter' ? 'X' : platform} mention about Lark`,
    content:
      'Switched our feedback workflow to Lark this month — the AI clustering and auto-drafted tickets are a genuine time-saver. Would love a mobile app next.',
    author: platform === 'twitter' ? '@buildinpublic' : 'Jordan Lee',
    url: `https://example.com/${platform}/demo_w1`,
    _category: 'praise',
    _priority: 'low',
    _sentiment: 'positive',
  },
  {
    id: `${platform}_w2`,
    platform,
    title: `${platform} feedback about integrations`,
    content:
      'Evaluating Lark vs Productboard. Lark is cheaper with better AI, but we need a proper two-way Jira sync before we fully commit.',
    author: platform === 'twitter' ? '@stackshift' : 'Sofia Rossi',
    url: `https://example.com/${platform}/demo_w2`,
    _category: 'feature_request',
    _priority: 'medium',
    _sentiment: 'neutral',
  },
];

// ---------------------------------------------------------------------------
// Integrations status (GET /api/integrations/status)
// ---------------------------------------------------------------------------

export const demoIntegrationsStatus = {
  integrations: {
    linear: { connected: true },
    slack: { connected: true },
    github: { connected: true },
    jira: { connected: false },
    notion: { connected: false },
    zoom: { connected: false },
    intercom: { connected: false },
  },
};

// ---------------------------------------------------------------------------
// Scripted agent stream (POST /api/agent) — the "agentic thinking" showcase
// ---------------------------------------------------------------------------

const ts = () => new Date();

function thinkingSteps(states: Array<['pending' | 'in_progress' | 'completed', string]>) {
  return states.map(([status, text], i) => ({
    id: String(i + 1),
    text,
    status,
    timestamp: ts(),
  }));
}

export interface DemoStreamEvent {
  delay: number;
  chunk: StreamChunk;
}

/**
 * Builds a believable multi-stage agent run: think → search → results →
 * impact → streamed answer → follow-up options. Lightly tailored to the
 * question so it always feels responsive.
 */
export function buildAgentStream(question: string): DemoStreamEvent[] {
  const q = question.toLowerCase();
  const topic = q.includes('churn')
    ? 'churn'
    : q.includes('competitor') || q.includes('productboard') || q.includes('canny')
    ? 'competitor'
    : q.includes('bug')
    ? 'bugs'
    : 'sso';

  const headline =
    topic === 'churn'
      ? 'churn risk signals'
      : topic === 'competitor'
      ? 'competitive mentions'
      : topic === 'bugs'
      ? 'the worst open bugs'
      : 'SSO / enterprise demand';

  const events: DemoStreamEvent[] = [];

  // 1) Thinking
  events.push({
    delay: 250,
    chunk: { type: 'thinking', data: { steps: thinkingSteps([['in_progress', `Understanding the question about ${headline}…`]]) } },
  });
  events.push({
    delay: 600,
    chunk: {
      type: 'thinking',
      data: {
        steps: thinkingSteps([
          ['completed', 'Understood the question'],
          ['in_progress', 'Planning which sources to search'],
        ]),
      },
    },
  });
  events.push({
    delay: 600,
    chunk: {
      type: 'thinking',
      data: {
        steps: thinkingSteps([
          ['completed', 'Understood the question'],
          ['completed', 'Planned a search across 4 sources'],
          ['in_progress', 'Searching feedback…'],
        ]),
      },
    },
  });

  // 2) Search progress
  events.push({
    delay: 500,
    chunk: {
      type: 'search_progress',
      data: {
        progress: {
          platforms: [
            { platform: 'Reddit', status: 'searching' },
            { platform: 'X / Twitter', status: 'pending' },
            { platform: 'Sales calls', status: 'pending' },
            { platform: 'Support', status: 'pending' },
          ],
          totalFound: 0,
        },
      },
    },
  });
  events.push({
    delay: 700,
    chunk: {
      type: 'search_progress',
      data: {
        progress: {
          platforms: [
            { platform: 'Reddit', status: 'completed', count: 11 },
            { platform: 'X / Twitter', status: 'searching' },
            { platform: 'Sales calls', status: 'pending' },
            { platform: 'Support', status: 'pending' },
          ],
          totalFound: 11,
        },
      },
    },
  });
  events.push({
    delay: 700,
    chunk: {
      type: 'search_progress',
      data: {
        progress: {
          platforms: [
            { platform: 'Reddit', status: 'completed', count: 11 },
            { platform: 'X / Twitter', status: 'completed', count: 14 },
            { platform: 'Sales calls', status: 'completed', count: 3 },
            { platform: 'Support', status: 'completed', count: 6 },
          ],
          totalFound: 34,
        },
      },
    },
  });

  // 2b) Thinking complete
  events.push({
    delay: 300,
    chunk: {
      type: 'thinking',
      data: {
        steps: thinkingSteps([
          ['completed', 'Understood the question'],
          ['completed', 'Searched 4 sources — 34 results'],
          ['completed', 'Clustered, scored impact, drafted a recommendation'],
        ]),
      },
    },
  });

  // 3) Results
  const results: SearchResult[] = [
    {
      platform: 'reddit',
      id: 'a_r1',
      title: 'No SSO is a dealbreaker',
      content: "Security team blocked rollout because there's no SAML/SSO. 400-person company, hard renewal requirement.",
      author: 'u/scaling_sam',
      url: 'https://reddit.com/r/ProductManagement/comments/demo1',
      metadata: { subreddit: 'ProductManagement', upvotes: 92, comments: 34, timestamp: '2d ago' },
      sentiment: 'negative',
      relevanceScore: 96,
      extractedInsights: ['Enterprise renewal blocker', 'Competitor parity gap'],
    },
    {
      platform: 'call',
      id: 'a_c1',
      title: 'Acme sales call',
      content: 'VP of Product: "If you push a weekly digest into Slack automatically, we\'ll sign the annual contract."',
      author: 'Acme Corp',
      metadata: { customer: 'Acme Corp', duration: '32m', timestamp: '3d ago' },
      sentiment: 'neutral',
      relevanceScore: 88,
      extractedInsights: ['Expansion revenue tied to feature'],
    },
    {
      platform: 'twitter',
      id: 'a_t1',
      content: 'Best feedback tool this year, but it needs a mobile app — Canny already has one.',
      author: '@devonbuilds',
      url: 'https://x.com/devonbuilds/status/demo3',
      metadata: { likes: 64, retweets: 12, timestamp: '1d ago' },
      sentiment: 'positive',
      relevanceScore: 81,
      extractedInsights: ['Mobile gap vs Canny'],
    },
  ];

  const sentiment: SentimentData = {
    positive: 41,
    negative: 38,
    neutral: 21,
    trend: 'up',
    topThemes: [
      { theme: 'SSO / security', count: 9, sentiment: 'negative' },
      { theme: 'AI drafting quality', count: 12, sentiment: 'positive' },
      { theme: 'Mobile app', count: 7, sentiment: 'neutral' },
    ],
  };

  events.push({
    delay: 600,
    chunk: { type: 'results', content: `Found ${results.length} highly relevant mentions across 4 sources.`, data: { results, sentiment } },
  });

  // 4) Impact analysis
  const impact: ImpactAnalysis = {
    feature: topic === 'competitor' ? 'Integrations parity' : topic === 'bugs' ? 'Export reliability' : 'SSO / SAML',
    recommendation: 'ship_now',
    confidence: 91,
    roles: [
      {
        role: 'pm',
        sentimentScore: 62,
        mentionCount: 9,
        keyConcerns: ['Renewal risk', 'Competitive parity'],
        keyBenefits: ['Unblocks enterprise pipeline'],
        representativeQuote: 'Security team blocked the rollout because there is no SSO.',
      },
      {
        role: 'stakeholder',
        sentimentScore: 48,
        mentionCount: 5,
        keyConcerns: ['ARR at risk'],
        keyBenefits: ['Converts the Acme annual contract'],
        representativeQuote: 'We will sign the annual contract if you ship this.',
      },
      {
        role: 'developer',
        sentimentScore: 70,
        mentionCount: 3,
        keyConcerns: ['SCIM provisioning scope'],
        keyBenefits: ['Well-understood, bounded effort'],
        representativeQuote: 'SAML 2.0 + SCIM is the standard ask.',
      },
    ],
    revenueImpact: { atRiskArr: 48000, potentialExpansion: 72000, churnMentions: 4 },
    effortEstimate: { tShirt: 'L', confidence: 74 },
  };
  events.push({ delay: 700, chunk: { type: 'impact', data: { impact } } });

  // 5) Streamed natural-language answer
  const answer =
    topic === 'competitor'
      ? "Here's the competitive picture: customers consistently pick Lark for price and AI drafting, but cite Productboard's roadmap views and a two-way Jira sync, and Canny's mobile app, as gaps. Closing the Jira sync would neutralize the most common objection in deals."
      : topic === 'bugs'
      ? 'The most damaging open bug is the CSV export silently truncating beyond 10k rows — that is a data-loss severity issue showing up in customer QBRs. Duplicate notifications and low dark-mode contrast are lower severity. I would hotfix the export this week.'
      : topic === 'churn'
      ? 'The clearest churn signal is a 400-seat account blocked on SSO during their security review, plus a mid-market customer hitting API rate limits. Both are addressable: prioritize SAML/SSO and tier API limits by plan to protect ~$48k ARR.'
      : 'SSO/SAML is your highest-leverage bet right now. Nine mentions tie it to enterprise renewals, ~$48k ARR is at risk, and a $72k expansion (Acme) is gated on related automation. Effort is a well-bounded L. Recommendation: ship SAML 2.0 + SCIM this quarter and draft the Slack-digest follow-up to convert Acme.';

  const words = answer.split(' ');
  words.forEach((w, i) => {
    events.push({ delay: i === 0 ? 400 : 45, chunk: { type: 'text', content: (i === 0 ? '' : ' ') + w } });
  });

  // 6) Follow-up options
  events.push({
    delay: 300,
    chunk: {
      type: 'options',
      content: 'Want me to take it further?',
      data: {
        options: [
          { id: 'o1', label: 'Draft the SSO epic', description: 'Create a ready-to-ship ticket', icon: '📝' },
          { id: 'o2', label: 'Show competitor breakdown', description: 'Productboard vs Canny vs Lark', icon: '🥊' },
          { id: 'o3', label: 'Estimate revenue impact', description: 'ARR at risk + expansion', icon: '💰' },
        ],
      },
    },
  });

  return events;
}

// ---------------------------------------------------------------------------
// Scripted dashboard chat (POST /api/chat) — streamed plain text
// ---------------------------------------------------------------------------

export function buildChatAnswer(question: string, productName?: string): string {
  const q = question.toLowerCase();
  const name = productName || 'your product';

  if (q.includes('urgent')) {
    return `You have 2 urgent items right now:\n\n1. **SAML/SSO missing** — a 400-seat enterprise account blocked their rollout in security review. ~$48k ARR at renewal risk.\n2. **CSV export truncates beyond 10k rows** — a data-loss bug that already corrupted a customer's QBR deck.\n\nI'd hotfix the export today and commit SSO to this quarter's roadmap.`;
  }
  if (q.includes('feature request') || q.includes('requested') || q.includes('ship next')) {
    return `The most requested themes for ${name}:\n\n• **SSO/SAML** (9 mentions) — enterprise blocker\n• **Native mobile app** (7) — triage on the go, parity with Canny\n• **Two-way Jira sync** (6) — top competitive gap vs Productboard\n• **Automated Slack digests** (5) — tied to the Acme annual contract\n\nHighest leverage: ship SSO, then bundle the Slack digest to convert Acme.`;
  }
  if (q.includes('competitor') || q.includes('vs') || q.includes('productboard') || q.includes('canny')) {
    return `Competitive read for ${name}:\n\n**Where you win:** price, and AI ticket drafting + clustering (customers call it "shockingly good").\n**Where you lose:** Productboard's roadmap views and Jira sync; Canny's mobile app.\n\nClosing the two-way Jira sync would remove the most common objection in your deals.`;
  }
  if (q.includes('bug')) {
    return `Open bugs, worst first:\n\n1. **CSV export truncation >10k rows** (urgent, data loss)\n2. **Duplicate notifications** (medium)\n3. **Dark-mode contrast** (low, accessibility)\n\nOnly #1 is customer-impacting at severity — I'd ship a fix this week.`;
  }
  return `Across 34 feedback items about ${name}, three themes dominate:\n\n1. **Enterprise readiness** — SSO/SAML is the #1 renewal blocker (~$48k ARR at risk).\n2. **Reliability** — a CSV export data-loss bug is hurting trust.\n3. **Reach** — mobile app + Slack digests are deal-influencing asks.\n\nSentiment is **58/100 and trending up**, driven by praise for the AI drafting. Ask me to draft any of these into tickets.`;
}
