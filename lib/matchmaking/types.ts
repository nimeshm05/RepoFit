import type { RepoSummary } from "@/lib/github/types";

export type RepositoryRecommendation = {
  rank: 1 | 2 | 3;
  fullName: string;
  url: string;
  whyThisMatches: string;
  matchHighlights: string[];
  tradeoffs: string[];
};

export type RecommendedRepo = RepoSummary & {
  recommendation: RepositoryRecommendation;
};

export type MatchmakingResult = {
  recommendations: RecommendedRepo[];
};

export type MatchmakingRequest = {
  turns: Array<{ question: string; answer: string }>;
};
