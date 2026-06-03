import { Info } from "lucide-react";

import type { RepoCategory, RepoSummary } from "@/lib/github/types";

function categoryLabel(category: RepoCategory): string {
  return category === "popular" ? "Popular" : "Most active";
}

function categoryStyles(category: RepoCategory): string {
  return category === "popular"
    ? "bg-amber-100 text-amber-900"
    : "bg-sky-100 text-sky-900";
}

type RepoRecommendationDetails = {
  rank: number;
  whyThisMatches: string;
  matchHighlights: string[];
  tradeoffs: string[];
};

type RepoCardProps = {
  repo: RepoSummary;
  recommendation?: RepoRecommendationDetails;
  className?: string;
  isSelected?: boolean;
  onOpenWhy?: () => void;
};

function RepoStatsRow({ repo }: { repo: RepoSummary }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base leading-body">
      <div className="flex items-center gap-1">
        <dt className="text-neutral-400">Language:</dt>
        <dd className="text-neutral-900">{repo.language ?? "Unknown"}</dd>
      </div>
      <div className="flex items-center gap-1">
        <dt className="text-neutral-400">Stars:</dt>
        <dd className="text-neutral-900">{repo.stars.toLocaleString()}</dd>
      </div>
      <div className="flex items-center gap-1">
        <dt className="text-neutral-400">Open Issues:</dt>
        <dd className="text-neutral-900">{repo.openIssues.toLocaleString()}</dd>
      </div>
    </dl>
  );
}

function RepoWhyTeaser({
  fullName,
  onOpenWhy,
}: {
  fullName: string;
  onOpenWhy?: () => void;
}) {
  if (!onOpenWhy) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onOpenWhy}
      className="inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
      aria-label={`Why this match for ${fullName}`}
    >
      <Info className="size-4" aria-hidden />
      <span className="text-assistant leading-5">Why this match?</span>
    </button>
  );
}

export function RepoCard({
  repo,
  recommendation,
  className,
  isSelected = false,
  onOpenWhy,
}: RepoCardProps) {
  return (
    <div className={className}>
      <div
        className={`flex w-full flex-col gap-repo-card-inner rounded-button bg-background px-repo-card-x py-repo-card-y transition-colors ${isSelected ? "ring-1 ring-neutral-300" : ""}`}
      >
        <div className="flex flex-col gap-repo-main">
          <div className="flex flex-col gap-repo-info">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold leading-body text-neutral-900 hover:underline"
            >
              {repo.fullName}
            </a>
            {repo.description ? (
              <p className="text-base leading-body text-neutral-500">{repo.description}</p>
            ) : null}
          </div>
          <RepoStatsRow repo={repo} />
        </div>
        {recommendation ? (
          <RepoWhyTeaser fullName={repo.fullName} onOpenWhy={onOpenWhy} />
        ) : null}
      </div>
      {!recommendation ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            Good first issues
          </span>
          {repo.categories.map((category) => (
            <span
              key={category}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles(category)}`}
            >
              {categoryLabel(category)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
