/**
 * Role-family market guidance injected into generation prompts.
 */

export type RoleFamily =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "data"
  | "ml"
  | "devops"
  | "security"
  | "product"
  | "design"
  | "qa"
  | "general";

export function detectRoleFamily(targetRole: string): RoleFamily {
  const r = targetRole.toLowerCase();
  if (/react native|ios|android|mobile|flutter/.test(r)) return "mobile";
  if (/front.?end|ui engineer/.test(r)) return "frontend";
  if (/back.?end|api engineer/.test(r)) return "backend";
  if (/full.?stack/.test(r)) return "fullstack";
  if (
    /data scientist|machine learning|ml engineer|ai engineer|deep learning/.test(
      r
    )
  ) {
    return "ml";
  }
  if (/data engineer|data analyst|analytics engineer|\bbi\b/.test(r)) {
    return "data";
  }
  if (/devops|sre|site reliability|cloud engineer|platform engineer/.test(r)) {
    return "devops";
  }
  if (/security|appsec|infosec/.test(r)) return "security";
  if (/product manager|product owner|program manager/.test(r)) return "product";
  if (/ux|ui design|product design|figma/.test(r)) return "design";
  if (/qa|quality assurance|test engineer|sdet/.test(r)) return "qa";
  if (/software engineer|software developer|\bengineer\b/.test(r)) {
    return "fullstack";
  }
  return "general";
}

const GUIDANCE: Record<RoleFamily, string[]> = {
  frontend: [
    "Prefer current FE stack: TypeScript, modern React, Next.js App Router when relevant, a11y, performance, testing (Vitest/Jest + Playwright), component systems.",
    "Do NOT default to Redux unless the JD requires it; prefer TanStack Query or framework data fetching.",
    "Use react.dev (never reactjs.org). Prefer official docs over listicles.",
    "FE interview prep: JS fundamentals, UI debugging, frontend system design — not only LeetCode/CtCI.",
    "Projects: design-system work, auth-gated dashboards, API integration, perf/a11y hardening, production deploy.",
  ],
  backend: [
    "Prefer APIs, data modeling, auth/authz, observability, queues, migrations, production hardening.",
    "Match stacks to the JD. Include testing and deployment.",
    "Interview: API design, debugging, data modeling, practical system design.",
  ],
  fullstack: [
    "Balance UI + API + data + deploy. Prefer end-to-end features that ship.",
    "Use current web stacks from the JD. Avoid outdated defaults.",
  ],
  mobile: [
    "Platform idioms, offline, navigation, store release, testing, performance.",
    "Projects should feel like shipped app features.",
  ],
  data: [
    "SQL, modeling, pipelines/ELT, dashboards, data quality, stakeholder storytelling.",
    "Prefer hands-on analysis over certificate-only paths.",
  ],
  ml: [
    "Problem framing, metrics, leakage avoidance, baselines, shipping inference.",
    "Production ML concerns when role is engineer-oriented.",
  ],
  devops: [
    "CI/CD, IaC, containers/k8s as relevant, observability, incident response.",
    "Automate real delivery paths.",
  ],
  security: [
    "Threat modeling, secure SDLC, auth flaws, logging/monitoring, remediation.",
  ],
  product: [
    "Discovery, PRDs, prioritization, metrics, stakeholder management, shipping.",
    "Prefer artifacts hiring managers recognize over MBA fluff.",
  ],
  design: [
    "Research to flows to high-fidelity UI to handoff to usability validation.",
  ],
  qa: [
    "Test strategy, automation, exploratory testing, risk-based coverage.",
  ],
  general: [
    "Anchor phases in real current-market job tasks for this role.",
    "Prefer official docs; avoid outdated defaults and filler.",
  ],
};

export function getMarketGuidanceLines(targetRole: string): string[] {
  const family = detectRoleFamily(targetRole);
  return [`Role family: ${family}`, ...GUIDANCE[family]];
}
