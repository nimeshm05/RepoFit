"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RepoCard } from "@/app/components/repositories/RepoCard";
import { Text } from "@/app/components/ui/Text";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/cn";
import type { MatchmakingResult } from "@/lib/matchmaking/types";
import { getSessionSnapshot } from "@/lib/preference-elicitation/storage";

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MatchmakingResult };

export function RecommendationsView() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    const session = getSessionSnapshot();

    if (session.status !== "complete" || session.turns.length === 0) {
      router.replace("/preference-elicitation");
      return;
    }

    let cancelled = false;

    async function fetchRecommendations() {
      setViewState({ status: "loading" });

      try {
        const response = await fetch("/api/matchmaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turns: session.turns }),
        });

        const data: unknown = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Something went wrong. Please try again.";
          setViewState({ status: "error", message });
          return;
        }

        setViewState({ status: "success", data: data as MatchmakingResult });
      } catch {
        if (!cancelled) {
          setViewState({
            status: "error",
            message: "Something went wrong. Please try again.",
          });
        }
      }
    }

    void fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (viewState.status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center gap-6 p-2.5">
        <Text as="h1" size="5xl">
          Finding repositories for you…
        </Text>
        <Text size="2xl" className="max-w-2xl text-muted">
          Analyzing your preferences against our open-source catalog.
        </Text>
      </div>
    );
  }

  if (viewState.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center gap-10 p-2.5">
        <div className="flex flex-col gap-3">
          <Text as="h1" size="5xl">
            Recommendations unavailable
          </Text>
          <Text size="2xl" className="max-w-2xl text-muted">
            {viewState.message}
          </Text>
        </div>
        <StartAgainLink />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <main className="flex flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <Text
            size="sm"
            weight="semibold"
            className="uppercase tracking-wide text-muted"
          >
            Personalized for you
          </Text>
          <Text as="h1" size="5xl">
            Your recommended repositories
          </Text>
          <Text size="2xl" className="max-w-2xl text-muted">
            Three open-source projects selected based on your skills, interests,
            and contribution goals.
          </Text>
        </header>

        <ul className="flex flex-col gap-4">
          {viewState.data.recommendations.map((repo) => (
            <li key={repo.id}>
              <RepoCard repo={repo} recommendation={repo.recommendation} />
            </li>
          ))}
        </ul>

        <StartAgainLink />
      </main>
    </div>
  );
}

function StartAgainLink() {
  return (
    <Link href="/preference-elicitation?restart=1" className={cn(buttonVariants())}>
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
  );
}
