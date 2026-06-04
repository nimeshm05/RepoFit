"use client";

type VoiceStatusProps = {
  message: string;
  error?: string | null;
};

export function VoiceStatus({ message, error }: VoiceStatusProps) {
  return (
    <p
      className="min-h-[20px] w-full max-w-chat text-center text-sm leading-assistant text-neutral-500"
      aria-live="polite"
    >
      {error ?? message}
    </p>
  );
}
