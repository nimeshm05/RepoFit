"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { QuestionStep } from "@/app/components/preference-elicitation/QuestionStep";
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
} from "@/lib/preference-elicitation/types";

type ActiveQuestionFlowProps = {
  session: ElicitationSession;
  onSessionChange: (session: ElicitationSession) => void;
  onComplete: () => void;
};

function ActiveQuestionFlow({
  session,
  onSessionChange,
  onComplete,
}: ActiveQuestionFlowProps) {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!session.pendingQuestion) {
      return;
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      return;
    }

    const updatedTurns = [
      ...session.turns,
      { question: session.pendingQuestion, answer: trimmedAnswer },
    ];

    setIsLoading(true);
    setError(null);

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
        setError(message);
        return;
      }

      const result = data as ElicitationResponse;

      if (result.status === "complete") {
        onSessionChange({
          status: "complete",
          turns: updatedTurns,
          pendingQuestion: null,
          profile: result.profile,
          flowKey: session.flowKey,
        });
        onComplete();
        return;
      }

      onSessionChange({
        status: "in_progress",
        turns: updatedTurns,
        pendingQuestion: result.question,
        flowKey: session.flowKey,
      });
      setAnswer("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session.pendingQuestion) {
    return null;
  }

  return (
    <QuestionStep
      question={session.pendingQuestion}
      answer={answer}
      onAnswerChange={setAnswer}
      onContinue={handleContinue}
      isLoading={isLoading}
      error={error}
    />
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

  useEffect(() => {
    if (searchParams.get("restart") !== "1") {
      return;
    }

    restartSession();
    router.replace("/preference-elicitation");
  }, [searchParams, router]);

  useEffect(() => {
    if (searchParams.get("restart") === "1") {
      return;
    }

    if (session.status === "complete") {
      router.replace("/recommendations");
    }
  }, [router, searchParams, session.status]);

  const persistSession = useCallback((next: ElicitationSession) => {
    saveSession(next);
  }, []);

  const handleComplete = useCallback(() => {
    router.push("/recommendations");
  }, [router]);

  if (session.status === "complete") {
    return null;
  }

  return (
    <ActiveQuestionFlow
      key={session.flowKey}
      session={session}
      onSessionChange={persistSession}
      onComplete={handleComplete}
    />
  );
}
