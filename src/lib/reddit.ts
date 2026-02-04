// Reddit API Integration for Birdly
// Uses Reddit's OAuth API directly for better control

interface RedditToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
}

let cachedToken: { token: RedditToken; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token.access_token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID!;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Birdly/1.0 (Customer Intelligence Engine)',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`);
  }

  const token: RedditToken = await response.json();

  // Cache the token (subtract 60 seconds for safety)
  cachedToken = {
    token,
    expiresAt: Date.now() + (token.expires_in - 60) * 1000,
  };

  return token.access_token;
}

async function redditFetch(endpoint: string): Promise<Response> {
  const token = await getAccessToken();

  return fetch(`https://oauth.reddit.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Birdly/1.0 (Customer Intelligence Engine)',
    },
  });
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  options: {
    limit?: number;
    sort?: 'relevance' | 'hot' | 'top' | 'new';
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<RedditPost[]> {
  const { limit = 25, sort = 'relevance', time = 'week' } = options;

  const params = new URLSearchParams({
    q: query,
    sort,
    t: time,
    limit: limit.toString(),
    restrict_sr: 'true',
  });

  const response = await redditFetch(`/r/${subreddit}/search?${params}`);

  if (!response.ok) {
    console.error('Reddit search failed:', response.status);
    return [];
  }

  const data = await response.json();

  return data.data.children.map((child: { data: RedditPost }) => ({
    id: child.data.id,
    title: child.data.title,
    selftext: child.data.selftext,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: child.data.permalink,
    url: child.data.url,
  }));
}

export async function getSubredditPosts(
  subreddit: string,
  options: {
    limit?: number;
    sort?: 'hot' | 'new' | 'top' | 'rising';
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<RedditPost[]> {
  const { limit = 25, sort = 'hot', time = 'week' } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    t: time,
  });

  const response = await redditFetch(`/r/${subreddit}/${sort}?${params}`);

  if (!response.ok) {
    console.error('Reddit fetch failed:', response.status);
    return [];
  }

  const data = await response.json();

  return data.data.children.map((child: { data: RedditPost }) => ({
    id: child.data.id,
    title: child.data.title,
    selftext: child.data.selftext,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: child.data.permalink,
    url: child.data.url,
  }));
}

export async function searchAllReddit(
  query: string,
  options: {
    limit?: number;
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<RedditPost[]> {
  const { limit = 25, sort = 'relevance', time = 'week' } = options;

  const params = new URLSearchParams({
    q: query,
    sort,
    t: time,
    limit: limit.toString(),
  });

  const response = await redditFetch(`/search?${params}`);

  if (!response.ok) {
    console.error('Reddit search failed:', response.status);
    return [];
  }

  const data = await response.json();

  return data.data.children.map((child: { data: RedditPost }) => ({
    id: child.data.id,
    title: child.data.title,
    selftext: child.data.selftext,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: child.data.permalink,
    url: child.data.url,
  }));
}

export async function getPostComments(
  subreddit: string,
  postId: string,
  options: {
    limit?: number;
    sort?: 'confidence' | 'top' | 'new' | 'controversial' | 'old';
  } = {}
): Promise<RedditComment[]> {
  const { limit = 50, sort = 'top' } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    sort,
  });

  const response = await redditFetch(`/r/${subreddit}/comments/${postId}?${params}`);

  if (!response.ok) {
    console.error('Reddit comments fetch failed:', response.status);
    return [];
  }

  const data = await response.json();

  // Comments are in the second element of the array
  const comments = data[1]?.data?.children || [];

  return comments
    .filter((child: { kind: string }) => child.kind === 't1')
    .map((child: { data: RedditComment }) => ({
      id: child.data.id,
      body: child.data.body,
      author: child.data.author,
      score: child.data.score,
      created_utc: child.data.created_utc,
      permalink: child.data.permalink,
    }));
}

// Monitor multiple subreddits for keywords
export async function monitorSubreddits(
  subreddits: string[],
  keywords: string[],
  options: { limit?: number; time?: 'hour' | 'day' | 'week' } = {}
): Promise<RedditPost[]> {
  const { limit = 10, time = 'day' } = options;

  const allPosts: RedditPost[] = [];

  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      try {
        const posts = await searchSubreddit(subreddit, keyword, {
          limit,
          time,
          sort: 'new',
        });
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error monitoring r/${subreddit} for "${keyword}":`, error);
      }
    }
  }

  // Deduplicate by post ID
  const unique = new Map<string, RedditPost>();
  for (const post of allPosts) {
    if (!unique.has(post.id)) {
      unique.set(post.id, post);
    }
  }

  return Array.from(unique.values()).sort((a, b) => b.score - a.score);
}

// Export types
export type { RedditPost, RedditComment };
