"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AgentSpeechPhase = "idle" | "loading" | "speaking";

type UseAgentSpeechOptions = {
  /** Full text for TTS (e.g. greeting + question) */
  speechText: string | null;
  enabled: boolean;
  /** Changes when session restarts so stale audio is not played */
  speechKey: string;
};

type UseAgentSpeechResult = {
  phase: AgentSpeechPhase;
  isSpeaking: boolean;
  error: string | null;
  stop: () => void;
};

export function useAgentSpeech({
  speechText,
  enabled,
  speechKey,
}: UseAgentSpeechOptions): UseAgentSpeechResult {
  const [phase, setPhase] = useState<AgentSpeechPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    }
    revokeObjectUrl();
    setPhase("idle");
  }, [revokeObjectUrl]);

  useEffect(() => {
    if (!enabled || !speechText?.trim()) {
      stop();
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    async function playSpeech() {
      setError(null);
      setPhase("loading");

      try {
        const response = await fetch("/api/audio/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: speechText }),
        });

        if (!response.ok) {
          const data: unknown = await response.json().catch(() => null);
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Could not play agent voice.";
          throw new Error(message);
        }

        const blob = await response.blob();
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        revokeObjectUrl();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          if (requestId === requestIdRef.current) {
            stop();
          }
        };

        audio.onerror = () => {
          if (requestId === requestIdRef.current) {
            setError("Could not play agent voice.");
            stop();
          }
        };

        setPhase("speaking");
        await audio.play();
      } catch (playError) {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        const message =
          playError instanceof Error ? playError.message : "Could not play agent voice.";
        setError(message);
        stop();
      }
    }

    void playSpeech();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, speechKey, speechText, revokeObjectUrl, stop]);

  return {
    phase,
    isSpeaking: phase === "loading" || phase === "speaking",
    error,
    stop,
  };
}
