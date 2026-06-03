"use client";

import { HeaderModeTabs, type HeaderMode } from "@/app/components/chat/header-mode-tabs";
import { REPOFIT_INFO_TOOLTIP, Header } from "@/app/components/ui/Header";
import { cn } from "@/lib/cn";

type ChatHeaderProps = {
  mode?: HeaderMode;
  defaultMode?: HeaderMode;
  onModeChange?: (mode: HeaderMode) => void;
  className?: string;
};

/** Figma 2063:1862 — centered Chat / Voice tabs; tab click restarts the flow (see onModeChange). */
export function ChatHeader({
  mode,
  defaultMode,
  onModeChange,
  className,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "shrink-0 overflow-visible border-b border-neutral-200/50 bg-bg-color py-5",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-chat items-center justify-center">
        <HeaderModeTabs
          value={mode}
          defaultValue={defaultMode}
          onChange={onModeChange}
        />
      </div>
    </header>
  );
}

export { Header, REPOFIT_INFO_TOOLTIP };
