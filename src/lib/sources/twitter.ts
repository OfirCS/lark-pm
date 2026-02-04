// Twitter/X API v2 Integration
// Search and format tweets for AI context

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  author_username?: string;
  author_name?: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
    urls?: Array<{ url: string; expanded_url: string }>;
  };
}

export interface TwitterSearchResult {
  tweets: Tweet[];
  meta?: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token?: string;
  };
  count: number;
}

interface TwitterSearchResponse {
  data?: Tweet[];
  includes?: {
    users?: Array<{
      id: string;
      username: string;
      name: string;
    }>;
  };
  meta?: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token?: string;
  };
}

/**
 * Search Twitter for tweets matching a query
 */
export async function searchTwitter(
  query: string,
  options: {
    maxResults?: number;
    startTime?: string;
    endTime?: string;
  } = {}
): Promise<TwitterSearchResult> {
  const { maxResults = 25 } = options;

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('TWITTER_BEARER_TOKEN not set, returning empty results');
    return { tweets: [], count: 0 };
  }

  const params = new URLSearchParams({
    query: `${query} -is:retweet lang:en`,
    max_results: Math.min(Math.max(maxResults, 10), 100).toString(),
    'tweet.fields': 'author_id,created_at,public_metrics,entities',
    expansions: 'author_id',
    'user.fields': 'username,name',
  });

  if (options.startTime) {
    params.append('start_time', options.startTime);
  }
  if (options.endTime) {
    params.append('end_time', options.endTime);
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?${params}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data: TwitterSearchResponse = await response.json();

    if (!data.data) {
      return { tweets: [], count: 0 };
    }

    // Map author info to tweets
    const usersMap = new Map(
      data.includes?.users?.map((user) => [user.id, user]) || []
    );

    const tweets: Tweet[] = data.data.map((tweet) => {
      const user = usersMap.get(tweet.author_id);
      return {
        ...tweet,
        author_username: user?.username,
        author_name: user?.name,
      };
    });

    return {
      tweets,
      meta: data.meta,
      count: tweets.length,
    };
  } catch (error) {
    console.error('Twitter search error:', error);
    throw error;
  }
}

/**
 * Search for mentions of a username
 */
export async function searchMentions(
  username: string,
  options: { maxResults?: number } = {}
): Promise<TwitterSearchResult> {
  return searchTwitter(`@${username.replace('@', '')}`, options);
}

/**
 * Search for hashtags
 */
export async function searchHashtags(
  hashtags: string[],
  options: { maxResults?: number } = {}
): Promise<TwitterSearchResult> {
  const query = hashtags.map((h) => `#${h.replace('#', '')}`).join(' OR ');
  return searchTwitter(query, options);
}

/**
 * Format tweets for AI context (matches Reddit pattern)
 */
export function formatTweetsForContext(tweets: Tweet[]): string {
  if (tweets.length === 0) {
    return 'No tweets found.';
  }

  return tweets
    .map((tweet, i) => {
      const author = tweet.author_username
        ? `@${tweet.author_username}`
        : tweet.author_name || 'Unknown';

      const metrics = tweet.public_metrics;
      const engagement = metrics
        ? `Likes: ${metrics.like_count} | Retweets: ${metrics.retweet_count} | Replies: ${metrics.reply_count}`
        : 'No metrics';

      const hashtags = tweet.entities?.hashtags
        ?.map((h) => `#${h.tag}`)
        .join(' ');

      const date = new Date(tweet.created_at).toLocaleDateString();

      return `[${i + 1}] ${author} (${date})
${engagement}
"${tweet.text}"${hashtags ? `\nHashtags: ${hashtags}` : ''}
Source: https://twitter.com/${tweet.author_username || 'i'}/status/${tweet.id}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Calculate engagement score (0-100) for a tweet
 */
export function calculateEngagementScore(tweet: Tweet): number {
  const metrics = tweet.public_metrics;
  if (!metrics) return 0;

  // Weighted engagement score
  const score =
    metrics.like_count * 1 +
    metrics.retweet_count * 2 +
    metrics.reply_count * 1.5 +
    metrics.quote_count * 2.5;

  // Normalize to 0-100 (assuming 1000 is very high engagement)
  return Math.min(Math.round((score / 1000) * 100), 100);
}

/**
 * Filter tweets by minimum engagement
 */
export function filterByEngagement(
  tweets: Tweet[],
  minScore: number = 10
): Tweet[] {
  return tweets.filter((tweet) => calculateEngagementScore(tweet) >= minScore);
}

/**
 * Extract trending hashtags from tweets
 */
export function extractTrendingHashtags(
  tweets: Tweet[]
): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();

  tweets.forEach((tweet) => {
    tweet.entities?.hashtags?.forEach((h) => {
      const tag = h.tag.toLowerCase();
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
