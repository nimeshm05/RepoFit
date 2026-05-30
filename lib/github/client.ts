const GITHUB_API = "https://api.github.com";

function buildHeaders(options?: RequestInit): HeadersInit {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };
}

async function githubRequest(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: buildHeaders(options),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      error?.message ?? `GitHub API error: ${response.status}`,
    );
  }

  return response;
}

export async function githubFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await githubRequest(path, options);
  return response.json() as Promise<T>;
}

export async function githubFetchText(
  path: string,
  options?: RequestInit,
): Promise<string> {
  const response = await githubRequest(path, options);
  return response.text();
}
