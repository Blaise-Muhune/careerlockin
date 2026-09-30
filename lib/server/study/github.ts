import "server-only";
import { getEnv } from "@/lib/server/env";

const REPO_URL =
  /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

export type RepoInspection =
  | { ok: true; owner: string; repo: string; files: string[] }
  | { ok: false; error: string };

export function parseGithubRepoUrl(raw: string): { owner: string; repo: string } | null {
  const match = REPO_URL.exec(raw.trim());
  if (!match) return null;
  return { owner: match[1]!, repo: match[2]! };
}

export async function inspectPublicRepo(rawUrl: string): Promise<RepoInspection> {
  const parsed = parseGithubRepoUrl(rawUrl);
  if (!parsed) {
    return { ok: false, error: "Use a public GitHub link like https://github.com/owner/repo." };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CareerLockin",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = getEnv().GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      { headers, signal: AbortSignal.timeout(8000) }
    );
    if (repoResponse.status === 404) {
      return { ok: false, error: "That repository is private or does not exist." };
    }
    if (!repoResponse.ok) {
      return { ok: false, error: "GitHub did not return that repository." };
    }
    const repoBody: unknown = await repoResponse.json();
    const defaultBranch =
      typeof repoBody === "object" &&
      repoBody !== null &&
      "default_branch" in repoBody &&
      typeof (repoBody as { default_branch?: unknown }).default_branch === "string"
        ? (repoBody as { default_branch: string }).default_branch
        : "HEAD";

    const treeResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
      { headers, signal: AbortSignal.timeout(8000) }
    );
    if (!treeResponse.ok) {
      return { ok: false, error: "GitHub did not return the file list." };
    }
    const treeBody: unknown = await treeResponse.json();
    const tree =
      typeof treeBody === "object" &&
      treeBody !== null &&
      "tree" in treeBody &&
      Array.isArray((treeBody as { tree?: unknown }).tree)
        ? (treeBody as { tree: unknown[] }).tree
        : [];
    const files = tree
      .map((item) => {
        if (typeof item !== "object" || item === null) return null;
        const record = item as { path?: unknown; type?: unknown };
        if (record.type !== "blob" || typeof record.path !== "string") return null;
        return record.path;
      })
      .filter((path): path is string => path != null)
      .slice(0, 200);

    return { ok: true, owner: parsed.owner, repo: parsed.repo, files };
  } catch {
    return { ok: false, error: "GitHub timed out." };
  }
}
