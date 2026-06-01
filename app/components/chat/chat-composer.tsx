"use client";

import { ArrowUp } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Textarea } from "@/app/components/ui/Textarea";
import { cn } from "@/lib/cn";

const COMPOSER_MIN_HEIGHT = 62;
const COMPOSER_MAX_HEIGHT = 160;
/** Max scrollable textarea height inside padded composer (160px frame − 24px py − ~38px button). */
const TEXTAREA_MAX_CONTENT_HEIGHT = 98;

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  canSend: boolean;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  canSend,
}: ChatComposerProps) {
  const [isMultiline, setIsMultiline] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full shrink-0 overflow-hidden rounded-[12px] border border-neutral-200 bg-bg-color py-3 pl-5 pr-3",
        isMultiline ? "items-start gap-3" : "items-center gap-2.5",
      )}
      style={{
        minHeight: COMPOSER_MIN_HEIGHT,
        maxHeight: COMPOSER_MAX_HEIGHT,
      }}
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="Type your responses..."
        minContentHeight={24}
        maxContentHeight={TEXTAREA_MAX_CONTENT_HEIGHT}
        onLayoutChange={({ isMultiline: multiline }) => setIsMultiline(multiline)}
        className="min-w-0 flex-1"
      />
      <div
        className={cn(
          "shrink-0",
          isMultiline && "flex self-stretch flex-col justify-end",
        )}
      >
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send response"
          className="inline-flex items-center justify-center rounded-full p-[11px] text-button-primary-default-text-color disabled:bg-neutral-300 enabled:bg-button-primary-default-bg-color"
        >
          <ArrowUp className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </form>
  );
}
