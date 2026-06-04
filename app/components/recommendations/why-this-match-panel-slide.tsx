"use client";

import { useCallback, useEffect, useState } from "react";

import { WhyThisMatchPanel } from "@/app/components/recommendations/why-this-match-panel";
import { cn } from "@/lib/cn";
import type { RecommendedRepo } from "@/lib/matchmaking/types";

type WhyThisMatchPanelSlideProps = {
  repo: RecommendedRepo;
  onClose: () => void;
};

export function WhyThisMatchPanelSlide({ repo, onClose }: WhyThisMatchPanelSlideProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [repo.id]);

  const handleClose = useCallback(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onClose();
      return;
    }
    setIsVisible(false);
  }, [onClose]);

  const handleTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") {
        return;
      }
      if (!isVisible) {
        onClose();
      }
    },
    [isVisible, onClose],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close details panel"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ease-out lg:hidden",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={handleClose}
      />
      <div
        className={cn(
          "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50",
          "lg:relative lg:flex lg:w-why-panel lg:shrink-0 lg:overflow-hidden",
        )}
      >
        <div
          className={cn(
            "h-full w-why-panel shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none",
            isVisible ? "translate-x-0" : "translate-x-full",
          )}
          onTransitionEnd={handleTransitionEnd}
        >
          <WhyThisMatchPanel repo={repo} onClose={handleClose} />
        </div>
      </div>
    </>
  );
}
