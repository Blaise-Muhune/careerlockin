/**
 * Dev-only sanity check: roadmap resource invariants.
 * Run: pnpm run test:roadmap
 * Asserts: every resource url is https, every resource has source_id.
 */

import { assertRoadmapInvariants } from "../lib/roadmapInvariants";

const validRoadmap = {
  phases: [
    {
      steps: [
        {
          resources: [
            {
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
              source_id: "src_01",
              verification_status: "verified" as const,
            },
            {
              url: "https://www.youtube.com/playlist?list=example",
              source_id: "src_02",
              verification_status: "verified" as const,
            },
          ],
        },
      ],
    },
  ],
};

assertRoadmapInvariants(validRoadmap);
console.log("OK: valid roadmap passed invariant checks (https + source_id)");

let invalidThrew = false;
try {
  assertRoadmapInvariants({
    phases: [
      {
        steps: [
          {
            resources: [
              {
                url: "http://example.com/not-https",
                source_id: "src_01",
                verification_status: "verified",
              },
            ],
          },
        ],
      },
    ],
  });
} catch {
  invalidThrew = true;
}
if (!invalidThrew) {
  process.exit(1);
}
console.log("OK: invalid roadmap (http) correctly rejected");

console.log("All roadmap invariant checks passed.");