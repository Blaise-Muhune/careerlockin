/**
 * Dev-only sanity check: roadmap resource invariants.
 * Run: pnpm run test:roadmap
 * Asserts: every resource url is https, every resource has source_id or is fallback.
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
              is_fallback: false,
            },
            {
              url: "https://www.youtube.com/playlist?list=example",
              source_id: "src_02",
              verification_status: "verified" as const,
              is_fallback: false,
            },
          ],
        },
        {
          resources: [
            {
              url: "https://developer.mozilla.org/en-US/docs/Web",
              source_id: "",
              verification_status: "fallback" as const,
              is_fallback: true,
            },
          ],
        },
      ],
    },
  ],
};

assertRoadmapInvariants(validRoadmap);
console.log("OK: valid roadmap passed invariant checks (https + source_id or fallback)");

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
                is_fallback: false,
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