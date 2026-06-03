This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

Create a `.env.local` file in the project root:

```bash
# Required for preference elicitation and matchmaking (OpenAI)
OPENAI_API_KEY=sk-...

# Optional — defaults to gpt-5.4-nano
OPENAI_MODEL=gpt-5.4-nano

# Optional — voice mode (defaults: gpt-4o-mini-transcribe, tts-1, nova)
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova

# Optional — higher GitHub API rate limits (recommended for fetch-repos)
GITHUB_TOKEN=
```

## Matchmaking dataset

Before using repository recommendations, generate the local matchmaking dataset:

```bash
npm run fetch-repos
```

This fetches 10 beginner-friendly repositories with full README content from the GitHub API and writes them to `logs/matchmaking-repos.json`. The matchmaking API reads this file at runtime.

Run this again whenever you want to refresh the repository catalog. The file is gitignored under `/logs/`.

For a live GitHub catalog (dev only), visit `/dev/repos`. Legacy URLs `/onboarding` and `/repos` redirect to the new routes.

## Preference elicitation and recommendations

1. Start the dev server: `npm run dev`
2. Click **Get Started** on the home page to begin preference elicitation at `/preference-elicitation`
3. After completing the conversational flow, you are redirected to `/recommendations`
4. Matchmaking runs on every visit to `/recommendations` using your stored conversation

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
