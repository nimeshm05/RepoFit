"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { IconButton } from "@/app/components/ui/IconButton";
import type { RecommendedRepo } from "@/lib/matchmaking/types";

type WhyThisMatchPanelProps = {
  repo: RecommendedRepo;
  onClose: () => void;
};

export function WhyThisMatchPanel({ repo, onClose }: WhyThisMatchPanelProps) {
  const recommendation = repo.recommendation;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [repo.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside
      className="flex h-full min-h-0 w-why-panel shrink-0 flex-col border-l border-neutral-200 bg-bg-color"
      aria-label={`Why this match for ${repo.fullName}`}
    >
      <div className="flex shrink-0 items-center gap-header-gap border-b border-neutral-200 px-5 py-4">
        <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-neutral-900">
          {repo.fullName}
        </h2>
        <IconButton
          ref={closeButtonRef}
          type="button"
          variant="secondary"
          onClick={onClose}
          aria-label="Close Why this match"
        >
          <X strokeWidth={2} aria-hidden />
        </IconButton>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5">
        <div className="flex flex-col gap-why-panel-sections">
          <section className="flex flex-col gap-2.5">
            <h3 className="text-base font-semibold text-neutral-900">Why this match?</h3>
            <p className="text-base leading-body text-neutral-500">
              {recommendation.whyThisMatches}
            </p>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 className="text-base font-semibold text-neutral-900">Match Highlights</h3>
            <ul className="list-disc space-y-2 pl-6 text-base leading-body text-neutral-500">
              {recommendation.matchHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 className="text-base font-semibold text-neutral-900">Tradeoffs</h3>
            <ul className="list-disc space-y-2 pl-6 text-base leading-body text-neutral-500">
              {recommendation.tradeoffs.map((tradeoff) => (
                <li key={tradeoff}>{tradeoff}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </aside>
  );
}
