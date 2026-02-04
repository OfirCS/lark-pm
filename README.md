# Lark

AI-powered PM assistant that automatically turns customer feedback into actionable tickets.

## What it does

Lark monitors your customer feedback sources (Reddit, Twitter/X), uses AI to classify and prioritize issues, drafts tickets, and sends them to your PM tools (Linear, Jira) after your approval.

```
Reddit/Twitter → AI Classification → Draft Tickets → Review Queue → Linear/Jira
```

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

```env
# Required
OPENAI_API_KEY=sk-...

# Optional - Twitter/X integration
TWITTER_BEARER_TOKEN=...

# Optional - Ticket destinations
LINEAR_API_KEY=...
JIRA_API_TOKEN=...
JIRA_EMAIL=...
JIRA_DOMAIN=...
```

## Features

- **Multi-source ingestion** - Pull feedback from Reddit, Twitter/X
- **AI classification** - Categorize as bug, feature request, complaint, etc.
- **Smart prioritization** - Urgent/high/medium/low based on sentiment and keywords
- **Ticket drafting** - AI generates title, description, and labels
- **Review queue** - Approve, edit, or reject before sending
- **PM integrations** - Push approved tickets to Linear or Jira

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- OpenAI GPT-4o-mini (classification + drafting)

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx        # Main dashboard with AI chat
│   │   ├── data/           # Data sources overview
│   │   └── review/         # Ticket review queue
│   └── api/
│       ├── chat/           # AI conversation endpoint
│       └── pipeline/       # Ingest, classify, draft APIs
├── lib/
│   ├── pipeline/           # Core pipeline logic
│   │   ├── classifier.ts   # AI classification
│   │   ├── drafter.ts      # AI ticket drafting
│   │   └── normalizer.ts   # Data normalization
│   ├── sources/            # Data source integrations
│   └── stores/             # Zustand stores
└── types/
    └── pipeline.ts         # Type definitions
```

## License

MIT
