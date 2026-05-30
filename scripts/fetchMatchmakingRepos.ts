import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getBeginnerFriendlyRepos } from "../lib/github/getBeginnerFriendlyRepos";
import { MATCHMAKING_REPO_COUNT } from "../lib/matchmaking/constants";
import type { RepoSummary } from "../lib/github/types";

const LOG_DIR = path.join(process.cwd(), "logs");
const OUTPUT_FILE = path.join(LOG_DIR, "matchmaking-repos.json");

interface MatchmakingRepoDataset {
  timestamp: string;
  repoCount: number;
  repos: RepoSummary[];
}

async function main(): Promise<void> {
  console.log(
    `Fetching ${MATCHMAKING_REPO_COUNT} beginner-friendly repos with full READMEs…`,
  );

  const repos = await getBeginnerFriendlyRepos(MATCHMAKING_REPO_COUNT);

  const payload: MatchmakingRepoDataset = {
    timestamp: new Date().toISOString(),
    repoCount: repos.length,
    repos,
  };

  await mkdir(LOG_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf-8");

  const withReadme = repos.filter((repo) => repo.readme !== null).length;

  console.log(`Saved ${repos.length} repos to ${OUTPUT_FILE}`);
  console.log(`${withReadme} repos include full README content`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to fetch matchmaking repos:", message);
  process.exit(1);
});
