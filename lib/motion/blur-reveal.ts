export const staggeredBlurContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.06,
    },
  },
} as const;

export const staggeredBlurItem = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(12px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

export const blurTextSwapTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;

export const blurTextSwapInitial = {
  opacity: 0,
  filter: "blur(8px)",
} as const;

export const blurTextSwapAnimate = {
  opacity: 1,
  filter: "blur(0px)",
} as const;

export const blurTextSwapExit = {
  opacity: 0,
  filter: "blur(8px)",
} as const;
