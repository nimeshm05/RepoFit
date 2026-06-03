"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  AssistantStatusRow,
  THINKING_STATUS_MESSAGE,
} from "@/app/components/chat/assistant-status-row";
import { ChatComposer } from "@/app/components/chat/chat-composer";
import { ChatHeader } from "@/app/components/chat/chat-header";
import { VoiceElicitationView } from "@/app/components/voice/voice-elicitation-view";
import type { HeaderMode } from "@/app/components/chat/header-mode-tabs";
import { ChatRecommendations } from "@/app/components/chat/chat-recommendations";
import { WhyThisMatchPanel } from "@/app/components/recommendations/why-this-match-panel";
import { PreStartHome } from "@/app/components/home/pre-start-home";
import {
  AssistantBlock,
  ConversationTurn,
} from "@/app/components/chat/chat-turn";
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

const OPENING_GREETING = "Hey developer,";

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
  const [headerMode, setHeaderMode] = useState<HeaderMode>("chat");
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasStarted =
    hasStartedOverride || session.turns.length > 0 || session.status === "complete";

  const recommendationCount =
    recommendationsState.status === "success"
      ? recommendationsState.data.recommendations.length
      : 0;

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    hasStarted,
    session.turns.length,
    session.pendingQuestion,
    isSubmittingTurn,
    turnError,
    recommendationsState.status,
    recommendationCount,
    scrollToBottom,
  ]);

  const showOpeningGreeting =
    session.turns.length === 0 &&
    session.status === "in_progress" &&
    Boolean(session.pendingQuestion);

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
    router.replace("/");
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

  const canSend =
    session.status === "in_progress" &&
    Boolean(session.pendingQuestion) &&
    inputValue.trim().length > 0 &&
    !isSubmittingTurn;

  const submitTurn = useCallback(async (answerOverride?: string) => {
    const question = session.pendingQuestion;
    if (!question) {
      return;
    }
    const answer = (answerOverride ?? inputValue).trim();
    if (!answer) {
      return;
    }

    const previousTurns = session.turns;
    const updatedTurns = [...previousTurns, { question, answer }];

    setIsSubmittingTurn(true);
    setTurnError(null);
    setInputValue("");
    setHasStartedOverride(true);
    persistSession({
      status: "in_progress",
      turns: updatedTurns,
      pendingQuestion: null,
      flowKey: session.flowKey,
    });

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
        persistSession({
          status: "in_progress",
          turns: previousTurns,
          pendingQuestion: question,
          flowKey: session.flowKey,
        });
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
      persistSession({
        status: "in_progress",
        turns: previousTurns,
        pendingQuestion: question,
        flowKey: session.flowKey,
      });
    } finally {
      setIsSubmittingTurn(false);
    }
  }, [inputValue, persistSession, session]);

  const handleModeChange = useCallback(
    (mode: HeaderMode) => {
      restartSession();
      setHasStartedOverride(false);
      setInputValue("");
      setTurnError(null);
      setSelectedRepoId(null);
      setRecommendationsState({ status: "idle" });
      setHeaderMode(mode);
      router.replace("/");
    },
    [router],
  );

  const selectedRepo = useMemo(() => {
    if (recommendationsState.status !== "success" || selectedRepoId === null) {
      return null;
    }

    return (
      recommendationsState.data.recommendations.find((repo) => repo.id === selectedRepoId) ??
      null
    );
  }, [recommendationsState, selectedRepoId]);

  const voiceSpeechKey = `${session.flowKey}:${session.turns.length}:${session.pendingQuestion ?? ""}`;

  const recommendationsColumn = (
    <div className="flex h-full min-h-0 w-full max-w-chat shrink-0 flex-col overflow-hidden px-4">
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <div className="flex w-full flex-col gap-turn-gap pt-thread-top">
          <ChatRecommendations
            recommendationsState={recommendationsState}
            selectedRepoId={selectedRepoId}
            onSelectRepo={setSelectedRepoId}
          />
        </div>
      </div>
    </div>
  );

  const chatColumn = (
    <div className="flex h-full min-h-0 w-full max-w-chat shrink-0 flex-col overflow-hidden px-4">
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        {!hasStarted ? (
          <PreStartHome
            headerMode={headerMode}
            onStart={() => setHasStartedOverride(true)}
          />
        ) : (
          <div className="flex w-full flex-col gap-turn-gap pt-thread-top">
            {session.turns.map((turn, index) => (
              <ConversationTurn key={`turn-${index}`} turn={turn} />
            ))}
            {session.status === "in_progress" && session.pendingQuestion ? (
              <AssistantBlock
                content={session.pendingQuestion}
                greeting={showOpeningGreeting ? OPENING_GREETING : undefined}
                isThinking={isSubmittingTurn}
              />
            ) : null}
            {isSubmittingTurn ? (
              <AssistantStatusRow message={THINKING_STATUS_MESSAGE} />
            ) : null}
            {turnError ? <AssistantBlock content={turnError} /> : null}
            {session.status === "complete" ? (
              <ChatRecommendations
                recommendationsState={recommendationsState}
                selectedRepoId={selectedRepoId}
                onSelectRepo={setSelectedRepoId}
              />
            ) : null}
          </div>
        )}
      </div>

      {hasStarted ? (
        <div className="shrink-0 py-6">
          <ChatComposer
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => void submitTurn()}
            disabled={session.status === "complete" || isSubmittingTurn}
            canSend={canSend}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-color">
      <ChatHeader mode={headerMode} onModeChange={handleModeChange} />

      <div className="flex min-h-0 flex-1 items-stretch justify-center gap-sheet-gap">
        <div aria-hidden className="min-w-0 flex-1" />
        {!hasStarted ? (
          chatColumn
        ) : headerMode === "voice" && session.status === "complete" ? (
          recommendationsColumn
        ) : headerMode === "voice" ? (
          <VoiceElicitationView
            pendingQuestion={session.pendingQuestion}
            showOpeningGreeting={showOpeningGreeting}
            openingGreeting={OPENING_GREETING}
            isSubmittingTurn={isSubmittingTurn}
            turnError={turnError}
            speechKey={voiceSpeechKey}
            onSubmitAnswer={submitTurn}
          />
        ) : (
          chatColumn
        )}
        {selectedRepo ? (
          <>
            <button
              type="button"
              aria-label="Close details panel"
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setSelectedRepoId(null)}
            />
            <div className="max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 lg:relative lg:flex">
              <WhyThisMatchPanel
                repo={selectedRepo}
                onClose={() => setSelectedRepoId(null)}
              />
            </div>
          </>
        ) : (
          <div aria-hidden className="min-w-0 flex-1 max-lg:hidden" />
        )}
      </div>
    </div>
  );
}

export { PreferenceElicitationFlow as ChatFlow };
