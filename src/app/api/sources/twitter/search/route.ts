// Twitter/X Search API Route
import { NextRequest, NextResponse } from 'next/server';
import { searchTwitter, formatTweetsForContext, filterByEngagement } from '@/lib/sources/twitter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxResults = 25, minEngagement = 0 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const result = await searchTwitter(query, { maxResults });

    // Optionally filter by engagement
    const tweets = minEngagement > 0
      ? filterByEngagement(result.tweets, minEngagement)
      : result.tweets;

    return NextResponse.json({
      tweets,
      count: tweets.length,
      formatted: formatTweetsForContext(tweets),
    });
  } catch (error) {
    console.error('Twitter search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Twitter' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const maxResults = parseInt(searchParams.get('maxResults') || '25');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await searchTwitter(query, { maxResults });

    return NextResponse.json({
      tweets: result.tweets,
      count: result.count,
    });
  } catch (error) {
    console.error('Twitter search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Twitter' },
      { status: 500 }
    );
  }
}
