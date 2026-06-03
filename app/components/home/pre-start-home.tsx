"use client";

import { motion } from "motion/react";

import { BotAvatar } from "@/app/components/chat/bot-avatar";
import { BlurTextSwap } from "@/app/components/motion/blur-text-swap";
import type { HeaderMode } from "@/app/components/chat/header-mode-tabs";
import {
  staggeredBlurContainer,
  staggeredBlurItem,
} from "@/lib/motion/blur-reveal";

type PreStartHomeProps = {
  headerMode: HeaderMode;
  onStart: () => void;
};

export function PreStartHome({ headerMode, onStart }: PreStartHomeProps) {
  const actionLabel = headerMode === "voice" ? "Talk" : "Chat";

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-6 text-center"
      variants={staggeredBlurContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={staggeredBlurItem}>
        <BotAvatar className="size-[60px]" isThinking />
      </motion.div>

      <motion.p
        variants={staggeredBlurItem}
        className="text-xl font-medium text-neutral-900"
      >
        Find open-source projects that fit you.
      </motion.p>

      <motion.p
        variants={staggeredBlurItem}
        className="max-w-md text-base leading-body text-neutral-500"
      >
        Tell us about your skills, interests, and goals. We&apos;ll match you with
        repositories where you can realistically contribute and grow.
      </motion.p>

      <motion.div variants={staggeredBlurItem}>
        <button
          type="button"
          className="inline-flex min-w-[5.5rem] items-center justify-center rounded-button bg-button-primary-default-bg-color px-3.5 py-2 text-base leading-body text-button-primary-default-text-color"
          onClick={onStart}
        >
          <BlurTextSwap text={actionLabel} />
        </button>
      </motion.div>
    </motion.div>
  );
}
