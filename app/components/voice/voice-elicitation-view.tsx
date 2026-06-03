"use client";

import { useCallback, useMemo, useState } from "react";

import { VoiceMicControls } from "@/app/components/voice/voice-mic-controls";
import { VoiceHeroAvatar } from "@/app/components/voice/voice-hero-avatar";
import { AssistantStatusRow, THINKING_STATUS_MESSAGE } from "@/app/components/chat/assistant-status-row";
import { buildAgentSpeechText } from "@/lib/audio/build-agent-speech-text";
import { filenameForAudioMime, normalizeAudioMimeType } from "@/lib/audio/normalize-audio-mime";
import { useAgentSpeech } from "@/lib/audio/use-agent-speech";
import { useMediaRecorder } from "@/lib/audio/use-media-recorder";

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

  const speechText = useMemo(() => {
    if (!pendingQuestion) {
      return null;
    }

    return buildAgentSpeechText(pendingQuestion, {
      greeting: showOpeningGreeting ? openingGreeting : undefined,
    });
  }, [openingGreeting, pendingQuestion, showOpeningGreeting]);

  const agentSpeech = useAgentSpeech({
    speechText,
    enabled: Boolean(pendingQuestion) && !isSubmittingTurn,
    speechKey: `${speechKey}:${speechText ?? ""}`,
  });

  const recorder = useMediaRecorder();

  const micEnabled =
    Boolean(pendingQuestion) &&
    !agentSpeech.isSpeaking &&
    !isSubmittingTurn &&
    !isTranscribing &&
    recorder.phase !== "review";

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
    if (recorder.phase === "recording") {
      return "Recording — tap the square when you are done.";
    }
    if (recorder.phase === "review") {
      return "Review your recording, then send or retry.";
    }
    if (!recorder.isSupported) {
      return "Microphone is not available in this browser.";
    }
    return "Tap the microphone to answer.";
  }, [
    agentSpeech.isSpeaking,
    agentSpeech.phase,
    isSubmittingTurn,
    isTranscribing,
    recorder.isSupported,
    recorder.phase,
  ]);

  const handleMicPress = useCallback(() => {
    setLocalError(null);
    if (recorder.phase === "recording") {
      recorder.stopRecording();
      return;
    }
    if (recorder.phase === "idle") {
      void recorder.startRecording();
    }
  }, [recorder]);

  const handleRetry = useCallback(() => {
    setLocalError(null);
    recorder.discardRecording();
  }, [recorder]);

  const handleAccept = useCallback(async () => {
    const blob = recorder.recordingBlob;
    if (!blob) {
      return;
    }

    setLocalError(null);
    setIsTranscribing(true);

    try {
      const mimeType = normalizeAudioMimeType(
        blob.type || recorder.recordingMimeType,
        "answer.m4a",
      );
      const uploadName = filenameForAudioMime(mimeType).replace("recording.", "answer.");
      const file = new File([blob], uploadName, { type: mimeType });
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
            : "Transcription failed. Please try again.";
        setLocalError(message);
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
        setLocalError("Could not understand the recording. Please try again.");
        return;
      }

      recorder.discardRecording();
      await onSubmitAnswer(text);
    } catch {
      setLocalError("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, [onSubmitAnswer, recorder.discardRecording, recorder.recordingBlob, recorder.recordingMimeType]);

  const displayError =
    localError ?? recorder.error ?? agentSpeech.error ?? turnError ?? null;

  return (
    <div className="flex h-full min-h-0 w-full max-w-chat shrink-0 flex-col px-4">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10">
        <VoiceHeroAvatar
          isActive={agentSpeech.isSpeaking || isSubmittingTurn}
          isThinking={isSubmittingTurn}
        />

        {isSubmittingTurn ? (
          <div className="sr-only">
            <AssistantStatusRow message={THINKING_STATUS_MESSAGE} />
          </div>
        ) : null}

        <VoiceMicControls
          phase={recorder.phase}
          micEnabled={micEnabled}
          isTranscribing={isTranscribing}
          statusMessage={statusMessage}
          recorderError={displayError}
          onMicPress={handleMicPress}
          onAccept={() => void handleAccept()}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
