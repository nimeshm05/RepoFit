import { readFile } from "node:fs/promises";
import path from "node:path";

import type { RepoSummary } from "@/lib/github/types";

const DATASET_FILE = path.join(process.cwd(), "logs", "matchmaking-repos.json");

export class MatchmakingDatasetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MatchmakingDatasetError";
  }
}

interface MatchmakingRepoDataset {
  timestamp: string;
  repoCount: number;
  repos: RepoSummary[];
}

function isRepoSummary(value: unknown): value is RepoSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const repo = value as Record<string, unknown>;

  return (
    typeof repo.id === "number" &&
    typeof repo.fullName === "string" &&
    typeof repo.url === "string" &&
    Array.isArray(repo.categories)
  );
}

function isMatchmakingRepoDataset(value: unknown): value is MatchmakingRepoDataset {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const dataset = value as Record<string, unknown>;

  return (
    typeof dataset.timestamp === "string" &&
    typeof dataset.repoCount === "number" &&
    Array.isArray(dataset.repos) &&
    dataset.repos.every(isRepoSummary)
  );
}

export async function loadRepoDataset(): Promise<RepoSummary[]> {
  let raw: string;

  try {
    raw = await readFile(DATASET_FILE, "utf-8");
  } catch {
    throw new MatchmakingDatasetError(
      "Matchmaking dataset not found. Run `npm run fetch-repos` first.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new MatchmakingDatasetError(
      "Matchmaking dataset is invalid JSON. Run `npm run fetch-repos` to regenerate it.",
    );
  }

  if (!isMatchmakingRepoDataset(parsed) || parsed.repos.length === 0) {
    throw new MatchmakingDatasetError(
      "Matchmaking dataset is malformed or empty. Run `npm run fetch-repos` to regenerate it.",
    );
  }

  return parsed.repos;
}
