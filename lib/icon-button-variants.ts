import { cva } from "class-variance-authority";

/**
 * Figma 2021:162 — icon button (Primary / Secondary)
 * Secondary: neutral-100 → neutral-200 (hover/click) · dark icon
 * Primary: #171717 → #404040 (hover) → #171717 (click) · light icon
 * Click (both): icon scale 0.9
 */
export const iconButtonVariants = cva(
  [
    "inline-flex size-icon-button shrink-0 items-center justify-center overflow-hidden",
    "rounded-icon-button p-icon-button",
    "transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400",
    "disabled:pointer-events-none",
    "active:[&_svg]:scale-90",
    "[&_svg]:size-icon-button-icon [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-150",
  ].join(" "),
  {
    variants: {
      variant: {
        secondary:
          "bg-color text-foreground hover:bg-neutral-100 active:bg-neutral-100 disabled:opacity-50",
        primary:
          "bg-button-primary-default-bg-color text-button-primary-default-text-color hover:bg-primary-hover active:bg-button-primary-click-bg-color disabled:bg-neutral-300 disabled:text-button-primary-default-text-color disabled:opacity-100",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);
