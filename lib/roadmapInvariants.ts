/**
 * Dev/sanity checks for roadmap resource invariants.
 * No server-only deps so scripts can import this.
 */

type ResourceLike = {
  url: string;
  source_id?: string;
  verification_status?: string | null;
};

type RoadmapLike = {
  phases: Array<{
    steps: Array<{ resources: ResourceLike[] }>;
  }>;
};

export function assertRoadmapInvariants(roadmap: RoadmapLike): void {
  for (const phase of roadmap.phases) {
    for (const step of phase.steps) {
      if (step.resources.length < 1) {
        throw new Error("Each step must have at least one resource after post-processing");
      }
      for (const r of step.resources) {
        if (!r.url.startsWith("https:")) {
          throw new Error(`Resource URL must be https: ${r.url}`);
        }
        const status = r.verification_status;
        if (status === "unverified") {
          throw new Error(`Unverified resources must not ship: ${r.url}`);
        }
        if (status !== "verified" && status !== "fallback" && status != null) {
          throw new Error(`Unexpected verification_status: ${status}`);
        }
      }
    }
  }
}
