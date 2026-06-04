"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MAX_RECORDING_MS,
  VOICE_LEVEL_CHECK_MS,
  VOICE_MIN_SPEECH_MS,
  VOICE_SILENCE_DURATION_MS,
  VOICE_SILENCE_THRESHOLD,
} from "@/lib/audio/constants";
import { getAudioLevel } from "@/lib/audio/get-audio-level";
import { getRecorderMimeType } from "@/lib/audio/get-recorder-mime-type";
import { normalizeAudioMimeType } from "@/lib/audio/normalize-audio-mime";

export type VoiceTurnPhase = "idle" | "recording";

type UseVoiceTurnRecorderOptions = {
  onComplete: (blob: Blob, mimeType: string) => void;
};

type UseVoiceTurnRecorderResult = {
  phase: VoiceTurnPhase;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  cancelListening: () => void;
};

export function useVoiceTurnRecorder({
  onComplete,
}: UseVoiceTurnRecorderOptions): UseVoiceTurnRecorderResult {
  const [phase, setPhase] = useState<VoiceTurnPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const onCompleteRef = useRef(onComplete);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartedAtRef = useRef(0);
  const hasDetectedSpeechRef = useRef(false);
  const silenceStartedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearLevelCheck = useCallback(() => {
    if (levelCheckTimerRef.current) {
      clearInterval(levelCheckTimerRef.current);
      levelCheckTimerRef.current = null;
    }
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const closeAudioContext = useCallback(() => {
    analyserRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") {
      void context.close();
    }
  }, []);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const cancelListening = useCallback(() => {
    sessionIdRef.current += 1;
    clearLevelCheck();
    clearMaxDurationTimer();
    closeAudioContext();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    hasDetectedSpeechRef.current = false;
    silenceStartedAtRef.current = null;
    stopStreamTracks();
    setPhase("idle");
  }, [clearLevelCheck, clearMaxDurationTimer, closeAudioContext, stopStreamTracks]);

  const stopListening = useCallback(() => {
    clearLevelCheck();
    clearMaxDurationTimer();
    closeAudioContext();

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }
    recorder.stop();
  }, [clearLevelCheck, clearMaxDurationTimer, closeAudioContext]);

  const startSilenceMonitoring = useCallback(
    (sessionId: number) => {
      const analyser = analyserRef.current;
      if (!analyser) {
        return;
      }

      clearLevelCheck();
      levelCheckTimerRef.current = setInterval(() => {
        if (sessionId !== sessionIdRef.current) {
          return;
        }

        const level = getAudioLevel(analyser);
        const elapsed = Date.now() - recordingStartedAtRef.current;

        if (level >= VOICE_SILENCE_THRESHOLD) {
          hasDetectedSpeechRef.current = true;
          silenceStartedAtRef.current = null;
          return;
        }

        if (!hasDetectedSpeechRef.current || elapsed < VOICE_MIN_SPEECH_MS) {
          return;
        }

        if (silenceStartedAtRef.current === null) {
          silenceStartedAtRef.current = Date.now();
          return;
        }

        if (Date.now() - silenceStartedAtRef.current >= VOICE_SILENCE_DURATION_MS) {
          stopListening();
        }
      }, VOICE_LEVEL_CHECK_MS);
    },
    [clearLevelCheck, stopListening],
  );

  const startListening = useCallback(async () => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      setError("Microphone is not supported in this browser.");
      return;
    }

    const mimeType = getRecorderMimeType();
    if (!mimeType) {
      setIsSupported(false);
      setError("Audio recording is not supported in this browser.");
      return;
    }

    cancelListening();
    const sessionId = sessionIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sessionId !== sessionIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];
      hasDetectedSpeechRef.current = false;
      silenceStartedAtRef.current = null;
      recordingStartedAtRef.current = Date.now();

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      const normalizedMimeType = normalizeAudioMimeType(recorder.mimeType || mimeType);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        if (sessionId !== sessionIdRef.current) {
          return;
        }
        setError("Recording failed. Please try again.");
        cancelListening();
      };

      recorder.onstop = () => {
        if (sessionId !== sessionIdRef.current) {
          return;
        }

        stopStreamTracks();
        mediaRecorderRef.current = null;

        const blob = new Blob(chunksRef.current, { type: normalizedMimeType });
        chunksRef.current = [];
        setPhase("idle");

        if (blob.size === 0) {
          setError("No audio captured. Listening again…");
          return;
        }

        onCompleteRef.current(blob, normalizedMimeType);
      };

      recorder.start();
      setPhase("recording");
      startSilenceMonitoring(sessionId);

      maxDurationTimerRef.current = setTimeout(() => {
        if (sessionId === sessionIdRef.current) {
          stopListening();
        }
      }, MAX_RECORDING_MS);
    } catch {
      if (sessionId !== sessionIdRef.current) {
        return;
      }
      stopStreamTracks();
      closeAudioContext();
      setError("Microphone permission denied or unavailable.");
      setPhase("idle");
    }
  }, [
    cancelListening,
    closeAudioContext,
    startSilenceMonitoring,
    stopListening,
    stopStreamTracks,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsSupported(
      Boolean(navigator.mediaDevices?.getUserMedia) &&
        Boolean(getRecorderMimeType()),
    );

    return () => {
      cancelListening();
    };
  }, [cancelListening]);

  return {
    phase,
    error,
    isSupported,
    startListening,
    cancelListening,
  };
}
