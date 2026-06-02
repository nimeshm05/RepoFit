"use client";

import { BadgeInfo } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ReloadButton } from "@/app/components/ui/ReloadButton";
import { Tooltip } from "@/app/components/ui/Tooltip";

export const REPOFIT_INFO_TOOLTIP =
  "RepoFit helps you discover GitHub projects that match your skills, interests, and contribution goals.";

type HeaderProps = {
  title?: string;
  /** Pass `null` to hide the info button. */
  infoTooltip?: string | null;
  onRestart?: () => void;
  /** Custom trailing control; overrides `onRestart` when provided. */
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Header({
  title = "RepoFit",
  infoTooltip = REPOFIT_INFO_TOOLTIP,
  onRestart,
  action,
  className,
  contentClassName,
}: HeaderProps) {
  const trailingAction =
    action ??
    (onRestart ? <ReloadButton onClick={onRestart} /> : null);

  return (
    <header
      className={cn(
        "shrink-0 overflow-visible border-b border-neutral-200/50 bg-bg-color",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-chat items-center gap-header-gap px-4 py-4",
          contentClassName,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-header-gap">
          <span className="shrink-0 text-lg font-semibold text-foreground">{title}</span>
          {infoTooltip ? (
            <Tooltip content={infoTooltip}>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center text-foreground"
                aria-label={`About ${title}`}
              >
                <BadgeInfo
                  className="size-4"
                  strokeWidth={2.5}
                  absoluteStrokeWidth
                  aria-hidden
                />
              </button>
            </Tooltip>
          ) : null}
        </div>
        {trailingAction}
      </div>
    </header>
  );
}
