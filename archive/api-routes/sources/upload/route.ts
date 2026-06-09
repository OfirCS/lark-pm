// File Upload API Route
// Handles CSV, Excel, JSON, and TXT file uploads

import { NextRequest, NextResponse } from 'next/server';
import { parseFileBuffer, ParseResult } from '@/lib/parsers';
import type { FeedbackItem } from '@/types/pipeline';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert parsed feedback to FeedbackItem format
function toFeedbackItem(parsed: { id: string; content: string; source: string; author?: string; date?: string }, fileName: string): FeedbackItem {
  return {
    id: `file_${parsed.id}`,
    source: 'file',
    sourceId: parsed.id,
    sourceUrl: '', // No URL for file uploads

    content: parsed.content,
    author: parsed.author || 'Unknown',
    authorHandle: undefined,

    createdAt: parsed.date || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    engagementScore: 0, // No engagement for file uploads

    metadata: {
      fileName,
      originalSource: parsed.source,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/plain',
    ];

    const allowedExtensions = ['csv', 'xlsx', 'xls', 'json', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();

    // Parse file
    const result: ParseResult = parseFileBuffer(buffer, file.name, file.type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to parse file' },
        { status: 400 }
      );
    }

    // Convert to FeedbackItems
    const feedbackItems: FeedbackItem[] = result.items.map(item =>
      toFeedbackItem(item, file.name)
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: result.fileType,
      totalItems: feedbackItems.length,
      items: feedbackItems,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
