// Agent Types for Lark AI Assistant

export type MessageRole = 'user' | 'agent' | 'system';

export type MessageType =
  | 'text'
  | 'thinking'
  | 'options'
  | 'search_progress'
  | 'search_results'
  | 'sentiment_summary'
  | 'impact_analysis'
  | 'feature_card'
  | 'action_suggestion';

export interface AgentMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  data?: MessageData;
  timestamp: Date;
  streaming?: boolean;
}

export interface MessageData {
  options?: OptionCard[];
  results?: SearchResult[];
  sentiment?: SentimentData;
  impact?: ImpactAnalysis;
  sources?: SourceReference[];
  thinkingSteps?: ThinkingStep[];
  searchProgress?: SearchProgress;
}

export interface OptionCard {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  count?: number;
  selected?: boolean;
}

export interface SearchResult {
  platform: 'reddit' | 'twitter' | 'linkedin' | 'call' | 'ticket' | 'forum';
  id: string;
  title?: string;
  content: string;
  author: string;
  url?: string;
  metadata: {
    subreddit?: string;
    upvotes?: number;
    comments?: number;
    likes?: number;
    retweets?: number;
    duration?: string;
    customer?: string;
    timestamp: string;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
  extractedInsights: string[];
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  trend: 'up' | 'down' | 'stable';
  topThemes: {
    theme: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface ImpactAnalysis {
  feature: string;
  recommendation: 'ship_now' | 'plan_next' | 'research_more' | 'deprioritize';
  confidence: number;
  roles: RoleImpact[];
  revenueImpact: {
    atRiskArr: number;
    potentialExpansion: number;
    churnMentions: number;
  };
  effortEstimate: {
    tShirt: 'XS' | 'S' | 'M' | 'L' | 'XL';
    confidence: number;
  };
}

export interface RoleImpact {
  role: 'developer' | 'uiux' | 'design' | 'stakeholder' | 'pm';
  sentimentScore: number;
  mentionCount: number;
  keyConcerns: string[];
  keyBenefits: string[];
  representativeQuote: string;
}

export interface SourceReference {
  type: 'reddit' | 'twitter' | 'call' | 'ticket';
  id: string;
  title: string;
  url?: string;
}

export interface ThinkingStep {
  id: string;
  text: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: Date;
}

export interface SearchProgress {
  platforms: {
    platform: string;
    status: 'pending' | 'searching' | 'completed' | 'error';
    count?: number;
  }[];
  totalFound: number;
}

export interface DashboardContext {
  type: 'feature_request' | 'sentiment' | 'competitor' | 'general';
  featureId?: number;
  featureName?: string;
  competitorName?: string;
  timeRange?: string;
}

// Streaming chunk types
export interface StreamChunk {
  type: 'text' | 'thinking' | 'tool_start' | 'tool_result' | 'options' | 'search_progress' | 'results' | 'impact';
  content?: string;
  data?: Record<string, unknown>;
}
