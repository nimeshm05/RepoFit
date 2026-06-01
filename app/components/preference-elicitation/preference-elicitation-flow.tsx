"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import { RepoCard } from "@/app/components/repositories/repo-card";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  restartSession,
  saveSession,
  subscribeSession,
} from "@/lib/preference-elicitation/storage";
import type {
  ElicitationResponse,
  ElicitationSession,
  ElicitationTurn,
} from "@/lib/preference-elicitation/types";
import type { MatchmakingResult } from "@/lib/matchmaking/types";

type RecommendationsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MatchmakingResult };

type ConversationMessage =
  | { id: string; role: "assistant"; content: string }
  | { id: string; role: "user"; content: string };

function toConversation(session: ElicitationSession): ConversationMessage[] {
  const messages: ConversationMessage[] = [];

  session.turns.forEach((turn, index) => {
    messages.push({
      id: `assistant-question-${index}`,
      role: "assistant",
      content: turn.question,
    });
    messages.push({
      id: `user-answer-${index}`,
      role: "user",
      content: turn.answer,
    });
  });

  if (session.status === "in_progress" && session.pendingQuestion) {
    messages.push({
      id: `assistant-pending-${session.turns.length}`,
      role: "assistant",
      content: session.pendingQuestion,
    });
  }

  return messages;
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex w-full items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-blue-background text-xs font-semibold text-accent-blue-foreground">
        AI
      </div>
      <p className="max-w-full text-base leading-5 break-words text-accent-blue-foreground">
        {content}
      </p>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <p className="w-full text-base leading-[1.44] break-words text-neutral-800">
      {content}
    </p>
  );
}

type RecommendationsBlockProps = {
  recommendationsState: RecommendationsState;
};

function RecommendationsBlock({ recommendationsState }: RecommendationsBlockProps) {
  if (recommendationsState.status === "loading") {
    return (
      <AssistantMessage content="Great, I have everything I need. I’m finding repository matches for you now..." />
    );
  }

  if (recommendationsState.status === "error") {
    return <AssistantMessage content={recommendationsState.message} />;
  }

  if (recommendationsState.status !== "success") {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <AssistantMessage content="Here’s a list of repositories that I think you might like:" />
      <div className="flex w-full flex-col gap-5">
        {recommendationsState.data.recommendations.map((repo, index) => (
          <div
            key={repo.id}
            className={index < recommendationsState.data.recommendations.length - 1 ? "border-b border-border pb-5" : ""}
          >
            <RepoCard repo={repo} recommendation={repo.recommendation} className="border-none bg-transparent p-0" />
          </div>
        ))}
      </div>
      <p className="text-base leading-[1.44] text-neutral-500">
        You can restart anytime if you want a fresh set of matches.
      </p>
    </div>
  );
}

