import OpenAI from "openai";

import type { RepoSummary } from "@/lib/github/types";
import { DEFAULT_OPENAI_MODEL } from "@/lib/preferences/constants";
import type { ElicitationTurn } from "@/lib/preferences/types";

import { buildMatchmakingSystemPrompt } from "./buildSystemPrompt";
import { loadRepoDataset } from "./loadRepoDataset";
import type {
  MatchmakingResult,
  RecommendedRepo,
  RepositoryRecommendation,
} from "./types";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

function buildConversationMessages(turns: ElicitationTurn[]) {
  return turns.flatMap((turn) => [
    { role: "assistant" as const, content: turn.question },
    { role: "user" as const, content: turn.answer },
  ]);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function isValidRank(value: unknown): value is 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3;
}

function isRepositoryRecommendation(value: unknown): value is RepositoryRecommendation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isValidRank(record.rank) &&
    typeof record.fullName === "string" &&
    record.fullName.trim().length > 0 &&
    typeof record.url === "string" &&
    record.url.trim().length > 0 &&
    typeof record.whyThisMatches === "string" &&
    record.whyThisMatches.trim().length > 0 &&
    isNonEmptyStringArray(record.matchHighlights) &&
    isNonEmptyStringArray(record.tradeoffs)
  );
}

function parseModelResponse(raw: string): RepositoryRecommendation[] {
  const parsed: unknown = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Model response is not an object");
  }

  const record = parsed as Record<string, unknown>;

  if (!Array.isArray(record.recommendations) || record.recommendations.length !== 3) {
    throw new Error("Model must return exactly 3 recommendations");
  }

  if (!record.recommendations.every(isRepositoryRecommendation)) {
    throw new Error("Model response has invalid recommendation shape");
  }

  const ranks = record.recommendations.map((item) => item.rank);
  const uniqueRanks = new Set(ranks);

  if (uniqueRanks.size !== 3 || !ranks.every(isValidRank)) {
    throw new Error("Model recommendations must have ranks 1, 2, and 3");
  }

  return record.recommendations;
}

function mergeRecommendations(
  aiRecommendations: RepositoryRecommendation[],
  repos: RepoSummary[],
): RecommendedRepo[] {
  const repoByName = new Map(repos.map((repo) => [repo.fullName, repo]));

  const merged = aiRecommendations.map((recommendation) => {
    const repo = repoByName.get(recommendation.fullName);

    if (!repo) {
      throw new Error(
        `Model recommended unknown repository: ${recommendation.fullName}`,
      );
    }

    return {
      ...repo,
      recommendation,
    };
  });

  return merged.sort((a, b) => a.recommendation.rank - b.recommendation.rank);
}

export async function runMatchmaking(
  turns: ElicitationTurn[],
): Promise<MatchmakingResult> {
  const repos = await loadRepoDataset();
  const systemPrompt = await buildMatchmakingSystemPrompt();
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationMessages(turns),
      {
        role: "user",
        content: `Here is the repository catalog to evaluate. Recommend exactly 3 repositories from this list only:\n\n${JSON.stringify(repos)}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Model returned no content");
  }

  const aiRecommendations = parseModelResponse(content);
  const recommendations = mergeRecommendations(aiRecommendations, repos);

  return { recommendations };
}
