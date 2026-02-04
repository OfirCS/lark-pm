// Reddit Search API Route - Proxies requests to avoid CORS
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subreddit, sort = 'relevance', time = 'week', limit = 25 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const baseUrl = subreddit
      ? `https://old.reddit.com/r/${subreddit}/search.json`
      : 'https://old.reddit.com/search.json';

    const params = new URLSearchParams({
      q: query,
      sort,
      t: time,
      limit: String(limit),
      restrict_sr: subreddit ? '1' : '0',
      raw_json: '1',
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
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

    return NextResponse.json({
      posts,
      after: data.data.after,
      count: posts.length,
    });
  } catch (error) {
    console.error('Reddit search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Reddit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const subreddit = searchParams.get('subreddit');
  const sort = searchParams.get('sort') || 'relevance';
  const time = searchParams.get('time') || 'week';
  const limit = searchParams.get('limit') || '25';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const baseUrl = subreddit
    ? `https://old.reddit.com/r/${subreddit}/search.json`
    : 'https://old.reddit.com/search.json';

  const params = new URLSearchParams({
    q: query,
    sort,
    t: time,
    limit,
    restrict_sr: subreddit ? '1' : '0',
    raw_json: '1',
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
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

    return NextResponse.json({
      posts,
      after: data.data.after,
      count: posts.length,
    });
  } catch (error) {
    console.error('Reddit search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Reddit' },
      { status: 500 }
    );
  }
}