export function PreferenceElicitationFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [inputValue, setInputValue] = useState("");
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [recommendationsState, setRecommendationsState] =
    useState<RecommendationsState>(() =>
      session.status === "complete" ? { status: "loading" } : { status: "idle" },
    );
  const [hasStartedOverride, setHasStartedOverride] = useState(false);
  const hasStarted =
    hasStartedOverride || session.turns.length > 0 || session.status === "complete";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("restart") !== "1") {
      return;
    }

    restartSession();
    router.replace("/chat");
  }, [searchParams, router]);

  const persistSession = useCallback((next: ElicitationSession) => {
    saveSession(next);
  }, []);

  const fetchRecommendations = useCallback(async (turns: ElicitationTurn[]) => {
    try {
      const response = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Recommendations unavailable. Please try restarting.";
        setRecommendationsState({ status: "error", message });
        return;
      }

      setRecommendationsState({ status: "success", data: data as MatchmakingResult });
    } catch {
      setRecommendationsState({
        status: "error",
        message: "Recommendations unavailable. Please try restarting.",
      });
    }
  }, []);

  useEffect(() => {
    if (session.status !== "complete" || recommendationsState.status !== "loading") {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRecommendations(session.turns);
  }, [fetchRecommendations, recommendationsState.status, session.status, session.turns]);

  const conversation = useMemo(() => {
    if (!hasStarted) {
      return [];
    }
    return toConversation(session);
  }, [hasStarted, session]);

  const canSend =
    session.status === "in_progress" &&
    Boolean(session.pendingQuestion) &&
    inputValue.trim().length > 0 &&
    !isSubmittingTurn;

  const submitTurn = useCallback(async () => {
    if (!session.pendingQuestion) {
      return;
    }
    const answer = inputValue.trim();
    if (!answer) {
      return;
    }

    const updatedTurns = [
      ...session.turns,
      { question: session.pendingQuestion, answer },
    ];

    setIsSubmittingTurn(true);
    setTurnError(null);
    setInputValue("");
    setHasStartedOverride(true);

    try {
      const response = await fetch("/api/preference-elicitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: updatedTurns }),
      });

      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Something went wrong. Please try again.";
        setTurnError(message);
        setInputValue(answer);
        return;
      }

      const result = data as ElicitationResponse;
      if (result.status === "complete") {
        setRecommendationsState({ status: "loading" });
        persistSession({
          status: "complete",
          turns: updatedTurns,
          pendingQuestion: null,
          profile: result.profile,
          flowKey: session.flowKey,
        });
        return;
      }

      persistSession({
        status: "in_progress",
        turns: updatedTurns,
        pendingQuestion: result.question,
        flowKey: session.flowKey,
      });
    } catch {
      setTurnError("Something went wrong. Please try again.");
      setInputValue(answer);
    } finally {
      setIsSubmittingTurn(false);
    }
  }, [inputValue, persistSession, session]);

  const handleRestart = useCallback(() => {
    restartSession();
    setHasStartedOverride(false);
    setInputValue("");
    setTurnError(null);
    setRecommendationsState({ status: "idle" });
    router.replace("/chat");
  }, [router]);

  const onComposerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    void submitTurn();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[600px] flex-col gap-3 overflow-hidden">
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {!hasStarted ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-6 text-center">
              <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-semibold text-foreground">RepoFit</h1>
                <p className="text-2xl text-neutral-600">
                  Find open-source projects that fit you.
                </p>
              </div>
              <p className="text-base leading-[1.44] text-neutral-500">
                Tell us about your skills, interests, and goals. We&apos;ll match you
                with repositories where you can realistically contribute and grow.
              </p>
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-button-primary-default-bg-color px-3.5 py-2 text-base leading-[1.44] text-button-primary-default-text-color"
                onClick={() => setHasStartedOverride(true)}
              >
                Start
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-7 py-2">
              {conversation.map((message) =>
                message.role === "assistant" ? (
                  <AssistantMessage key={message.id} content={message.content} />
                ) : (
                  <UserMessage key={message.id} content={message.content} />
                ),
              )}
              {isSubmittingTurn ? (
                <AssistantMessage content="Thinking about your response..." />
              ) : null}
              {turnError ? (
                <AssistantMessage content={turnError} />
              ) : null}
              {session.status === "complete" ? (
                <RecommendationsBlock
                  recommendationsState={recommendationsState}
                />
              ) : null}
            </div>
          )}
        </div>

        <form
          className="flex w-full shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-bg-color py-3 pl-5 pr-3"
          onSubmit={onComposerSubmit}
        >
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={session.status === "complete" || isSubmittingTurn}
            placeholder="Type your responses..."
            className="min-w-0 flex-1 bg-transparent text-base leading-[1.44] text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center rounded-full border border-neutral-200 bg-button-secondary-default-bg-color px-3.5 py-2 text-base leading-[1.44] text-button-secondary-default-text-color"
          >
            Restart
          </button>
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send response"
            className="inline-flex size-9 items-center justify-center rounded-full bg-button-primary-default-bg-color text-button-primary-default-text-color disabled:bg-neutral-300"
          >
            <Image
              src="/icons/arrow-right.svg"
              alt=""
              width={14}
              height={14}
              className="size-3.5 rotate-[-90deg]"
              aria-hidden
            />
          </button>
        </form>
      </div>
    </div>
  );
}

export { PreferenceElicitationFlow as ChatFlow };
