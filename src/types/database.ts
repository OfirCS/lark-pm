// Database types for Birdly

export interface SocialMention {
  id: number;
  platform: 'reddit' | 'twitter';
  post_id: string;
  title?: string;
  content: string;
  author: string;
  url: string;
  upvotes: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  ai_insights: AIInsights;
  subreddit?: string;
  hashtags?: string[];
  created_at: string;
  detected_at: string;
}

export interface AIInsights {
  feature_requests: FeatureRequest[];
  pain_points: string[];
  competitive_mentions: CompetitiveMention[];
  urgency_signals: string[];
  summary: string;
}

export interface FeatureRequest {
  title: string;
  description: string;
  mentions: number;
  sources: Source[];
  priority_score: number;
  status: 'new' | 'reviewing' | 'planned' | 'in_progress' | 'shipped';
  affected_revenue?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
}

export interface CompetitiveMention {
  competitor: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  comparison_points: string[];
}

export interface CallTranscript {
  id: number;
  meeting_id: string;
  platform: 'zoom' | 'meet' | 'teams';
  meeting_topic: string;
  participants: Participant[];
  duration_minutes: number;
  transcript_text: string;
  insights: CallInsights;
  customer_id?: number;
  customer_name?: string;
  deal_size?: number;
  stage?: 'prospecting' | 'qualifying' | 'closing' | 'customer_success';
  created_at: string;
}

export interface Participant {
  name: string;
  email?: string;
  role?: 'sales' | 'customer' | 'pm' | 'engineering' | 'other';
}

export interface CallInsights {
  feature_requests: string[];
  pain_points: string[];
  objections: string[];
  competitive_mentions: string[];
  buying_signals: string[];
  technical_requirements: string[];
  integration_needs: string[];
  urgency_level: 'low' | 'medium' | 'high';
  summary: string;
}

export interface UnifiedFeatureRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'new' | 'reviewing' | 'planned' | 'in_progress' | 'shipped';
  priority_score: number;
  rice_score: RICEScore;
  mention_count: number;
  sources: Source[];
  affected_revenue: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  sentiment_breakdown: SentimentBreakdown;
  trend: 'rising' | 'stable' | 'declining';
  created_at: string;
  updated_at: string;
}

export interface RICEScore {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  total: number;
}

export interface Source {
  type: 'reddit' | 'twitter' | 'call' | 'ticket' | 'slack';
  id: string | number;
  title?: string;
  url?: string;
  timestamp: string;
}

export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  company: string;
  arr: number;
  segment: 'enterprise' | 'mid-market' | 'smb' | 'free';
  industry?: string;
  health_score: number;
  crm_id?: string;
  created_at: string;
}

export interface DashboardStats {
  total_mentions: number;
  mentions_change: number;
  feature_requests: number;
  requests_change: number;
  avg_sentiment: number;
  sentiment_change: number;
  calls_analyzed: number;
  calls_change: number;
}

export interface SentimentTrend {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface CompetitorComparison {
  name: string;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
}
