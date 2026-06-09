// Client-side `fetch` interceptor for the static demo build.
//
// When DEMO_MODE is on, this transparently answers every `/api/*` request with
// realistic, scripted data — including simulated Server-Sent-Event streams for
// the agent and chat — so the whole app works with no backend and no API keys.
// It installs at module-import time so it is ready before any component effect
// fires its first request.

import { DEMO_MODE } from './config';
import {
  demoCompany,
  buildMagicResult,
  buildAnalysis,
  demoDigests,
  demoRedditPosts,
  demoWebResults,
  demoIntegrationsStatus,
  buildAgentStream,
  buildChatAnswer,
  type DemoStreamEvent,
} from './mockData';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sseFromEvents(events: DemoStreamEvent[], done = false): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const ev of events) {
        await sleep(ev.delay);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev.chunk)}\n\n`));
      }
      if (done) controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function streamText(text: string): Response {
  const words = text.split(' ');
  const events: DemoStreamEvent[] = words.map((w, i) => ({
    delay: i === 0 ? 200 : 28,
    chunk: { type: 'text', content: (i === 0 ? '' : ' ') + w },
  }));
  return sseFromEvents(events, true);
}

async function readBody(init?: RequestInit): Promise<Record<string, unknown>> {
  try {
    if (init?.body && typeof init.body === 'string') {
      return JSON.parse(init.body);
    }
  } catch {
    /* ignore */
  }
  return {};
}

async function handle(path: string, method: string, init?: RequestInit): Promise<Response> {
  // --- Streaming endpoints -------------------------------------------------
  if (path === '/api/agent') {
    const body = await readBody(init);
    const messages = (body.messages as Array<{ role: string; content: string }>) || [];
    const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return sseFromEvents(buildAgentStream(last));
  }

  if (path === '/api/chat') {
    const body = await readBody(init);
    const messages = (body.messages as Array<{ role: string; content: string }>) || [];
    const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    await sleep(350);
    return streamText(buildChatAnswer(last, body.productName as string | undefined));
  }

  // --- Company -------------------------------------------------------------
  if (path === '/api/company') {
    if (method === 'GET') {
      await sleep(120);
      return json({ success: true, data: demoCompany });
    }
    return json({ success: true });
  }

  // --- Magic pipeline ------------------------------------------------------
  if (path === '/api/pipeline/magic') {
    await sleep(1400);
    return json(buildMagicResult());
  }

  // --- Automation ----------------------------------------------------------
  if (path === '/api/automation/analyze') {
    await sleep(900);
    return json({ success: true, analysis: buildAnalysis(), parsed: { totalRows: 34 } });
  }
  if (path === '/api/automation/run') {
    await sleep(1200);
    const analysis = buildAnalysis();
    return json({
      success: true,
      result: {
        analysis,
        tickets: { created: analysis.items.slice(0, 4).map((it) => ({ id: it.id, title: it.suggestedTitle })) },
        notificationsSent: { slack: true },
      },
    });
  }

  // --- Digest --------------------------------------------------------------
  if (path === '/api/digest') {
    const body = await readBody(init);
    const audience = (body.audience as string) || 'leadership';
    await sleep(900);
    return json({ content: demoDigests[audience] ?? demoDigests.leadership });
  }

  // --- Sources -------------------------------------------------------------
  if (path === '/api/sources/reddit/search') {
    await sleep(500);
    return json({ posts: demoRedditPosts });
  }
  if (path === '/api/sources/web-search') {
    const body = await readBody(init);
    const platform = (body.platform as string) || 'twitter';
    await sleep(600);
    return json({ results: demoWebResults(platform) });
  }

  // --- Integrations --------------------------------------------------------
  if (path === '/api/integrations/status') {
    await sleep(150);
    return json(demoIntegrationsStatus);
  }

  // --- Fallbacks -----------------------------------------------------------
  if (path.startsWith('/api/feedback') || path.startsWith('/api/tickets')) {
    return json({ success: true, data: [] });
  }

  return json({ success: true, demo: true });
}

let installed = false;

export function installDemoApi(): void {
  if (installed || typeof window === 'undefined' || !DEMO_MODE) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    if (typeof input === 'string') url = input;
    else if (input instanceof URL) url = input.toString();
    else url = input.url;

    let path = url;
    try {
      path = new URL(url, window.location.origin).pathname;
    } catch {
      /* relative path already */
    }

    const method = (init?.method || (input instanceof Request ? input.method : 'GET') || 'GET').toUpperCase();

    if (path.startsWith('/api/')) {
      try {
        return await handle(path, method, init);
      } catch {
        return json({ success: false, error: 'demo handler error' }, 500);
      }
    }

    // Never let stray direct calls to external AI providers leave the browser.
    if (/api\.openai\.com|api\.moonshot|api\.anthropic\.com/.test(url)) {
      return json({ error: 'External AI calls are disabled in the public demo.' }, 200);
    }

    return originalFetch(input, init);
  };
}

// Install immediately on import (browser only).
installDemoApi();
