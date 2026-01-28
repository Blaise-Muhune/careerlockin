import "server-only";
import { getEmailClient, getEmailFromAddress } from "@/lib/server/email/client";

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Sends a plain-text or HTML email. Uses RESEND_API_KEY and EMAIL_FROM_ADDRESS.
 * If either is missing, returns { ok: false } without throwing.
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<SendEmailResult> {
  const client = getEmailClient();
  const from = getEmailFromAddress();
  if (!client || !from) {
    return { ok: false, error: "Email not configured (RESEND_API_KEY or EMAIL_FROM_ADDRESS)" };
  }
  try {
    const { error } = await client.emails.send({
      from,
      to,
      subject,
      text,
      html: html ?? undefined,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}
