"use client";

import { AudioLines, MessageCircle } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/cn";

export type HeaderMode = "chat" | "voice";

const TAB_HIGHLIGHT_LAYOUT_ID = "header-mode-tab-highlight";

const tabHighlightTransition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
} as const;

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
    <LayoutGroup id="header-mode-tabs">
      <div
        role="tablist"
        aria-label="Conversation mode. Selecting a tab restarts the session."
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
    </LayoutGroup>
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
      className="relative inline-flex shrink-0 items-center justify-center rounded-button px-3 py-2 text-base leading-body text-foreground"
    >
      {isActive ? (
        <motion.span
          layoutId={TAB_HIGHLIGHT_LAYOUT_ID}
          className="absolute inset-0 rounded-button bg-neutral-100"
          transition={tabHighlightTransition}
          aria-hidden
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center justify-center gap-header-gap">
        <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
        <span>{label}</span>
      </span>
    </button>
  );
}
