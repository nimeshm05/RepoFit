import { githubFetchText } from "./client";

const README_PREVIEW_LENGTH = 800;

export interface RepoReadme {
  content: string | null;
  url: string | null;
}

export function truncateReadme(content: string, maxLength = README_PREVIEW_LENGTH): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trimEnd()}…`;
}

export async function getRepoReadme(fullName: string): Promise<RepoReadme> {
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    return { content: null, url: null };
  }

  try {
    const content = await githubFetchText(`/repos/${owner}/${repo}/readme`, {
      headers: { Accept: "application/vnd.github.raw" },
    });

    return {
      content,
      url: `https://github.com/${fullName}#readme`,
    };
  } catch {
    return { content: null, url: null };
  }
}
