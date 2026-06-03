import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

const textVariants = cva("", {
  variants: {
    size: {
      "5xl": "text-5xl font-semibold leading-normal text-foreground",
      question:
        "text-question font-semibold text-foreground [word-break:break-word]",
      "2xl": "text-2xl font-normal leading-normal text-muted-foreground",
      lg: "text-lg font-normal leading-normal text-muted",
      sm: "text-sm font-normal leading-normal text-muted",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof textVariants> &
  Omit<
    React.ComponentPropsWithoutRef<T>,
    "as" | "children" | "className" | "weight"
  >;

export function Text<T extends ElementType = "p">({
  as,
  size,
  weight,
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";

  return (
    <Component className={cn(textVariants({ size, weight }), className)} {...props}>
      {children}
    </Component>
  );
}
