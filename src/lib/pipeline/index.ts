// Pipeline Orchestration
// Exports all pipeline functions for easy access

export { normalizeRedditPost, normalizeTweet, normalizeRedditPosts, normalizeTweets, deduplicateFeedbackItems, sortByPriority, formatFeedbackForContext } from './normalizer';

export { classifyFeedback, classifyFeedbackBatch } from './classifier';

export { draftTicket, draftTicketBatch, createDraftedTicket } from './drafter';

// Re-export types
export type {
  FeedbackItem,
  ClassificationResult,
  DraftedTicket,
  ReviewFilters,
  QueueStats,
  PipelineJob,
  PipelineNotification,
  FeedbackCategory,
  Priority,
  Sentiment,
  CustomerSegment,
  ReviewStatus,
} from '@/types/pipeline';

export {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SENTIMENT_COLORS,
  SOURCE_CONFIG,
  createFeedbackId,
  createDraftId,
} from '@/types/pipeline';
