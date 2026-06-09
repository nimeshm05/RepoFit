# MP2 Competency Claims

## C1 — Vibecoding and Rapid Prototyping

I used Cursor to build RepoFit, a Next.js app that recommends open-source GitHub repos from a conversational flow. The first generated version kept separate onboarding and recommendation routes plus unused create-next-app boilerplate. I iterated across multiple commits — chat UI makeover, Figma-aligned header tabs, voice mode, and a unified single-page flow. Cursor scaffolded React components and Tailwind layout well; I redirected it when it proposed a 50-repo catalog that caused slow matchmaking and when it revived files I had already removed. The app runs at `http://localhost:3000` after `npm install`, `.env.local`, and `npm run fetch-repos`.

## C2 — Code Literacy and Documentation

I documented RepoFit so a collaborator could run it without reading every file. `README.md` explains folder structure, setup order, environment variables, and troubleshooting. `reflection.md` covers what I built, key decisions, and what I would change. `docs/` holds elicitation and matchmaking specs that also drive AI system prompts. Commits describe intent, not just "update" — e.g. `feature: matching-making engine - completed feature request` and `bug: fixed file naming convention`. I reorganized routes and `lib/` folders after Cursor-generated names no longer matched the product flow.

## C4 — APIs and Data Acquisition

I pull structured data from two APIs. `scripts/fetch-matchmaking-repos.ts` calls the GitHub REST API with `good-first-issues:>=3 is:public archived:false stars:>50`, fetches metadata and full READMEs, and writes `logs/matchmaking-repos.json`. `lib/github/client.ts` uses an optional `GITHUB_TOKEN` for higher rate limits. OpenAI powers elicitation and ranking through `/api/preference-elicitation` and `/api/matchmaking`. Keys live in `.env.local`, excluded by `.gitignore`. I cached repos locally so matchmaking stays repeatable instead of calling GitHub on every request.

## C7 — Critical Evaluation and Professional Judgment

I do not ship AI output without checking it against product needs. Cursor's initial matchmaking plan sent 50 full READMEs in one prompt — I cut the catalog to 10 after slow responses and generic rankings. I added strict JSON validation in `parseModelResponse()` so the API rejects wrong ranks, missing tradeoffs, or repos outside the catalog. I would not show a recommendation without verified `fullName` matches in `mergeRecommendations()`. When Cursor generated voice code that referenced a hook before declaration, I caught the runtime error and fixed the hook order myself.

## C8 — Building and Deploying a Complete Tool

RepoFit is my MP2: an HCD tool for early-career developers seeking contribution-ready open-source projects. Users complete adaptive chat or voice elicitation, then receive three ranked repos with "Why this match" explanations. The project is published at [https://github.com/nimeshm05/RepoFit](https://github.com/nimeshm05/RepoFit) with setup steps in `README.md` and process reflection in `reflection.md`. The biggest problem was fragile scope — separate routes and a large catalog broke the flow. I consolidated everything onto `/` and pre-fetched a smaller dataset. Next I would add retrieval-before-ranking so recommendations scale beyond ten repos. I am also planning on deploying and hosting this on Vercel once I figure out how to manage and handle custom API keys.