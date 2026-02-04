// Quick Analysis API
// POST /api/automation/analyze - Analyze uploaded file without creating tickets

import { quickAnalyze } from '@/lib/automation/pipeline';

export const runtime = 'edge';
export const maxDuration = 120;

interface AnalyzeRequest {
  content: string;
  fileName: string;
  productContext?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as AnalyzeRequest;

    if (!body.content || !body.fileName) {
      return Response.json(
        { success: false, error: 'Content and fileName are required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return Response.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const result = await quickAnalyze(
      body.content,
      body.fileName,
      openaiApiKey,
      body.productContext
    );

    if (!result.parsed.success) {
      return Response.json(
        { success: false, error: result.parsed.error || 'Failed to parse file' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      parsed: {
        fileName: result.parsed.fileName,
        fileType: result.parsed.fileType,
        totalRows: result.parsed.totalRows,
      },
      analysis: result.analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
