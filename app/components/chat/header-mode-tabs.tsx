"use client";

import { AudioLines, MessageCircle } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

export type HeaderMode = "chat" | "voice";

type HeaderModeTabsProps = {
  value?: HeaderMode;
  defaultValue?: HeaderMode;
  onChange?: (mode: HeaderMode) => void;
  className?: string;
};

/** Figma 2063:1572 — Chat / Voice mode switcher for the nav header */
export function HeaderModeTabs({
  value,
  defaultValue = "chat",
  onChange,
  className,
}: HeaderModeTabsProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<HeaderMode>(defaultValue);
  const mode = value ?? uncontrolledMode;

  const selectMode = (next: HeaderMode) => {
    if (value === undefined) {
      setUncontrolledMode(next);
    }
    onChange?.(next);
  };

  return (
    <div
      role="tablist"
      aria-label="Conversation mode"
      className={cn("flex items-center gap-[8px]", className)}
    >
      <ModeTab
        id="header-mode-chat"
        isActive={mode === "chat"}
        label="Chat"
        icon={MessageCircle}
        onSelect={() => selectMode("chat")}
      />
      <ModeTab
        id="header-mode-voice"
        isActive={mode === "voice"}
        label="Voice"
        icon={AudioLines}
        onSelect={() => selectMode("voice")}
      />
    </div>
  );
}

function ModeTab({
  id,
  isActive,
  label,
  icon: Icon,
  onSelect,
}: {
  id: string;
  isActive: boolean;
  label: string;
  icon: typeof MessageCircle;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isActive}
      aria-controls={`${id}-panel`}
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-header-gap rounded-button px-3 py-2 text-base leading-body text-foreground transition-colors",
        isActive ? "bg-neutral-100" : "bg-bg-color",
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
