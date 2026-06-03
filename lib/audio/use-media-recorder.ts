"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MAX_RECORDING_MS } from "@/lib/audio/constants";
import { getRecorderMimeType } from "@/lib/audio/get-recorder-mime-type";
import { normalizeAudioMimeType } from "@/lib/audio/normalize-audio-mime";

export type RecorderPhase = "idle" | "recording" | "review";

type UseMediaRecorderResult = {
  phase: RecorderPhase;
  recordingBlob: Blob | null;
  recordingMimeType: string;
  error: string | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  discardRecording: () => void;
};

export function useMediaRecorder(): UseMediaRecorderResult {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingMimeType, setRecordingMimeType] = useState("audio/webm");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const discardRecording = useCallback(() => {
    clearMaxDurationTimer();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecordingBlob(null);
    setPhase("idle");
    setError(null);
    stopStreamTracks();
  }, [clearMaxDurationTimer, stopStreamTracks]);

  const stopRecording = useCallback(() => {
    clearMaxDurationTimer();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }
    recorder.stop();
  }, [clearMaxDurationTimer]);

  const startRecording = useCallback(async () => {
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

    try {
      discardRecording();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      setRecordingMimeType(normalizeAudioMimeType(mimeType));

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try again.");
        discardRecording();
      };

      recorder.onstop = () => {
        clearMaxDurationTimer();
        stopStreamTracks();

        const blob = new Blob(chunksRef.current, {
          type: normalizeAudioMimeType(recorder.mimeType || mimeType),
        });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        if (blob.size === 0) {
          setError("No audio captured. Please try again.");
          setPhase("idle");
          return;
        }

        setRecordingBlob(blob);
        setPhase("review");
      };

      recorder.start();
      setPhase("recording");

      maxDurationTimerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_MS);
    } catch {
      stopStreamTracks();
      setError("Microphone permission denied or unavailable.");
      setPhase("idle");
    }
  }, [clearMaxDurationTimer, discardRecording, stopRecording, stopStreamTracks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsSupported(
      Boolean(navigator.mediaDevices?.getUserMedia) &&
        Boolean(getRecorderMimeType()),
    );

    return () => {
      discardRecording();
    };
  }, [discardRecording]);

  return {
    phase,
    recordingBlob,
    recordingMimeType,
    error,
    isSupported,
    startRecording,
    stopRecording,
    discardRecording,
  };
}
