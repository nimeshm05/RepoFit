"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoResize?: boolean;
  minContentHeight?: number;
  maxContentHeight?: number;
  onLayoutChange?: (layout: { height: number; isMultiline: boolean }) => void;
};

const SINGLE_LINE_HEIGHT = 24;

function resizeTextarea(
  textarea: HTMLTextAreaElement,
  minContentHeight?: number,
  maxContentHeight?: number,
) {
  textarea.style.height = "auto";
  let nextHeight = textarea.scrollHeight;

  if (minContentHeight !== undefined) {
    nextHeight = Math.max(nextHeight, minContentHeight);
  }
  if (maxContentHeight !== undefined) {
    nextHeight = Math.min(nextHeight, maxContentHeight);
  }

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > nextHeight ? "auto" : "hidden";
}

export function Textarea({
  className,
  rows = 1,
  value,
  onChange,
  autoResize = true,
  minContentHeight,
  maxContentHeight,
  onLayoutChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyResize = (textarea: HTMLTextAreaElement) => {
    resizeTextarea(textarea, minContentHeight, maxContentHeight);
    onLayoutChange?.({
      height: textarea.offsetHeight,
      isMultiline:
        textarea.value.includes("\n") ||
        textarea.scrollHeight > SINGLE_LINE_HEIGHT,
    });
  };

  useLayoutEffect(() => {
    if (!autoResize) {
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      applyResize(textarea);
    }
    // applyResize is stable for a given render; onLayoutChange may change per parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, autoResize, minContentHeight, maxContentHeight, onLayoutChange]);

  return (
    <textarea
      ref={textareaRef}
      rows={rows}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        if (autoResize && textareaRef.current) {
          applyResize(textareaRef.current);
        }
      }}
      className={cn(
        "w-full resize-none border-0 bg-transparent text-base font-normal leading-[1.44] text-foreground placeholder:text-neutral-400 focus:outline-none",
        autoResize ? "overflow-hidden" : "min-h-0 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}
