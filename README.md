# ProActive – Your Contextual Suggestion Engine

A proactive list of what's worth doing *right now*, adapting to your interests and context.

## Overview

ProActive is a v1 contextual suggestion engine that continuously answers:
> "Given who you are and what's going on right now, what's the best thing you could do?"

Instead of a to-do list you manually maintain, you get a ranked feed of suggested activities that adapt to:
- **Interests** — theology, coding, startups, fitness, tricking, etc.
- **Time of day** — morning focus blocks, evening reflection, quick night tasks
- **Available time** — 5-minute quick wins to 60-minute deep work sprints
- **Energy level** — inferred from time of day (high in morning, low at night)
- **Diversity** — varied activity types, no repetitive suggestions

## Features

- 🎯 **Smart suggestion feed** — 5–10 ranked activity cards refreshed on demand
- 🧠 **Interest-based personalisation** — choose 3–7 interests during onboarding
- ⏱ **Context-aware** — suggestions sized to your available time block
- ✅ **One-tap actions** — "Do now", "Later", or "Skip" each suggestion
- 🤖 **Optional AI enrichment** — set `OPENAI_API_KEY` to get GPT-powered dynamic suggestions
- 📊 **Learning loop** — completions/skips are tracked to improve future rankings

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma 7 + libsql adapter |
| AI | OpenAI `gpt-4o-mini` (optional) |
| Testing | Jest + ts-jest |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Set up database
npx prisma migrate dev

# 4. (Optional) Add OpenAI key for AI suggestions
# Edit .env and set OPENAI_API_KEY=sk-...

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select your interests.

## Data Model

| Model | Purpose |
|---|---|
| `User` | Stores interests and preferences |
| `ActivityTemplate` | Template definitions (seeded from code) |
| `ActivityInstance` | Individual suggestions shown to a user |

## Architecture

```
src/
  app/
    onboarding/       # Interest selection (first-run)
    home/             # Main suggestion feed
    api/
      user/           # Create/read/update user
      suggestions/    # Generate and list suggestions
      activity/[id]/  # Record user actions
  lib/
    context.ts        # Context engine (time, energy, available time)
    templates.ts      # Static activity template library
    scoring.ts        # Scoring & ranking algorithm
    suggestions.ts    # Generation pipeline
    openai.ts         # Optional AI enrichment
    prisma.ts         # Database client
  components/
    SuggestionCard    # Individual activity card with actions
    InterestSelector  # Onboarding interest picker
    ContextBanner     # Shows current time/energy context
```

## Running Tests

```bash
npm test
```

35 tests cover the core context engine, template library, and scoring/ranking logic.
