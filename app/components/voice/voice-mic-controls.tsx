"use client";

import { Check, Mic, RotateCcw, Square } from "lucide-react";

import { cn } from "@/lib/cn";
import type { RecorderPhase } from "@/lib/audio/use-media-recorder";

type VoiceMicControlsProps = {
  phase: RecorderPhase;
  micEnabled: boolean;
  isTranscribing: boolean;
  statusMessage: string;
  recorderError: string | null;
  onMicPress: () => void;
  onAccept: () => void;
  onRetry: () => void;
};

export function VoiceMicControls({
  phase,
  micEnabled,
  isTranscribing,
  statusMessage,
  recorderError,
  onMicPress,
  onAccept,
  onRetry,
}: VoiceMicControlsProps) {
  const showReview = phase === "review";
  const isRecording = phase === "recording";
  const micDisabled = !micEnabled || isTranscribing;

  return (
    <div className="flex w-full max-w-chat flex-col items-center gap-4">
      <p
        className="min-h-[20px] text-center text-sm leading-assistant text-neutral-500"
        aria-live="polite"
      >
        {recorderError ?? statusMessage}
      </p>

      {showReview ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Retry recording"
            className="inline-flex size-icon-button items-center justify-center rounded-icon-button bg-button-secondary-default-bg-color text-button-secondary-default-text-color"
            onClick={onRetry}
            disabled={isTranscribing}
          >
            <RotateCcw className="size-icon-button-icon" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Send recording"
            className="inline-flex size-icon-button items-center justify-center rounded-icon-button bg-button-primary-default-bg-color text-button-primary-default-text-color disabled:bg-button-disabled-bg-color"
            onClick={onAccept}
            disabled={isTranscribing}
          >
            <Check className="size-icon-button-icon" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "inline-flex size-12 items-center justify-center rounded-icon-button",
            "bg-button-primary-default-bg-color text-button-primary-default-text-color",
            "disabled:cursor-not-allowed disabled:bg-button-disabled-bg-color",
            isRecording && "ring-2 ring-accent-blue-foreground ring-offset-2",
          )}
          onClick={onMicPress}
          disabled={micDisabled && !isRecording}
        >
          {isRecording ? (
            <Square className="size-5 fill-current" aria-hidden />
          ) : (
            <Mic className="size-5" aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}
