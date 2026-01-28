import "server-only";

/**
 * Plain-text body for the phase-completion milestone email.
 * Celebratory but restrained. No hype.
 */
export function buildMilestoneBody(
  phaseName: string,
  dashboardUrl: string
): string {
  const lines: string[] = [];
  lines.push(`You finished ${phaseName}.`);
  lines.push("");
  lines.push("That phase built a solid base for what comes next.");
  lines.push("");
  lines.push(`View dashboard: ${dashboardUrl}`);
  return lines.join("\n");
}
