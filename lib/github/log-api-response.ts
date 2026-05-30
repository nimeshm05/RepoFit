import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "github-api-response.json");

interface GitHubApiLog {
  timestamp: string;
  raw: unknown;
  mapped: unknown;
}

export async function logGitHubApiResponse(
  raw: unknown,
  mapped: unknown,
): Promise<void> {
  const payload: GitHubApiLog = {
    timestamp: new Date().toISOString(),
    raw,
    mapped,
  };
  const json = JSON.stringify(payload, null, 2);

  console.log("\n[GitHub API] Response logged");
  console.log(`[GitHub API] ${json.length.toLocaleString()} characters`);

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  await mkdir(LOG_DIR, { recursive: true });
  await writeFile(LOG_FILE, json, "utf-8");
  console.log(`[GitHub API] Saved to ${LOG_FILE}\n`);
}
