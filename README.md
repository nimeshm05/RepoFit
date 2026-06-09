# RepoFit

RepoFit is a Next.js app that helps developers find open-source GitHub repositories that fit their skills, interests, and goals. A conversational preference-elicitation flow collects user context, then an AI matchmaking engine ranks repositories from a local dataset and explains why each one is a good fit.

## Project structure

### `app/`

Next.js App Router entry point — pages, layouts, API routes, and UI components.

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Home page; hosts the full preference-elicitation and recommendations flow |
| `app/layout.tsx` | Root layout, global styles, and site metadata |
| `app/globals.css` | Global Tailwind and design tokens |
| `app/api/` | Server-side API route handlers |
| `app/api/preference-elicitation/` | `POST` handler that runs one step of the conversational elicitation flow via OpenAI |
| `app/api/matchmaking/` | `POST` handler that ranks repositories and generates match explanations |
| `app/api/audio/transcribe/` | `POST` handler for voice input — transcribes recorded audio |
| `app/api/audio/speech/` | `POST` handler for voice output — synthesizes assistant speech |
| `app/components/` | React components used by pages and the main flow |
| `app/components/preference-elicitation/` | Orchestrates the end-to-end flow: pre-start home, chat/voice modes, and recommendations |
| `app/components/chat/` | Chat UI — header, turns, composer, status rows, and inline recommendation cards |
| `app/components/voice/` | Voice-mode UI — recording status, hero avatar, and voice elicitation view |
| `app/components/home/` | Pre-start landing content shown before the user begins elicitation |
| `app/components/recommendations/` | "Why this match" detail panels for selected repositories |
| `app/components/repositories/` | Repository card components |
| `app/components/ui/` | Shared UI primitives (Button, Card, Header, Textarea, Tooltip, etc.) |
| `app/components/motion/` | Reusable motion/animation components |
| `app/dev/repos/` | Dev-only page at `/dev/repos` for browsing the live GitHub catalog |

Legacy routes (`/onboarding`, `/preference-elicitation`, `/recommendations`, `/repos`) redirect to `/` or `/dev/repos` via `next.config.ts`.

### `lib/`

Shared application logic used by API routes, scripts, and client components.

| Path | Purpose |
| --- | --- |
| `lib/preference-elicitation/` | Elicitation types, validation, session storage, system prompts, and the step runner |
| `lib/matchmaking/` | Matchmaking types, repo dataset loading, system prompts, and the ranking engine |
| `lib/github/` | GitHub API client, repo search, README fetching, and response logging |
| `lib/openai/` | Shared OpenAI client factory |
| `lib/audio/` | Voice recording hooks, transcription, speech synthesis, and audio utilities |
| `lib/motion/` | Motion/animation helpers |
| `lib/cn.ts`, `lib/button-variants.ts`, `lib/icon-button-variants.ts` | Shared styling utilities |

### `docs/`

Design and behavior documentation that informs the AI prompts and product flow.

| File | Purpose |
| --- | --- |
| `project-goals.md` | High-level project objectives |
| `preference-elicitation-user-flow.md` | Conversational flow rules and UX behavior |
| `preference-elicitation-strategy.md` | Question strategy and information to collect |
| `matchmaking-engine.md` | Matchmaking prompt, ranking rules, and output format |
| `github-fetch-requirements.md` | Requirements for fetching the repository catalog |

### `scripts/`

One-off CLI scripts run via `npm run`.

| File | Purpose |
| --- | --- |
| `fetch-matchmaking-repos.ts` | Fetches beginner-friendly repos from GitHub and writes `logs/matchmaking-repos.json` |

### `public/`

Static assets served at the site root (icons and images).

### `logs/`

Generated runtime data. `matchmaking-repos.json` is produced by `npm run fetch-repos` and read by the matchmaking API. This directory is gitignored.

## Quick start

**Prerequisites:** Node.js 20+, npm, an [OpenAI API key](https://platform.openai.com/api-keys), and internet access.

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root with at least:

```bash
OPENAI_API_KEY=sk-...
```

3. Generate the matchmaking dataset (required for repository recommendations):

```bash
npm run fetch-repos
```

This fetches 10 beginner-friendly repositories with full README content from the GitHub API and writes them to `logs/matchmaking-repos.json`. Run it again whenever you want to refresh the catalog.

`fetch-repos` does not use `OPENAI_API_KEY`. It calls the GitHub API directly and does not load `.env.local` automatically, so pass a GitHub token on the command line if you want higher rate limits:

```bash
GITHUB_TOKEN=ghp_... npm run fetch-repos
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000), click **Get Started**, complete the conversational flow, and view recommendations in the same view.

### What works at each step

| Setup completed | What works |
| --- | --- |
| Dev server only | UI loads |
| + `OPENAI_API_KEY` | Chat and voice preference elicitation |
| + matchmaking dataset | Repository recommendations and matchmaking |
| + microphone permission | Voice mode (browser will prompt on first use) |

### Using the app

1. Open `/` and click **Get Started** (or **Chat** / **Talk** depending on mode) to begin preference elicitation
2. Answer the assistant's questions in chat or voice mode
3. After the flow completes, repository recommendations appear inline
4. Matchmaking runs automatically when elicitation is complete, using your stored conversation
5. To start over, visit `/?restart=1` or switch Chat/Voice tabs in the header

Session state is persisted in the browser via `localStorage` under the key `repofit:preference-elicitation`.

For a live GitHub catalog (dev only), visit `/dev/repos` while the dev server is running. That page reads `GITHUB_TOKEN` from `.env.local` via Next.js.

## Environment variables

Create a `.env.local` file in the project root (loaded automatically by `npm run dev`, `npm run build`, and `npm run start`):

```bash
# Required for preference elicitation, matchmaking, and voice mode
OPENAI_API_KEY=sk-...

# Optional — defaults to gpt-5.4-nano
OPENAI_MODEL=gpt-5.4-nano

# Optional — voice mode (defaults: gpt-4o-mini-transcribe, tts-1, nova)
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova

# Optional — higher GitHub API rate limits for /dev/repos (recommended)
GITHUB_TOKEN=
```

## Production

```bash
npm run build
npm run start
```

Set the same environment variables in your deployment environment. Ensure `logs/matchmaking-repos.json` exists before starting (run `npm run fetch-repos` during deploy or commit a generated copy if appropriate for your setup).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Chat or voice returns an error | Missing `OPENAI_API_KEY` | Add it to `.env.local` and restart the dev server |
| "Run `npm run fetch-repos` first" | Matchmaking dataset missing | Run `npm run fetch-repos` |
| `fetch-repos` hits rate limits | No GitHub token | Run `GITHUB_TOKEN=ghp_... npm run fetch-repos` |
| Stale or stuck session | Prior run saved in `localStorage` | Visit `/?restart=1` |
| Voice mode fails | Mic blocked or missing key | Allow microphone access; ensure `OPENAI_API_KEY` is set |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run fetch-repos` | Fetch repos and write `logs/matchmaking-repos.json` |
| `npm run lint` | Run ESLint |

The tool can be accessed here: https://repo-fit.vercel.app/

