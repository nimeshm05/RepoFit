import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/lib/button-variants";
import { Text } from "@/app/components/ui/Text";
import { cn } from "@/lib/cn";

export function HomeContent() {
  return (
    <div className="flex w-full flex-col items-start gap-10 p-2.5">
      <div className="flex w-full flex-col items-start gap-20">
        <div className="flex w-full flex-col items-start gap-0">
          <Text as="h1" size="5xl">
            RepoFit
          </Text>
          <Text size="2xl">Find open-source projects that fit you.</Text>
        </div>

        <Text>
          Tell us about your skills, interests, and goals. We&apos;ll match you
          with repositories where you can realistically contribute and grow.
        </Text>
      </div>

      <Link href="/preference-elicitation?restart=1" className={cn(buttonVariants())}>
        Get Started
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
