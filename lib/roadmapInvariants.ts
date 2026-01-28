/**
 * Dev/sanity checks for roadmap resource invariants.
 * No server-only deps so scripts can import this.
 */

type ResourceLike = {
  url: string;
  source_id?: string;
  verification_status?: string;
  is_fallback?: boolean;
};

type RoadmapLike = {
  phases: Array<{
    steps: Array<{ resources: ResourceLike[] }>;
  }>;
};

export function assertRoadmapInvariants(roadmap: RoadmapLike): void {
  for (const phase of roadmap.phases) {
    for (const step of phase.steps) {
      for (const r of step.resources) {
        if (!r.url.startsWith("https:")) {
          throw new Error(`Resource URL must be https: ${r.url}`);
        }
        const hasSourceId = r.source_id != null && String(r.source_id).length > 0;
        if (!hasSourceId && !r.is_fallback && r.verification_status !== "fallback") {
          throw new Error(`Resource must have source_id or be fallback: ${r.url}`);
        }
      }
    }
  }
}
