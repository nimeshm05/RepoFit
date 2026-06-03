"use client";

import { RefreshCcwDot } from "lucide-react";
import type { ComponentProps } from "react";

import { IconButton } from "@/app/components/ui/IconButton";

type ReloadButtonProps = Omit<ComponentProps<typeof IconButton>, "type" | "children" | "variant">;

export function ReloadButton({
  "aria-label": ariaLabel = "Restart conversation",
  ...props
}: ReloadButtonProps) {
  return (
    <IconButton type="button" variant="secondary" aria-label={ariaLabel} {...props}>
      <RefreshCcwDot strokeWidth={2} absoluteStrokeWidth aria-hidden />
    </IconButton>
  );
}
