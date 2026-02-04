// Normalizer - Convert source-specific data to unified FeedbackItem format

import type { FeedbackItem } from '@/types/pipeline';
import type { RedditPost } from '@/lib/sources/reddit';
import type { Tweet } from '@/lib/sources/twitter';
import { calculateEngagementScore as calculateTweetEngagement } from '@/lib/sources/twitter';

/**
 * Generate a unique feedback item ID
 */
function generateFeedbackId(source: string, sourceId: string): string {
  return `fb_${source}_${sourceId}_${Date.now()}`;
}

/**
 * Normalize Reddit post to FeedbackItem
 */
export function normalizeRedditPost(post: RedditPost): FeedbackItem {
  // Calculate engagement score (0-100) based on upvotes and comments
  // Assume 500 upvotes and 100 comments is high engagement
  const scoreRatio = Math.min(post.score / 500, 1);
  const commentRatio = Math.min(post.num_comments / 100, 1);
  const engagementScore = Math.round((scoreRatio * 60 + commentRatio * 40));

  return {
    id: generateFeedbackId('reddit', post.id),
    source: 'reddit',
    sourceId: post.id,
    sourceUrl: post.permalink,

    title: post.title,
    content: post.selftext || post.title,
    author: post.author,
    authorHandle: `u/${post.author}`,

    createdAt: new Date(post.created_utc * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    engagementScore,

    metadata: {
      subreddit: post.subreddit,
      replyCount: post.num_comments,
    },
  };
}

/**
 * Normalize Tweet to FeedbackItem
 */
export function normalizeTweet(tweet: Tweet): FeedbackItem {
  const engagementScore = calculateTweetEngagement(tweet);

  return {
    id: generateFeedbackId('twitter', tweet.id),
    source: 'twitter',
    sourceId: tweet.id,
    sourceUrl: `https://twitter.com/${tweet.author_username || 'i'}/status/${tweet.id}`,

    content: tweet.text,
    author: tweet.author_name || tweet.author_username || 'Unknown',
    authorHandle: tweet.author_username ? `@${tweet.author_username}` : undefined,

    createdAt: tweet.created_at,
    fetchedAt: new Date().toISOString(),
    engagementScore,

    metadata: {
      hashtags: tweet.entities?.hashtags?.map((h) => h.tag) || [],
      mentions: tweet.entities?.mentions?.map((m) => m.username) || [],
      replyCount: tweet.public_metrics?.reply_count,
      retweetCount: tweet.public_metrics?.retweet_count,
      likeCount: tweet.public_metrics?.like_count,
      isRetweet: false, // We filter out retweets in search
      isReply: tweet.text.startsWith('@'),
    },
  };
}

/**
 * Batch normalize Reddit posts
 */
export function normalizeRedditPosts(posts: RedditPost[]): FeedbackItem[] {
  return posts.map(normalizeRedditPost);
}

/**
 * Batch normalize tweets
 */
export function normalizeTweets(tweets: Tweet[]): FeedbackItem[] {
  return tweets.map(normalizeTweet);
}

/**
 * Deduplicate feedback items by content similarity
 * Simple approach: exact content match or very similar
 */
export function deduplicateFeedbackItems(
  newItems: FeedbackItem[],
  existingItems: FeedbackItem[]
): FeedbackItem[] {
  const existingContents = new Set(
    existingItems.map((item) => normalizeContent(item.content))
  );

  return newItems.filter((item) => {
    const normalized = normalizeContent(item.content);
    // Skip if exact match exists
    if (existingContents.has(normalized)) {
      return false;
    }
    // Add to set to prevent duplicates within batch
    existingContents.add(normalized);
    return true;
  });
}

/**
 * Normalize content for comparison
 */
function normalizeContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 200); // Only compare first 200 chars
}

/**
 * Sort feedback items by priority signals
 * Higher engagement + more recent = higher priority
 */
export function sortByPriority(items: FeedbackItem[]): FeedbackItem[] {
  return [...items].sort((a, b) => {
    // Engagement score (higher is better)
    const engagementDiff = b.engagementScore - a.engagementScore;
    if (Math.abs(engagementDiff) > 20) {
      return engagementDiff;
    }

    // Recency (newer is better)
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return bDate - aDate;
  });
}

/**
 * Format FeedbackItem for AI context
 */
export function formatFeedbackForContext(items: FeedbackItem[]): string {
  if (items.length === 0) {
    return 'No feedback items found.';
  }

  return items
    .map((item, i) => {
      const source = item.source === 'reddit'
        ? `Reddit r/${item.metadata.subreddit || 'unknown'}`
        : item.source === 'twitter'
        ? 'Twitter/X'
        : item.source;

      const engagement = `Engagement: ${item.engagementScore}/100`;

      return `[${i + 1}] ${source} - ${item.authorHandle || item.author}
${engagement}
${item.title ? `"${item.title}"\n` : ''}"${item.content}"
Source: ${item.sourceUrl}`;
    })
    .join('\n\n---\n\n');
}
