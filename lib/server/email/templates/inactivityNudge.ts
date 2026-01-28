import "server-only";

/**
 * Plain-text body for the inactivity nudge email.
 * Calm, no guilt. Suggests a small restart.
 */
export function buildInactivityNudgeBody(dashboardUrl: string): string {
  const lines: string[] = [];
  lines.push("You haven't logged time in a week. No pressure.");
  lines.push("");
  lines.push("When you're ready, 15 minutes is enough to pick up where you left off.");
  lines.push("");
  lines.push(`View dashboard: ${dashboardUrl}`);
  return lines.join("\n");
}
