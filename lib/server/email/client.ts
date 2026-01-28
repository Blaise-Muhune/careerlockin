import "server-only";
import { Resend } from "resend";
import { getEnv } from "@/lib/server/env";

let resend: Resend | null = null;

/**
 * Returns a Resend client. Uses RESEND_API_KEY from env.
 * Safe to call when key is missing (returns null); sendEmail will no-op.
 */
export function getEmailClient(): Resend | null {
  if (resend !== null) return resend;
  const key = getEnv().RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

/**
 * From address for transactional emails. Uses EMAIL_FROM_ADDRESS from env.
 * Example: "CareerLockin <noreply@careerlockin.com>"
 */
export function getEmailFromAddress(): string | null {
  return getEnv().EMAIL_FROM_ADDRESS ?? null;
}
