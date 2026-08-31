/**
 * Pure helpers for roadmap URL grounding and hour quality.
 * Kept free of server-only so unit tests can import them.
 */

/** Normalize URL for exact grounding comparison. */
export function normalizeSourceUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    const params = parsed.searchParams;
    for (const key of [...params.keys()]) {
      if (
        key.startsWith("utm_") ||
        key === "ref" ||
        key === "ref_src" ||
        key === "source"
      ) {
        params.delete(key);
      }
    }
    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return url.trim();
  }
}

export function getUrlHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Legacy hosts we rewrite to current canonical docs before grounding. */
const HOST_REWRITES: Array<{ from: RegExp; toHost: string; toPath?: string }> = [
  {
    from: /^reactjs\.org$/i,
    toHost: "react.dev",
    toPath: "/learn",
  },
  {
    from: /^facebook\.github\.io$/i,
    toHost: "react.dev",
    toPath: "/learn",
  },
];

/**
 * Rewrite known-outdated resource URLs to current canonical hosts.
 */
export function rewriteLegacyResourceUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    for (const rule of HOST_REWRITES) {
      if (rule.from.test(host)) {
        u.hostname = rule.toHost;
        if (rule.toPath && (u.pathname === "/" || /docs\/optimizing|docs\/testing|docs\/hello/i.test(u.pathname))) {
          u.pathname = rule.toPath;
        } else if (host === "reactjs.org" && u.pathname.startsWith("/docs")) {
          u.pathname = u.pathname.replace(/^\/docs/, "") || "/learn";
          if (u.pathname === "/" || u.pathname === "") u.pathname = "/learn";
        }
        return u.toString().replace(/\/$/, "");
      }
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * Match resource URL to web_search sources:
 * 1) exact normalized URL
 * 2) same host as any search source (domain-grounded)
 */
export function findSourceIdForUrl(
  url: string,
  normalizedToSourceId: Map<string, string>,
  hostToSourceId: Map<string, string>
): string | null {
  const rewritten = rewriteLegacyResourceUrl(url);
  const exact = normalizedToSourceId.get(normalizeSourceUrl(rewritten));
  if (exact) return exact;
  const host = getUrlHost(rewritten);
  if (!host) return null;
  return hostToSourceId.get(host) ?? null;
}

export function buildGroundingIndexes(
  sources: Iterable<{ id: string; url: string }>
): {
  normalizedToSourceId: Map<string, string>;
  hostToSourceId: Map<string, string>;
} {
  const normalizedToSourceId = new Map<string, string>();
  const hostToSourceId = new Map<string, string>();
  for (const { id, url } of sources) {
    const norm = normalizeSourceUrl(url);
    normalizedToSourceId.set(norm, id);
    const host = getUrlHost(url);
    if (host && !hostToSourceId.has(host)) {
      hostToSourceId.set(host, id);
    }
  }
  return { normalizedToSourceId, hostToSourceId };
}

type HoursPhase = {
  phase_project: { estimated_time_hours: number };
  steps: Array<{ est_hours: number; title: string; description: string }>;
};

/**
 * Detect when the model padded every step with the same hour value.
 */
export function isUniformStepHours(hours: number[]): boolean {
  if (hours.length < 3) return false;
  const first = hours[0];
  const same = hours.filter((h) => Math.abs(h - first) < 0.05).length;
  return same / hours.length >= 0.75;
}

/** Heuristic weight for redistributing hours within a phase. */
function stepWeight(title: string, description: string, index: number, total: number): number {
  const text = `${title} ${description}`.toLowerCase();
  let w = 1 + index / Math.max(total, 1); // later steps slightly heavier
  if (/project|build|implement|deploy|integrate|portfolio|interview|system design/.test(text)) {
    w += 0.6;
  }
  if (/intro|overview|fundamentals|basics|git |version control|deepen javascript/.test(text)) {
    w -= 0.35;
  }
  if (/test|a11y|accessib|performance|security|observab/.test(text)) {
    w += 0.35;
  }
  return Math.max(0.4, w);
}

/**
 * If step hours are uniform, redistribute within each phase.
 * Projects target ~30% of phase time (clamped).
 */
export function diversifyPhaseHours<T extends HoursPhase>(phases: T[]): T[] {
  return phases.map((phase) => {
    const stepHours = phase.steps.map((s) => s.est_hours);
    if (!isUniformStepHours(stepHours) && !isUniformStepHours([
      ...stepHours,
      phase.phase_project.estimated_time_hours,
    ])) {
      // Still fix when project hours == sum of identical steps often equals each step * N
      const allSameAsProject =
        stepHours.length > 0 &&
        stepHours.every((h) => Math.abs(h - stepHours[0]) < 0.05) &&
        Math.abs(phase.phase_project.estimated_time_hours - stepHours[0] * stepHours.length) < 0.5;
      if (!allSameAsProject && !isUniformStepHours(stepHours)) {
        return phase;
      }
    }

    const phaseTotal =
      phase.phase_project.estimated_time_hours +
      phase.steps.reduce((sum, s) => sum + s.est_hours, 0);
    if (phaseTotal <= 0) return phase;

    const projectShare = Math.min(
      Math.max(phaseTotal * 0.3, phaseTotal * 0.2),
      phaseTotal * 0.45
    );
    const stepsBudget = Math.max(phaseTotal - projectShare, phase.steps.length);
    const weights = phase.steps.map((s, i) =>
      stepWeight(s.title, s.description, i, phase.steps.length)
    );
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    const steps = phase.steps.map((step, i) => ({
      ...step,
      est_hours: Math.max(
        1,
        Number(((stepsBudget * weights[i]) / weightSum).toFixed(1))
      ),
    }));

    return {
      ...phase,
      phase_project: {
        ...phase.phase_project,
        estimated_time_hours: Math.max(1, Number(projectShare.toFixed(1))),
      },
      steps,
    };
  });
}
