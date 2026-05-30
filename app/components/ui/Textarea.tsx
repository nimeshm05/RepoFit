"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoResize?: boolean;
};

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function Textarea({
  className,
  rows = 1,
  value,
  onChange,
  autoResize = true,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!autoResize) {
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      resizeTextarea(textarea);
    }
  }, [value, autoResize]);

  return (
    <textarea
      ref={textareaRef}
      rows={rows}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        if (autoResize && textareaRef.current) {
          resizeTextarea(textareaRef.current);
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
