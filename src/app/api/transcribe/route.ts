// Video/Audio Transcription API
// POST /api/transcribe - Upload audio/video file for transcription

import { transcribeAudio, summarizeMeeting, extractFeedbackFromTranscript } from '@/lib/transcription/whisper';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes for large files

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Check if it's a file upload
    if (!contentType.includes('multipart/form-data')) {
      return Response.json(
        { success: false, error: 'Expected multipart/form-data with audio/video file' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const summarize = formData.get('summarize') === 'true';
    const extractFeedback = formData.get('extractFeedback') === 'true';

    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm', 'audio/m4a'];
    const allowedExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];

    const isValidType = allowedTypes.some(t => file.type.includes(t.split('/')[1]));
    const isValidExt = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType && !isValidExt) {
      return Response.json(
        { success: false, error: 'Invalid file type. Supported: mp3, mp4, wav, webm, m4a' },
        { status: 400 }
      );
    }

    // Check file size (max 25MB for Whisper API)
    if (file.size > 25 * 1024 * 1024) {
      return Response.json(
        { success: false, error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'OpenAI API key required for transcription. Add OPENAI_API_KEY to your environment variables.',
      }, { status: 200 });
    }

    // Transcribe
    const transcript = await transcribeAudio(
      file,
      file.name,
      apiKey,
      { responseFormat: 'verbose_json' }
    );

    if (!transcript.success) {
      return Response.json(
        { success: false, error: transcript.error },
        { status: 500 }
      );
    }

    const result: {
      success: boolean;
      transcript: typeof transcript;
      summary?: Awaited<ReturnType<typeof summarizeMeeting>>;
      feedbackItems?: string[];
    } = {
      success: true,
      transcript,
    };

    // Optionally summarize
    if (summarize && transcript.text) {
      result.summary = await summarizeMeeting(transcript.text, apiKey);
    }

    // Optionally extract feedback
    if (extractFeedback) {
      result.feedbackItems = extractFeedbackFromTranscript(transcript);
    }

    return Response.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    );
  }
}

// GET for info
export async function GET() {
  return Response.json({
    service: 'Audio/Video Transcription',
    supportedFormats: ['mp3', 'mp4', 'wav', 'webm', 'm4a'],
    maxFileSize: '25MB',
    features: ['transcription', 'meeting summarization', 'feedback extraction'],
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        file: 'Audio or video file (required)',
        summarize: 'Set to "true" to get meeting summary',
        extractFeedback: 'Set to "true" to extract feedback items',
      },
    },
  });
}
