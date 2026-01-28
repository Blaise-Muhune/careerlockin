import "server-only";

/**
 * Log admin dashboard access. Timestamp only; no IPs or user identifiers.
 */
export function logAdminAccess(): void {
  console.log("[admin] access", new Date().toISOString());
}
