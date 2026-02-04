// Pipeline Types - Automated feedback processing

// Core feedback item - normalized from any source
export interface FeedbackItem {
  id: string;
  source: 'reddit' | 'twitter' | 'slack' | 'support' | 'call' | 'file';
  sourceId: string;
  sourceUrl: string;

  // Content
  title?: string;
  content: string;
  author: string;
  authorHandle?: string;

  // Metadata
  createdAt: string;
  fetchedAt: string;
  engagementScore: number; // normalized 0-100 based on upvotes/likes/etc

  // Source-specific metadata
  metadata: {
    subreddit?: string;
    hashtags?: string[];
    mentions?: string[];
    replyCount?: number;
    retweetCount?: number;
    likeCount?: number;
    isRetweet?: boolean;
    isReply?: boolean;
    fileName?: string;
    originalSource?: string;
  };
}

// Classification categories
export type FeedbackCategory =
  | 'bug'
  | 'feature_request'
  | 'praise'
  | 'question'
  | 'complaint'
  | 'other';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Sentiment types
export type Sentiment = 'positive' | 'negative' | 'neutral';

// Customer segment
export type CustomerSegment = 'enterprise' | 'mid-market' | 'smb' | 'unknown';

// Classification result from AI
export interface ClassificationResult {
  category: FeedbackCategory;
  confidence: number; // 0-100
  priority: Priority;
  priorityReasons: string[];
  sentiment: Sentiment;
  keywords: string[];
  customerSegment: CustomerSegment;
  duplicateOf?: string; // ID of similar existing item
  duplicateConfidence?: number;
}

// Review status
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'edited';

// Drafted ticket pending review
export interface DraftedTicket {
  id: string;

  // Source feedback
  feedbackItem: FeedbackItem;
  classification: ClassificationResult;

  // AI-generated ticket draft
  draft: {
    title: string;
    description: string;
    suggestedLabels: string[];
    suggestedPriority: Priority;
  };

  // Review state
  status: ReviewStatus;
  reviewedAt?: string;
  reviewedBy?: string;

  // Edited version (if PM modified before approval)
  editedDraft?: {
    title: string;
    description: string;
    priority: Priority;
    labels: string[];
  };

  // Rejection info
  rejectionReason?: string;

  // Created ticket result (after approval)
  createdTicket?: {
    platform: 'linear' | 'jira' | 'github' | 'notion';
    ticketId: string;
    ticketUrl: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Review queue filters
export interface ReviewFilters {
  status?: ReviewStatus | 'all';
  category?: FeedbackCategory | 'all';
  priority?: Priority | 'all';
  source?: FeedbackItem['source'] | 'all';
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Pipeline job types
export type PipelineJobType = 'ingest' | 'classify' | 'draft';

// Pipeline job status
export interface PipelineJob {
  id: string;
  type: PipelineJobType;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  itemsProcessed: number;
  itemsFailed: number;
  errors?: string[];
}

// Pipeline notification types
export type PipelineNotificationType =
  | 'new_feedback'
  | 'ticket_drafted'
  | 'ticket_created'
  | 'pipeline_error'
  | 'classification_complete';

// Pipeline notification
export interface PipelineNotification {
  id: string;
  type: PipelineNotificationType;
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
  read: boolean;
}

// Queue statistics
export interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byCategory: Record<FeedbackCategory, number>;
  byPriority: Record<Priority, number>;
  bySource: Record<string, number>;
}

// Helper to create a new feedback item ID
export function createFeedbackId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create a new draft ID
export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Priority colors for UI
export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  low: { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200' },
};

// Category colors for UI
export const CATEGORY_COLORS: Record<FeedbackCategory, { bg: string; text: string; border: string }> = {
  bug: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  feature_request: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  praise: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  question: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  complaint: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  other: { bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200' },
};

// Sentiment colors for UI
export const SENTIMENT_COLORS: Record<Sentiment, { bg: string; text: string }> = {
  positive: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  negative: { bg: 'bg-red-50', text: 'text-red-600' },
  neutral: { bg: 'bg-stone-100', text: 'text-stone-600' },
};

// Source icons/colors for UI
export const SOURCE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  reddit: { icon: '🔴', color: '#ff4500', label: 'Reddit' },
  twitter: { icon: '𝕏', color: '#000000', label: 'X/Twitter' },
  slack: { icon: '💬', color: '#4A154B', label: 'Slack' },
  support: { icon: '🎫', color: '#1F8CED', label: 'Support' },
  call: { icon: '📞', color: '#2D8CFF', label: 'Call' },
};
