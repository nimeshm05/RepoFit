import { getBeginnerFriendlyRepos } from "@/lib/github/getBeginnerFriendlyRepos";

import { RepoCard } from "@/app/components/repositories/RepoCard";
import { Text } from "@/app/components/ui/Text";

export default async function ReposPage() {
  const repos = await getBeginnerFriendlyRepos();

  return (
    <div className="min-h-full bg-background">
      <main className="flex flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <Text
            size="sm"
            weight="semibold"
            className="uppercase tracking-wide text-muted"
          >
            Dev catalog
          </Text>
          <Text as="h1" size="5xl">
            Beginner-friendly open source repositories
          </Text>
          <Text size="2xl" className="max-w-2xl">
            One hundred public repos with good first issues — a mix of popular
            projects and recently active ones to help you find your first
            contribution.
          </Text>
        </header>

        <ul className="flex flex-col gap-4">
          {repos.map((repo) => (
            <li key={repo.id}>
              <RepoCard repo={repo} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
