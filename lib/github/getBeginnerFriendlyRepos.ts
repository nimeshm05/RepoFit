import { githubFetch } from "./client";
import { getRepoReadme } from "./getRepoReadme";
import { logGitHubApiResponse } from "./logApiResponse";
import type {
  GitHubSearchRepoItem,
  GitHubSearchResponse,
  RepoCategory,
  RepoSummary,
} from "./types";

const SEARCH_QUERY =
  "good-first-issues:>=3 is:public archived:false stars:>50";

const DEFAULT_COUNT = 100;
const GITHUB_SEARCH_MAX_PER_PAGE = 100;
const README_BATCH_SIZE = 10;
const MAX_FILL_PAGES = 10;

type RepoSort = "stars" | "updated";

function toRepoSummary(
  item: GitHubSearchRepoItem,
  category: RepoCategory,
): RepoSummary {
  return {
    id: item.id,
    name: item.name,
    fullName: item.full_name,
    url: item.html_url,
    description: item.description,
    language: item.language,
    stars: item.stargazers_count,
    openIssues: item.open_issues_count,
    updatedAt: item.updated_at,
    categories: [category],
    readme: null,
    readmeUrl: null,
  };
}

async function searchRepos(
  sort: RepoSort,
  perPage: number,
  page = 1,
): Promise<GitHubSearchResponse> {
  const params = new URLSearchParams({
    q: SEARCH_QUERY,
    sort,
    order: "desc",
    per_page: String(perPage),
    page: String(page),
  });

  return githubFetch<GitHubSearchResponse>(
    `/search/repositories?${params.toString()}`,
  );
}

function mergeRepos(
  popularItems: GitHubSearchRepoItem[],
  activeItems: GitHubSearchRepoItem[],
): RepoSummary[] {
  const merged = new Map<number, RepoSummary>();

  for (const item of popularItems) {
    merged.set(item.id, toRepoSummary(item, "popular"));
  }

  for (const item of activeItems) {
    const existing = merged.get(item.id);

    if (existing) {
      if (!existing.categories.includes("active")) {
        existing.categories.push("active");
      }
      continue;
    }

    merged.set(item.id, toRepoSummary(item, "active"));
  }

  return Array.from(merged.values());
}

async function fillToCount(
  repos: RepoSummary[],
  count: number,
): Promise<RepoSummary[]> {
  const seen = new Set(repos.map((repo) => repo.id));
  const filled = [...repos];

  const fillSources: Array<{ sort: RepoSort; category: RepoCategory }> = [
    { sort: "updated", category: "active" },
    { sort: "stars", category: "popular" },
  ];

  for (const source of fillSources) {
    let page = 2;

    while (filled.length < count && page <= MAX_FILL_PAGES) {
      const perPage = Math.min(
        GITHUB_SEARCH_MAX_PER_PAGE,
        count - filled.length + 10,
      );
      const data = await searchRepos(source.sort, perPage, page);

      if (data.items.length === 0) {
        break;
      }

      for (const item of data.items) {
        if (seen.has(item.id)) {
          continue;
        }

        seen.add(item.id);
        filled.push(toRepoSummary(item, source.category));

        if (filled.length >= count) {
          break;
        }
      }

      page += 1;
    }
  }

  return filled.slice(0, count);
}

async function attachReadmes(repos: RepoSummary[]): Promise<RepoSummary[]> {
  const withReadmes: RepoSummary[] = [];

  for (let i = 0; i < repos.length; i += README_BATCH_SIZE) {
    const batch = repos.slice(i, i + README_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (repo) => {
        const readme = await getRepoReadme(repo.fullName);

        return {
          ...repo,
          readme: readme.content,
          readmeUrl: readme.url,
        };
      }),
    );

    withReadmes.push(...batchResults);
  }

  return withReadmes;
}

function reposForLog(repos: RepoSummary[]) {
  return repos.map(({ readme, ...repo }) => ({
    ...repo,
    readmeLength: readme?.length ?? 0,
  }));
}

export async function getBeginnerFriendlyRepos(
  count = DEFAULT_COUNT,
): Promise<RepoSummary[]> {
  const perQuery = count / 2;

  const [popularData, activeData] = await Promise.all([
    searchRepos("stars", perQuery),
    searchRepos("updated", perQuery),
  ]);

  const merged = mergeRepos(popularData.items, activeData.items);
  const repos = await fillToCount(merged, count);
  const reposWithReadmes = await attachReadmes(repos);

  await logGitHubApiResponse(
    {
      popular: { total_count: popularData.total_count, count: popularData.items.length },
      active: { total_count: activeData.total_count, count: activeData.items.length },
      mergedCount: merged.length,
    },
    reposForLog(reposWithReadmes),
  );

  return reposWithReadmes;
}
