"use client";

import { AnimatePresence, motion } from "motion/react";

import {
  blurTextSwapAnimate,
  blurTextSwapExit,
  blurTextSwapInitial,
  blurTextSwapTransition,
} from "@/lib/motion/blur-reveal";
import { cn } from "@/lib/cn";

type BlurTextSwapProps = {
  text: string;
  className?: string;
};

/** Cross-fades label text with a blur on enter/exit (e.g. Chat ↔ Talk). */
export function BlurTextSwap({ text, className }: BlurTextSwapProps) {
  return (
    <span className={cn("relative inline-grid overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="col-start-1 row-start-1"
          initial={blurTextSwapInitial}
          animate={blurTextSwapAnimate}
          exit={blurTextSwapExit}
          transition={blurTextSwapTransition}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
