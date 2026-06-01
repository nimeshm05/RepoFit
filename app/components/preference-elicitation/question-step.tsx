"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/app/components/ui/Button";
import { Text } from "@/app/components/ui/Text";
import { Textarea } from "@/app/components/ui/Textarea";
import { isValidAnswer } from "@/lib/preference-elicitation/validation";

type QuestionStepProps = {
  question: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onContinue: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function QuestionStep({
  question,
  answer,
  onAnswerChange,
  onContinue,
  isLoading = false,
  error = null,
}: QuestionStepProps) {
  const canContinue = isValidAnswer(answer) && !isLoading;

  return (
    <div className="flex h-screen flex-col gap-10 overflow-hidden p-2.5 py-10">
      <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-hidden">
        <div className="flex shrink-0 flex-col gap-5">
          <Link
            href="/"
            className="inline-flex size-9 shrink-0 items-center justify-center"
            aria-label="Close and return home"
          >
            <Image src="/icons/close.svg" alt="" width={36} height={36} aria-hidden />
          </Link>
          <Text size="question">{question}</Text>
        </div>

        <Textarea
          autoResize={false}
          className="min-h-0 flex-1"
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Type your response"
          disabled={isLoading}
          aria-label="Your response"
        />

        {error ? (
          <Text size="sm" className="shrink-0 text-foreground">
            {error}
          </Text>
        ) : null}
      </div>

      <Button type="button" className="shrink-0" disabled={!canContinue} onClick={onContinue}>
        Continue
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={14}
          height={14}
          className="size-3.5"
          aria-hidden
        />
      </Button>
    </div>
  );
}
