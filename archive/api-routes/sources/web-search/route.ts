// Multi-platform Search API
// Reddit: handled by /api/sources/reddit/search (real JSON API)
// Twitter, LinkedIn, Forums: AI-powered via OpenAI

import { NextRequest, NextResponse } from 'next/server';
import { searchPlatform, searchAllPlatforms } from '@/lib/sources/web-search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      platform,
      platforms,
      searchTerms,
      competitors,
      productDescription,
      targetAudience,
      currentFocus,
      limit = 5,
    } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      );
    }

    // Search a single platform
    if (platform) {
      const results = await searchPlatform(platform, productName, {
        searchTerms,
        competitors,
        productDescription,
        targetAudience,
        currentFocus,
        limit,
      });
      return NextResponse.json({ results, count: results.length, platform });
    }

    // Search multiple platforms in parallel
    if (platforms) {
      const results = await searchAllPlatforms(productName, {
        platforms,
        searchTerms,
        competitors,
        productDescription,
        targetAudience,
        currentFocus,
        limitPerPlatform: limit,
      });
      return NextResponse.json(results);
    }

    // Default: search all
    const results = await searchAllPlatforms(productName, {
      searchTerms,
      competitors,
      productDescription,
      targetAudience,
      currentFocus,
      limitPerPlatform: limit,
    });
    return NextResponse.json(results);
  } catch (error) {
    console.error('Web search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
