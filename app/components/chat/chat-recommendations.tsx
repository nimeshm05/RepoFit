"use client";

import {
  AssistantStatusRow,
  MATCHMAKING_STATUS_MESSAGE,
} from "@/app/components/chat/assistant-status-row";
import { AssistantBlock } from "@/app/components/chat/chat-turn";
import { RepoCard } from "@/app/components/repositories/repo-card";
import type { MatchmakingResult } from "@/lib/matchmaking/types";

type RecommendationsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MatchmakingResult };

type ChatRecommendationsProps = {
  recommendationsState: RecommendationsState;
  selectedRepoId: number | null;
  onSelectRepo: (repoId: number) => void;
};

export function ChatRecommendations({
  recommendationsState,
  selectedRepoId,
  onSelectRepo,
}: ChatRecommendationsProps) {
  if (recommendationsState.status === "loading") {
    return <AssistantStatusRow message={MATCHMAKING_STATUS_MESSAGE} />;
  }

  if (recommendationsState.status === "error") {
    return <AssistantBlock content={recommendationsState.message} />;
  }

  if (recommendationsState.status !== "success") {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-in-turn">
      <p className="w-full break-words text-sm leading-5 text-neutral-900">
        Here’s a list of repositories that I think you might like:
      </p>
      <div className="flex w-full flex-col gap-5">
        {recommendationsState.data.recommendations.map((repo, index) => (
          <div
            key={repo.id}
            className={
              index < recommendationsState.data.recommendations.length - 1
                ? "border-b border-border pb-5"
                : undefined
            }
          >
            <RepoCard
              repo={repo}
              recommendation={repo.recommendation}
              className="w-full"
              isSelected={selectedRepoId === repo.id}
              onOpenWhy={() => onSelectRepo(repo.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
