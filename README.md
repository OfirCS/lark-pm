# Lark

AI-powered PM assistant that automatically turns customer feedback into actionable tickets.

**🔗 Live demo:** https://ofircs.github.io/lark-pm/

> The live link is a fully self-contained, public **demo build** — no login, no
> API keys, no backend. The "agentic" AI (the *Ask Lark* assistant, the Magic
> Pipeline, the Intelligence Hub) is driven by a realistic, scripted simulation
> that runs entirely in the browser, so the whole product is explorable and
> nothing sensitive is ever exposed. See [Demo mode](#demo-mode) below.

## What it does

Lark monitors your customer feedback sources (Reddit, Twitter/X), uses AI to classify and prioritize issues, drafts tickets, and sends them to your PM tools (Linear, Jira) after your approval.

```
Reddit/Twitter → AI Classification → Draft Tickets → Review Queue → Linear/Jira
```

## Agentic showcase

Open the dashboard and click **Ask Lark** (bottom-right, or ⌘K). The assistant
runs a transparent, multi-stage agent loop you can watch live:

```
🧠 Think  →  🔎 Search 4 sources  →  📚 Cite sources  →  📊 Score impact  →  ✍️ Answer  →  ⚡ Suggested actions
```

Every stage streams in as its own bubble — thinking steps, per-platform search
progress, ranked source cards, a revenue/role impact analysis, a streamed
recommendation, and follow-up action chips.

## Demo mode

The public build sets `NEXT_PUBLIC_DEMO_MODE=true`. A small client-side
interceptor (`src/lib/demo/`) answers every `/api/*` call with scripted,
realistic data — including simulated server-sent-event streams — so the app is
fully interactive offline and **secret-free**. To run the real backend instead
(e.g. on Vercel with your own keys), build with `NEXT_PUBLIC_DEMO_MODE=false`;
the interceptor disables itself and the real API routes (preserved in
`archive/api-routes/`) take over.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

The public demo needs **none** of these. They are only for the real backend
(see [Demo mode](#demo-mode)). Never commit real secrets — `.env*` is gitignored.

```env
# Optional - turn the scripted demo off to use real API routes
NEXT_PUBLIC_DEMO_MODE=false

# Required for the real backend (server-side only, never sent to the browser)
OPENAI_API_KEY=sk-...

# Optional - Twitter/X integration
TWITTER_BEARER_TOKEN=...

# Optional - Ticket destinations
LINEAR_API_KEY=...
JIRA_API_TOKEN=...
JIRA_EMAIL=...
JIRA_DOMAIN=...
```

## Deployment

Pushing to `main` (or the active feature branch) runs
`.github/workflows/deploy.yml`, which builds a static export (`next export` →
`out/`) and publishes it to **GitHub Pages**. One-time setup: in the repo,
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Features

- **Multi-source ingestion** - Pull feedback from Reddit, Twitter/X
- **AI classification** - Categorize as bug, feature request, complaint, etc.
- **Smart prioritization** - Urgent/high/medium/low based on sentiment and keywords
- **Ticket drafting** - AI generates title, description, and labels
- **Review queue** - Approve, edit, or reject before sending
- **PM integrations** - Push approved tickets to Linear or Jira

## Stack

- Next.js 16 (App Router, static export)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animation)
- OpenAI GPT-4o-mini (classification + drafting, in the real backend)

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Landing page (interactive agentic demos)
│   ├── dashboard/          # Home chat, Intelligence, Review, Digest, Pipeline, Automation
│   ├── onboarding/         # Product setup flow
│   └── settings/           # Integrations
├── components/
│   └── agent/              # "Ask Lark" agent panel (thinking / search / impact)
├── lib/
│   ├── demo/               # Demo-mode: fetch interceptor + scripted mock data
│   ├── pipeline/           # classifier · drafter · clusterer · normalizer
│   ├── sources/            # Data source integrations
│   └── stores/             # Zustand stores
└── types/                  # Type definitions

archive/                    # Real backend (API routes, auth, middleware) —
                            # excluded from the static demo build, kept for reference
```

## License

MIT
