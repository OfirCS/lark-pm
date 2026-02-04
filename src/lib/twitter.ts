// Twitter/X API Integration for Birdly
// Uses Twitter API v2

interface Tweet {
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

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;

async function twitterFetch(endpoint: string): Promise<Response> {
  return fetch(`https://api.twitter.com/2${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function searchTweets(
  query: string,
  options: {
    max_results?: number;
    start_time?: string;
    end_time?: string;
  } = {}
): Promise<Tweet[]> {
  const { max_results = 100 } = options;

  const params = new URLSearchParams({
    query,
    max_results: Math.min(max_results, 100).toString(),
    'tweet.fields': 'author_id,created_at,public_metrics,entities',
    expansions: 'author_id',
    'user.fields': 'username,name',
  });

  if (options.start_time) {
    params.append('start_time', options.start_time);
  }
  if (options.end_time) {
    params.append('end_time', options.end_time);
  }

  const response = await twitterFetch(`/tweets/search/recent?${params}`);

  if (!response.ok) {
    console.error('Twitter search failed:', response.status, await response.text());
    return [];
  }

  const data: TwitterSearchResponse = await response.json();

  if (!data.data) {
    return [];
  }

  // Map author info to tweets
  const usersMap = new Map(
    data.includes?.users?.map((user) => [user.id, user]) || []
  );

  return data.data.map((tweet) => {
    const user = usersMap.get(tweet.author_id);
    return {
      ...tweet,
      author_username: user?.username,
      author_name: user?.name,
    };
  });
}

export async function getMentions(
  username: string,
  options: { max_results?: number } = {}
): Promise<Tweet[]> {
  // Search for @username mentions
  return searchTweets(`@${username}`, options);
}

export async function searchHashtags(
  hashtags: string[],
  options: { max_results?: number } = {}
): Promise<Tweet[]> {
  const query = hashtags.map((h) => `#${h.replace('#', '')}`).join(' OR ');
  return searchTweets(query, options);
}

export async function searchBrandMentions(
  brandName: string,
  options: {
    max_results?: number;
    include_competitors?: string[];
  } = {}
): Promise<{
  brand_tweets: Tweet[];
  competitor_tweets: Map<string, Tweet[]>;
}> {
  const brand_tweets = await searchTweets(brandName, { max_results: options.max_results });

  const competitor_tweets = new Map<string, Tweet[]>();

  if (options.include_competitors) {
    for (const competitor of options.include_competitors) {
      const tweets = await searchTweets(competitor, { max_results: options.max_results });
      competitor_tweets.set(competitor, tweets);
    }
  }

  return { brand_tweets, competitor_tweets };
}

// Helper to identify viral tweets (high engagement)
export function identifyViralTweets(
  tweets: Tweet[],
  threshold: { likes?: number; retweets?: number } = { likes: 100, retweets: 50 }
): Tweet[] {
  return tweets.filter((tweet) => {
    const metrics = tweet.public_metrics;
    if (!metrics) return false;

    return (
      (threshold.likes && metrics.like_count >= threshold.likes) ||
      (threshold.retweets && metrics.retweet_count >= threshold.retweets)
    );
  });
}

// Helper to extract hashtags from tweets
export function extractHashtags(tweets: Tweet[]): Map<string, number> {
  const hashtags = new Map<string, number>();

  for (const tweet of tweets) {
    for (const tag of tweet.entities?.hashtags || []) {
      const current = hashtags.get(tag.tag) || 0;
      hashtags.set(tag.tag, current + 1);
    }
  }

  return new Map([...hashtags.entries()].sort((a, b) => b[1] - a[1]));
}

// Monitor brand and keywords
export async function monitorTwitter(
  brandName: string,
  keywords: string[],
  options: {
    max_results?: number;
    competitors?: string[];
  } = {}
): Promise<{
  mentions: Tweet[];
  keyword_matches: Tweet[];
  competitor_mentions: Map<string, Tweet[]>;
  viral_tweets: Tweet[];
}> {
  const { max_results = 50, competitors = [] } = options;

  // Get brand mentions
  const mentions = await getMentions(brandName, { max_results });

  // Search for keywords
  const keywordQuery = keywords.join(' OR ');
  const keyword_matches = await searchTweets(`(${keywordQuery}) -is:retweet`, {
    max_results,
  });

  // Get competitor mentions
  const competitor_mentions = new Map<string, Tweet[]>();
  for (const competitor of competitors) {
    const tweets = await searchTweets(competitor, { max_results: 25 });
    competitor_mentions.set(competitor, tweets);
  }

  // Identify viral content
  const allTweets = [...mentions, ...keyword_matches];
  const viral_tweets = identifyViralTweets(allTweets);

  return {
    mentions,
    keyword_matches,
    competitor_mentions,
    viral_tweets,
  };
}

// Export types
export type { Tweet, TwitterSearchResponse };
