"use client";

import { RefreshCcwDot } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/** Figma node 2021:162 — Default / Hover / Click icon button */
const reloadButtonClassName =
  "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-button-secondary-default-bg-color p-3 text-foreground transition-colors hover:bg-neutral-200 active:bg-neutral-200 active:[&_svg]:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:pointer-events-none disabled:opacity-50";

const reloadIconClassName = "size-5 shrink-0 transition-transform duration-150";

type ReloadButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">;

export function ReloadButton({
  className,
  "aria-label": ariaLabel = "Restart conversation",
  ...props
}: ReloadButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(reloadButtonClassName, className)}
      {...props}
    >
      <RefreshCcwDot
        className={reloadIconClassName}
        strokeWidth={2}
        absoluteStrokeWidth
        aria-hidden
      />
    </button>
  );
}
