"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VoiceHeroAvatar } from "@/app/components/voice/voice-hero-avatar";
import { VoiceStatus } from "@/app/components/voice/voice-status";
import { AssistantStatusRow, THINKING_STATUS_MESSAGE } from "@/app/components/chat/assistant-status-row";
import { buildAgentSpeechText } from "@/lib/audio/build-agent-speech-text";
import { filenameForAudioMime, normalizeAudioMimeType } from "@/lib/audio/normalize-audio-mime";
import { useAgentSpeech } from "@/lib/audio/use-agent-speech";
import { useVoiceTurnRecorder } from "@/lib/audio/use-voice-turn-recorder";

type VoiceElicitationViewProps = {
  pendingQuestion: string | null;
  showOpeningGreeting: boolean;
  openingGreeting: string;
  isSubmittingTurn: boolean;
  turnError: string | null;
  speechKey: string;
  onSubmitAnswer: (answer: string) => Promise<void>;
};

export function VoiceElicitationView({
  pendingQuestion,
  showOpeningGreeting,
  openingGreeting,
  isSubmittingTurn,
  turnError,
  speechKey,
  onSubmitAnswer,
}: VoiceElicitationViewProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const emptyRetryCountRef = useRef(0);

  const speechText = useMemo(() => {
    if (!pendingQuestion) {
      return null;
    }

    return buildAgentSpeechText(pendingQuestion, {
      greeting: showOpeningGreeting ? openingGreeting : undefined,
    });
  }, [openingGreeting, pendingQuestion, showOpeningGreeting]);

  const canListen =
    Boolean(pendingQuestion) && !isSubmittingTurn && !isTranscribing;

  const startListeningRef = useRef<() => Promise<void>>(async () => {});

  const scheduleRetryListening = useCallback((message: string) => {
    setLocalError(message);
    window.setTimeout(() => {
      setLocalError(null);
      void startListeningRef.current();
    }, 800);
  }, []);

  const transcribeAndSubmit = useCallback(
    async (blob: Blob, mimeType: string) => {
      setLocalError(null);
      setIsTranscribing(true);

      try {
        const normalizedMimeType = normalizeAudioMimeType(mimeType, "answer.m4a");
        const uploadName = filenameForAudioMime(normalizedMimeType).replace(
          "recording.",
          "answer.",
        );
        const file = new File([blob], uploadName, { type: normalizedMimeType });
        const formData = new FormData();
        formData.append("audio", file);

        const response = await fetch("/api/audio/transcribe", {
          method: "POST",
          body: formData,
        });

        const data: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Transcription failed.";
          scheduleRetryListening(`${message} Listening again…`);
          return;
        }

        const text =
          typeof data === "object" &&
          data !== null &&
          "text" in data &&
          typeof (data as { text: unknown }).text === "string"
            ? (data as { text: string }).text.trim()
            : "";

        if (!text) {
          if (emptyRetryCountRef.current < 1) {
            emptyRetryCountRef.current += 1;
            scheduleRetryListening("Didn't catch that — listening again…");
            return;
          }
          emptyRetryCountRef.current = 0;
          scheduleRetryListening("Couldn't understand your answer. Listening again…");
          return;
        }

        emptyRetryCountRef.current = 0;
        await onSubmitAnswer(text);
      } catch {
        scheduleRetryListening("Transcription failed. Listening again…");
      } finally {
        setIsTranscribing(false);
      }
    },
    [onSubmitAnswer, scheduleRetryListening],
  );

  const voiceTurn = useVoiceTurnRecorder({
    onComplete: (blob, mimeType) => {
      void transcribeAndSubmit(blob, mimeType);
    },
  });

  useEffect(() => {
    startListeningRef.current = voiceTurn.startListening;
  }, [voiceTurn.startListening]);

  const canListenRef = useRef(canListen);
  useEffect(() => {
    canListenRef.current = canListen;
  }, [canListen]);

  const handleSpeechEnded = useCallback(() => {
    if (!canListenRef.current) {
      return;
    }
    void startListeningRef.current();
  }, []);

  const agentSpeech = useAgentSpeech({
    speechText,
    enabled: Boolean(pendingQuestion) && !isSubmittingTurn,
    speechKey: `${speechKey}:${speechText ?? ""}`,
    onSpeechEnded: handleSpeechEnded,
  });

  useEffect(() => {
    if (isSubmittingTurn || isTranscribing || agentSpeech.isSpeaking) {
      voiceTurn.cancelListening();
    }
  }, [
    agentSpeech.isSpeaking,
    isSubmittingTurn,
    isTranscribing,
    voiceTurn.cancelListening,
  ]);

  useEffect(() => {
    if (!voiceTurn.error?.includes("Listening again")) {
      return;
    }

    const timer = window.setTimeout(() => {
      void startListeningRef.current();
    }, 800);

    return () => window.clearTimeout(timer);
  }, [voiceTurn.error]);

  const statusMessage = useMemo(() => {
    if (isTranscribing) {
      return "Processing your answer…";
    }
    if (isSubmittingTurn) {
      return THINKING_STATUS_MESSAGE;
    }
    if (agentSpeech.phase === "loading") {
      return "Loading voice…";
    }
    if (agentSpeech.isSpeaking) {
      return "Listening to the assistant…";
    }
    if (voiceTurn.phase === "recording") {
      return "Go ahead — I'm listening.";
    }
    if (!voiceTurn.isSupported) {
      return "Microphone is not available in this browser.";
    }
    return "The assistant will listen when it finishes speaking.";
  }, [
    agentSpeech.isSpeaking,
    agentSpeech.phase,
    isSubmittingTurn,
    isTranscribing,
    voiceTurn.isSupported,
    voiceTurn.phase,
  ]);

  const displayError =
    localError ?? voiceTurn.error ?? agentSpeech.error ?? turnError ?? null;

  const isListening = voiceTurn.phase === "recording";

  return (
    <div className="flex h-full min-h-0 w-full max-w-chat shrink-0 flex-col px-4">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10">
        <VoiceHeroAvatar
          isActive={agentSpeech.isSpeaking || isListening}
          isThinking={isSubmittingTurn || isTranscribing}
        />

        {isSubmittingTurn ? (
          <div className="sr-only">
            <AssistantStatusRow message={THINKING_STATUS_MESSAGE} />
          </div>
        ) : null}

        <VoiceStatus message={statusMessage} error={displayError} />
      </div>
    </div>
  );
}
