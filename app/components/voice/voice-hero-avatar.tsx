"use client";

import { AssistantAvatarSvg } from "@/app/components/chat/assistant-avatar-svg";
import { cn } from "@/lib/cn";

type VoiceHeroAvatarProps = {
  className?: string;
  isActive?: boolean;
  isThinking?: boolean;
};

/** Large centered assistant orb for voice mode (Figma voice screen). */
export function VoiceHeroAvatar({
  className,
  isActive = false,
  isThinking = false,
}: VoiceHeroAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex size-[200px] items-center justify-center rounded-full",
        "bg-[radial-gradient(circle_at_30%_25%,#b8d9ff_0%,#6ba8f5_45%,#3d85ef_100%)]",
        isActive && "animate-pulse",
        className,
      )}
      aria-hidden
    >
      <div className="flex size-[88px] items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-sm">
        <AssistantAvatarSvg className="size-14" isThinking={isThinking} />
      </div>
    </div>
  );
}
