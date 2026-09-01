/** Founder emails with admin dashboard access (mirrors migration 00022). */
export const ADMIN_ALLOWLIST_EMAILS = [
  "blaisemu007@gmail.com",
  "muyumba@andrews.edu",
] as const;

const allowSet = new Set(
  ADMIN_ALLOWLIST_EMAILS.map((email) => email.toLowerCase())
);

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowSet.has(email.trim().toLowerCase());
}
