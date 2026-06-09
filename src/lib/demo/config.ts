// Demo-mode configuration.
//
// Lark ships as a fully static, public showcase (GitHub Pages) with NO backend
// and NO API keys. When DEMO_MODE is on, a client-side interceptor serves
// realistic, scripted responses for every `/api/*` call so the entire product
// — including the streaming "agentic thinking" — works offline and secret-free.
//
// To run the REAL app (e.g. on Vercel with your own OPENAI_API_KEY), build with
// NEXT_PUBLIC_DEMO_MODE=false and the interceptor disables itself, letting the
// genuine API routes handle requests.

export const DEMO_MODE = (process.env.NEXT_PUBLIC_DEMO_MODE ?? 'true') !== 'false';

// Base path for GitHub Pages project sites (e.g. "/lark-pm"). Empty for local dev
// and root-domain deployments. Used for raw asset URLs that Next's basePath does
// not rewrite automatically.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (path: string): string => `${BASE_PATH}${path}`;
