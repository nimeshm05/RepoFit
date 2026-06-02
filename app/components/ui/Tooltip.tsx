"use client";

import { useId, useState, type FocusEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Figma node 2039:687 */
const tooltipPanelClassName =
  "w-tooltip rounded border border-button-secondary-default-bg-color bg-surface px-4 py-3 text-assistant leading-body text-neutral-500 [word-break:break-word] shadow-tooltip";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      hide();
    }
  };

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={handleBlur}
    >
      <span className="inline-flex items-center" aria-describedby={open ? id : undefined}>
        {children}
      </span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2",
            tooltipPanelClassName,
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
