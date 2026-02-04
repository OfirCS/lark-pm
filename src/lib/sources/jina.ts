// Jina.ai Reader API - Convert webpages to clean markdown
// https://jina.ai/reader
// Free tier: 500 RPM, 10M tokens

const JINA_READER_URL = 'https://r.jina.ai';

export interface JinaReaderResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Read a webpage and convert to clean markdown
 */
export async function readWebpage(url: string): Promise<JinaReaderResult> {
  try {
    const response = await fetch(`${JINA_READER_URL}/${url}`, {
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      return {
        url,
        title: '',
        content: '',
        success: false,
        error: `Failed to read page: ${response.status}`,
      };
    }

    const content = await response.text();

    // Extract title from the first markdown heading if present
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

    return {
      url,
      title,
      content,
      success: true,
    };
  } catch (error) {
    return {
      url,
      title: '',
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read multiple webpages in parallel
 */
export async function readMultipleWebpages(
  urls: string[],
  maxConcurrent = 5
): Promise<JinaReaderResult[]> {
  const results: JinaReaderResult[] = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(batch.map(readWebpage));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Format webpage content for AI context (truncated)
 */
export function formatWebpageForContext(
  result: JinaReaderResult,
  maxLength = 2000
): string {
  if (!result.success) {
    return `[Failed to read: ${result.url}] - ${result.error}`;
  }

  const truncated = result.content.length > maxLength
    ? result.content.slice(0, maxLength) + '\n\n[Content truncated...]'
    : result.content;

  return `## ${result.title}
Source: ${result.url}

${truncated}`;
}

/**
 * Search the web using Jina's search endpoint
 */
export async function searchWeb(query: string): Promise<JinaReaderResult[]> {
  try {
    const response = await fetch(
      `https://s.jina.ai/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();

    // Parse search results
    return data.data?.map((item: { url: string; title: string; content: string }) => ({
      url: item.url,
      title: item.title,
      content: item.content,
      success: true,
    })) || [];
  } catch (error) {
    console.error('Jina search error:', error);
    return [];
  }
}
