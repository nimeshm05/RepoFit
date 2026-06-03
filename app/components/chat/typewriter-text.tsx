"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const MS_PER_CHAR = 16;
const MIN_DURATION_S = 0.6;
const MAX_DURATION_S = 8;

function getTypeDuration(textLength: number) {
  const seconds = (textLength * MS_PER_CHAR) / 1000;
  return Math.min(MAX_DURATION_S, Math.max(MIN_DURATION_S, seconds));
}

type TypewriterTextProps = {
  text: string;
  className?: string;
  /** When false, the full string is shown immediately (e.g. past conversation turns). */
  animate?: boolean;
};

export function TypewriterText({
  text,
  className,
  animate: shouldAnimate = true,
}: TypewriterTextProps) {
  const [isComplete, setIsComplete] = useState(!shouldAnimate);
  const count = useMotionValue(shouldAnimate ? 0 : text.length);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    if (!shouldAnimate) {
      count.set(text.length);
      setIsComplete(true);
      return;
    }

    setIsComplete(false);
    count.set(0);

    const controls = animate(count, text.length, {
      duration: getTypeDuration(text.length),
      ease: "linear",
      onComplete: () => setIsComplete(true),
    });

    return () => controls.stop();
  }, [text, shouldAnimate, count]);

  if (!shouldAnimate) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className} aria-live="polite">
      <motion.span>{displayText}</motion.span>
      {!isComplete ? (
        <motion.span
          aria-hidden
          className="ml-px inline-block w-[2px] translate-y-px bg-neutral-900"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
        />
      ) : null}
    </p>
  );
}
