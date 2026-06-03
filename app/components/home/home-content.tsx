import Image from "next/image";
import Link from "next/link";

import { BotAvatar } from "@/app/components/chat/bot-avatar";
import { buttonVariants } from "@/lib/button-variants";
import { Text } from "@/app/components/ui/Text";
import { cn } from "@/lib/cn";

export function HomeContent() {
  return (
    <div className="mx-auto flex min-h-home w-full max-w-home flex-col items-center justify-center gap-10 text-center">
      <div className="flex w-full flex-col items-center gap-20">
        <div className="flex w-full flex-col items-center gap-2">
          <Text as="h1" size="5xl">
            RepoFit
          </Text>
          <BotAvatar className="size-[60px]" isThinking />
          <Text size="2xl" className="text-neutral-600">
            Find open-source projects that fit you.
          </Text>
        </div>

        <Text className="text-neutral-500">
          Tell us about your skills, interests, and goals. We&apos;ll match you
          with repositories where you can realistically contribute and grow.
        </Text>
      </div>

      <Link
        href="/?restart=1"
        className={cn(
          buttonVariants(),
          "rounded-full px-3.5 py-2",
        )}
      >
        Get Started
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={14}
          height={14}
          className="size-3.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
