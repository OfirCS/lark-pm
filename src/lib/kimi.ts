// Kimi AI Client - OpenAI-compatible API
// https://platform.moonshot.cn/docs/api/chat

// OpenAI API endpoint
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface KimiStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

// PM Assistant System Prompt
export const PM_SYSTEM_PROMPT = `You are Lark, a sharp PM assistant. Be brief and direct.

Rules:
- Write like a busy colleague on Slack, not a formal report
- 2-3 short sentences max per point. No fluff.
- Skip intros like "Great question!" or "I'd be happy to help"
- Use plain language. Avoid corporate jargon.
- Only use bullet points when listing 3+ specific items
- No emoji. No excessive formatting.
- When you have data, lead with the key number or insight
- End with one clear next step, not a list of options

Bad: "Based on my analysis of the data, I've identified several key themes that emerge from the customer feedback..."
Good: "Pricing complaints are up 40% this month. Most are from SMB users comparing you to Competitor X."

Be useful, not impressive.`;

/**
 * Send a chat completion request to Kimi AI (streaming)
 */
export async function chatWithKimi(
  messages: KimiMessage[],
  options: {
    stream?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<Response> {
  const {
    stream = true,
    model = 'gpt-4o-mini',
    temperature = 0.6,
    maxTokens = 2048,
  } = options;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${response.status} - ${error}`);
  }

  return response;
}

/**
 * Parse SSE stream from Kimi AI
 */
export async function* parseKimiStream(
  response: Response
): AsyncGenerator<string, void, unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6)) as KimiStreamChunk;
          const content = json.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

/**
 * Non-streaming chat completion
 */
export async function chatWithKimiSync(
  messages: KimiMessage[],
  options: Omit<Parameters<typeof chatWithKimi>[1], 'stream'> = {}
): Promise<string> {
  const response = await chatWithKimi(messages, { ...options, stream: false });
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
