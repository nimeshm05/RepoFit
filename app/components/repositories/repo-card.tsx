import { Card } from "@/app/components/ui/card";
import { Text } from "@/app/components/ui/text";
import { truncateReadme } from "@/lib/github/get-repo-readme";
import type { RepoCategory, RepoSummary } from "@/lib/github/types";

function formatUpdatedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

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
};

export function RepoCard({ repo, recommendation }: RepoCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {recommendation && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              #{recommendation.rank}
            </span>
          )}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-foreground hover:underline"
          >
            {repo.fullName}
          </a>
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

        {repo.description && (
          <Text size="lg" className="text-muted">
            {repo.description}
          </Text>
        )}

        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <div>
            <dt className="sr-only">Language</dt>
            <dd>{repo.language ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="sr-only">Stars</dt>
            <dd>{repo.stars.toLocaleString()} stars</dd>
          </div>
          <div>
            <dt className="sr-only">Open issues</dt>
            <dd>{repo.openIssues.toLocaleString()} open issues</dd>
          </div>
          <div>
            <dt className="sr-only">Last updated</dt>
            <dd>Updated {formatUpdatedDate(repo.updatedAt)}</dd>
          </div>
        </dl>

        {recommendation && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-2">
              <Text size="sm" weight="semibold" className="uppercase tracking-wide text-muted">
                Why this matches
              </Text>
              <Text size="lg">{recommendation.whyThisMatches}</Text>
            </div>

            <div className="flex flex-col gap-2">
              <Text size="sm" weight="semibold" className="uppercase tracking-wide text-muted">
                Match highlights
              </Text>
              <ul className="list-disc space-y-1 pl-5 text-lg text-foreground">
                {recommendation.matchHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Text size="sm" weight="semibold" className="uppercase tracking-wide text-muted">
                Tradeoffs
              </Text>
              <ul className="list-disc space-y-1 pl-5 text-lg text-muted">
                {recommendation.tradeoffs.map((tradeoff) => (
                  <li key={tradeoff}>{tradeoff}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {repo.readme && (
          <details className="rounded-card border border-border bg-background">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
              Preview README
            </summary>
            <div className="border-t border-border px-4 py-3">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6 text-muted">
                {truncateReadme(repo.readme)}
              </pre>
              {repo.readmeUrl && (
                <a
                  href={repo.readmeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-foreground hover:underline"
                >
                  Read full README on GitHub
                </a>
              )}
            </div>
          </details>
        )}
      </div>
    </Card>
  );
}
