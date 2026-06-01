import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex w-fit shrink-0 cursor-pointer items-center justify-start gap-1.5 rounded-button bg-primary py-2 pl-3.5 pr-2.5 text-sm font-normal leading-[1.44] text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:bg-primary-disabled disabled:opacity-100",
  {
    variants: {
      variant: {
        primary: "",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);
