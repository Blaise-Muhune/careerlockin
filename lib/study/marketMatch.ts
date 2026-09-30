const STOP = new Set([
  "with",
  "from",
  "that",
  "this",
  "your",
  "have",
  "will",
  "using",
  "into",
  "about",
  "learn",
  "build",
  "step",
  "work",
  "make",
]);

export function normalizeSignal(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stepMatchesMarket(
  title: string,
  description: string,
  signals: string[]
): boolean {
  const hay = `${title} ${description}`.toLowerCase();
  for (const signal of signals) {
    const normalized = normalizeSignal(signal);
    if (normalized.length < 4) continue;
    if (hay.includes(normalized)) return true;
    const words = normalized
      .split(" ")
      .filter((word) => word.length >= 4 && !STOP.has(word));
    if (words.length >= 2 && words.every((word) => hay.includes(word))) return true;
    if (words.length === 1 && words[0]!.length >= 5 && hay.includes(words[0]!)) {
      return true;
    }
  }
  return false;
}

export type MarketStep = {
  id: string;
  title: string;
  description: string;
  done: boolean;
};

export function optionalStepIds(input: {
  phases: Array<{ phaseOrder: number; steps: MarketStep[] }>;
  signals: string[];
}): { optionalIds: string[]; keepIds: string[] } {
  const optionalIds: string[] = [];
  const keepIds: string[] = [];
  if (input.signals.length < 5 || input.phases.length === 0) {
    return { optionalIds, keepIds };
  }
  const firstOrder = Math.min(...input.phases.map((phase) => phase.phaseOrder));
  for (const phase of input.phases) {
    for (const step of phase.steps) {
      if (step.done || phase.phaseOrder === firstOrder) {
        keepIds.push(step.id);
        continue;
      }
      if (stepMatchesMarket(step.title, step.description, input.signals)) {
        keepIds.push(step.id);
      } else {
        optionalIds.push(step.id);
      }
    }
  }
  return { optionalIds, keepIds };
}

const TECH_TERMS = [
  "react",
  "typescript",
  "javascript",
  "node",
  "python",
  "sql",
  "postgres",
  "aws",
  "docker",
  "kubernetes",
  "next.js",
  "css",
  "html",
  "git",
  "graphql",
  "redis",
  "terraform",
  "java",
  "golang",
  "rust",
  "figma",
  "playwright",
  "jest",
  "pytest",
  "django",
  "fastapi",
  "spring",
  "kotlin",
  "swift",
  "flutter",
  "android",
  "ios",
  "linux",
  "ci/cd",
  "azure",
  "gcp",
  "mongodb",
  "kafka",
  "spark",
  "pandas",
  "tensorflow",
  "pytorch",
  "tableau",
  "excel",
  "power bi",
  "snowflake",
  "dbt",
  "airflow",
  "selenium",
  "cypress",
  "accessibility",
  "oauth",
  "rest",
];

/** Pull repeated tool names out of job-post text. */
export function skillsFromPostings(texts: string[]): string[] {
  const hay = texts.join("\n").toLowerCase();
  return TECH_TERMS.filter((term) => {
    const count = hay.split(term).length - 1;
    return count >= 2;
  });
}

export function matchDeliverables(
  deliverables: string[],
  filePaths: string[]
): { matched: string[]; missing: string[] } {
  const files = filePaths.map((file) => file.toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];
  for (const deliverable of deliverables) {
    const words = normalizeSignal(deliverable)
      .split(" ")
      .filter((word) => word.length >= 4 && !STOP.has(word));
    const hit =
      words.length > 0 &&
      words.some((word) => files.some((file) => file.includes(word)));
    if (hit) matched.push(deliverable);
    else missing.push(deliverable);
  }
  return { matched, missing };
}
