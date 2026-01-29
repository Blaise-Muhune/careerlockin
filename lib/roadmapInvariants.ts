/**
 * Dev/sanity checks for roadmap resource invariants.
 * No server-only deps so scripts can import this.
 */

type ResourceLike = {
  url: string;
  source_id?: string;
  verification_status?: string;
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
        // source_id may be empty for unverified (model-provided) resources
      }
    }
  }
}
