// Reddit JSON API - Free, no authentication required
// https://www.reddit.com/dev/api/

export interface RedditPost {
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
  is_self: boolean;
}

export interface RedditSearchResult {
  posts: RedditPost[];
  after: string | null;
  count: number;
}

/**
 * Search Reddit for posts matching a query
 */
export async function searchReddit(
  query: string,
  options: {
    subreddit?: string;
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    limit?: number;
  } = {}
): Promise<RedditSearchResult> {
  const { subreddit, sort = 'relevance', time = 'week', limit = 25 } = options;

  const baseUrl = subreddit
    ? `https://www.reddit.com/r/${subreddit}/search.json`
    : 'https://www.reddit.com/search.json';

  const params = new URLSearchParams({
    q: query,
    sort,
    t: time,
    limit: String(limit),
    restrict_sr: subreddit ? '1' : '0',
  });

  const response = await fetch(`${baseUrl}?${params}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LarkPM/1.0; +https://lark.pm)',
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();

  const posts: RedditPost[] = data.data.children.map((child: { data: RedditPost }) => ({
    id: child.data.id,
    title: child.data.title,
    selftext: child.data.selftext,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: `https://reddit.com${child.data.permalink}`,
    url: child.data.url,
    is_self: child.data.is_self,
  }));

  return {
    posts,
    after: data.data.after,
    count: posts.length,
  };
}

/**
 * Get hot posts from a subreddit
 */
export async function getSubredditHot(
  subreddit: string,
  limit = 25
): Promise<RedditSearchResult> {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LarkPM/1.0; +https://lark.pm)',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();

  const posts: RedditPost[] = data.data.children.map((child: { data: RedditPost }) => ({
    id: child.data.id,
    title: child.data.title,
    selftext: child.data.selftext,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: `https://reddit.com${child.data.permalink}`,
    url: child.data.url,
    is_self: child.data.is_self,
  }));

  return {
    posts,
    after: data.data.after,
    count: posts.length,
  };
}

/**
 * Format Reddit posts for AI context
 */
export function formatRedditPostsForContext(posts: RedditPost[]): string {
  if (posts.length === 0) {
    return 'No Reddit posts found.';
  }

  return posts
    .map((post, i) => {
      const text = post.selftext
        ? post.selftext.slice(0, 500) + (post.selftext.length > 500 ? '...' : '')
        : '[Link post]';

      return `[${i + 1}] r/${post.subreddit} - "${post.title}"
Score: ${post.score} | Comments: ${post.num_comments}
${text}
Source: ${post.permalink}`;
    })
    .join('\n\n---\n\n');
}
