"use client";

import { AssistantAvatarSvg } from "@/app/components/chat/assistant-avatar-svg";
import { cn } from "@/lib/cn";

/** Figma node 2074:2440 — assistant bot icon (24×24) */
export function BotAvatar({
  isThinking = false,
  className,
}: {
  /** Alternating eye squish while waiting for the model. */
  isThinking?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center text-neutral-900",
        className ?? "size-avatar",
      )}
      aria-hidden
    >
      <AssistantAvatarSvg className="h-full w-full" isThinking={isThinking} />
    </div>
  );
}
