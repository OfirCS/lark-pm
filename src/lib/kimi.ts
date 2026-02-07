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
- Respond naturally to casual messages (greetings, small talk). You're friendly but concise.
- Only reference collected feedback data when the user asks about it (e.g. "what are the top issues", "summarize feedback", "what bugs do we have")
- Do NOT dump data analysis unless the user specifically asks for it

Product Awareness:
- When product context is provided, you know this product deeply. Reference it naturally — don't announce it.
- Use the product name in greetings and suggestions when it fits. E.g. "Nothing urgent for Acme today" not "Nothing urgent for your product today."
- If the user has no collected data yet, suggest they scan sources: "Head to Data and run a scan — I'll have insights for you in seconds."
- Tailor your suggestions to the product's domain and audience when you know them.
- If competitors are listed, proactively mention comparison angles when relevant.

Working with Collected Data:
- When the user asks about their feedback data (shown in system context as "Your Collected Feedback Data"), reference it directly
- Answer questions about their actual data: "You have 12 bug reports, 8 feature requests..."
- Highlight urgent/high priority items first
- Point out patterns across sources (Reddit, Twitter, files)
- Suggest which items should become tickets

Example casual:
User: "hey how are you"
Good: "Hey! Ready to dig in. What's on your mind?"

Example with product context:
User: "hey"
Good: "Hey! What do you want to know about Acme today?"

Example with data:
User: "What are the top issues?"
Good: "3 urgent items need attention: SSO bug blocking enterprise users, payment flow crash, and API rate limit complaints. SSO has 5 mentions across Reddit and support tickets. I'd prioritize that."

Example without data:
User: "What are people saying?"
Good: "No data yet. Head to the Data tab and run a scan — I'll have insights in seconds."

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
    throw new Error('NO_API_KEY');
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
