export type RepoCategory = "popular" | "active";

export interface RepoSummary {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  openIssues: number;
  updatedAt: string;
  categories: RepoCategory[];
  readme: string | null;
  readmeUrl: string | null;
}

export interface GitHubSearchRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  updated_at: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchRepoItem[];
}
