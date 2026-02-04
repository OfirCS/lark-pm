// Video/Audio Transcription using OpenAI Whisper
// Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  duration?: number;
  language?: string;
  segments?: TranscriptionSegment[];
  error?: string;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

// Transcribe audio/video using OpenAI Whisper
export async function transcribeAudio(
  audioBlob: Blob,
  fileName: string,
  apiKey: string,
  options: {
    language?: string;
    prompt?: string;
    responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  } = {}
): Promise<TranscriptionResult> {
  const { language, prompt, responseFormat = 'verbose_json' } = options;

  const formData = new FormData();
  formData.append('file', audioBlob, fileName);
  formData.append('model', 'whisper-1');
  formData.append('response_format', responseFormat);

  if (language) {
    formData.append('language', language);
  }

  if (prompt) {
    formData.append('prompt', prompt);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Transcription failed: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      text: data.text,
      duration: data.duration,
      language: data.language,
      segments: data.segments?.map((seg: { id: number; start: number; end: number; text: string }) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transcription failed',
    };
  }
}

// Extract feedback items from transcript
export function extractFeedbackFromTranscript(
  transcript: TranscriptionResult,
  options: {
    minSegmentLength?: number;
    combineSegments?: boolean;
  } = {}
): string[] {
  const { minSegmentLength = 20, combineSegments = true } = options;

  if (!transcript.text) return [];

  if (!transcript.segments || !combineSegments) {
    // Split by sentences or paragraphs
    return transcript.text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length >= minSegmentLength);
  }

  // Combine nearby segments into logical chunks
  const feedbackItems: string[] = [];
  let currentChunk = '';

  for (const segment of transcript.segments) {
    const text = segment.text.trim();

    if (currentChunk && (
      currentChunk.length > 200 ||
      text.match(/^(so|now|okay|alright|next|moving)/i)
    )) {
      if (currentChunk.length >= minSegmentLength) {
        feedbackItems.push(currentChunk.trim());
      }
      currentChunk = text;
    } else {
      currentChunk += ' ' + text;
    }
  }

  if (currentChunk.length >= minSegmentLength) {
    feedbackItems.push(currentChunk.trim());
  }

  return feedbackItems;
}

// Parse Zoom transcript format (VTT)
export function parseZoomTranscript(vttContent: string): TranscriptionSegment[] {
  const segments: TranscriptionSegment[] = [];
  const lines = vttContent.split('\n');

  let currentSegment: Partial<TranscriptionSegment> = {};
  let id = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip header and empty lines
    if (!line || line === 'WEBVTT' || line.startsWith('NOTE')) continue;

    // Timestamp line: 00:00:00.000 --> 00:00:05.000
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timestampMatch) {
      currentSegment.start = parseTimestamp(timestampMatch[1]);
      currentSegment.end = parseTimestamp(timestampMatch[2]);
      continue;
    }

    // Speaker line: Speaker Name: text
    const speakerMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (speakerMatch && currentSegment.start !== undefined) {
      currentSegment.speaker = speakerMatch[1];
      currentSegment.text = speakerMatch[2];

      segments.push({
        id: id++,
        start: currentSegment.start,
        end: currentSegment.end || currentSegment.start + 5,
        text: currentSegment.text,
        speaker: currentSegment.speaker,
      });

      currentSegment = {};
      continue;
    }

    // Plain text line
    if (line && currentSegment.start !== undefined) {
      currentSegment.text = (currentSegment.text || '') + ' ' + line;
    }
  }

  return segments;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':');
  const seconds = parts[2].split('.');

  return (
    parseInt(parts[0]) * 3600 +
    parseInt(parts[1]) * 60 +
    parseInt(seconds[0]) +
    parseInt(seconds[1]) / 1000
  );
}

// Summarize meeting transcript using AI
export async function summarizeMeeting(
  transcript: string,
  apiKey: string
): Promise<{
  summary: string;
  actionItems: string[];
  feedbackPoints: string[];
  participants?: string[];
}> {
  const prompt = `Analyze this meeting transcript and extract:

1. A brief summary (2-3 sentences)
2. Action items mentioned
3. Customer feedback or feature requests mentioned
4. Key participants (if identifiable)

Transcript:
${transcript.slice(0, 15000)}

Respond in JSON format:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "feedbackPoints": ["...", "..."],
  "participants": ["...", "..."]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a meeting analyst extracting key information.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    return {
      summary: 'Failed to summarize meeting',
      actionItems: [],
      feedbackPoints: [],
    };
  }
}
