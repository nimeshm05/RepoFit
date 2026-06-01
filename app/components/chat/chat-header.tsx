"use client";

import { BadgeInfo, RotateCw } from "lucide-react";

const REPOFIT_TOOLTIP =
  "RepoFit helps you find open-source projects that match your skills, interests, and contribution goals.";

type ChatHeaderProps = {
  onRestart: () => void;
};

export function ChatHeader({ onRestart }: ChatHeaderProps) {
  return (
    <header className="shrink-0 border-b border-neutral-200/50 bg-bg-color">
      <div className="mx-auto flex w-full max-w-[600px] items-center gap-2.5 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="shrink-0 text-lg font-semibold text-foreground">RepoFit</span>
          <button
            type="button"
            className="shrink-0 text-foreground"
            title={REPOFIT_TOOLTIP}
            aria-label="About RepoFit"
          >
            <BadgeInfo className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-[0.5px] border-neutral-200 bg-button-secondary-default-bg-color p-[11px] text-button-secondary-default-text-color"
          aria-label="Restart conversation"
        >
          <RotateCw className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </header>
  );
}
