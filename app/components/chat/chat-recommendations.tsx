import { BotAvatar } from "@/app/components/chat/bot-avatar";
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
};

export function ChatRecommendations({ recommendationsState }: ChatRecommendationsProps) {
  if (recommendationsState.status === "loading") {
    return (
      <AssistantBlock content="Great, I have everything I need. I’m finding repository matches for you now..." />
    );
  }

  if (recommendationsState.status === "error") {
    return <AssistantBlock content={recommendationsState.message} />;
  }

  if (recommendationsState.status !== "success") {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-assistant-block">
      <BotAvatar />
      <div className="flex w-full flex-col gap-in-turn">
        <p className="w-full break-words text-sm leading-5 text-neutral-900">
          Here’s a list of repositories that I think you might like:
        </p>
        <div className="flex w-full flex-col gap-in-turn">
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
                className="border-none bg-transparent p-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
