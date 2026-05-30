import Image from "next/image";
import Link from "next/link";

import { Text } from "@/app/components/ui/Text";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/cn";

export function CompletionScreen() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-center gap-10 p-2.5">
      <Text as="h1" size="5xl">
        Completed.
      </Text>
      <Link href="/onboarding?restart=1" className={cn(buttonVariants())}>
        Start again
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={20}
          height={20}
          className="size-5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
