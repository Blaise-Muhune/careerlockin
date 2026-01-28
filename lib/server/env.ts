import "server-only";
import { z } from "zod";

/**
 * Runtime env validation (fail fast). Use only from server code.
 * Never expose server-only keys to the client.
 */

const required = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
  ROADMAP_UNLOCK_PRICE_ID: z.string().min(1, "ROADMAP_UNLOCK_PRICE_ID is required"),
  PRO_SUBSCRIPTION_PRICE_ID: z.string().min(1, "PRO_SUBSCRIPTION_PRICE_ID is required"),
});

const optional = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM_ADDRESS: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  ADMIN_PRO_MONTHLY_CENTS: z.string().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  BING_SITE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
});

const fullSchema = required.merge(optional).superRefine((data, ctx) => {
  const site = data.NEXT_PUBLIC_SITE_URL ?? data.NEXT_PUBLIC_APP_URL;
  if (!site || site.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one of NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL is required",
      path: ["NEXT_PUBLIC_SITE_URL"],
    });
  }
});

type Input = z.infer<typeof required> & z.infer<typeof optional>;

function getRaw(): Input {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    ROADMAP_UNLOCK_PRICE_ID: process.env.ROADMAP_UNLOCK_PRICE_ID,
    PRO_SUBSCRIPTION_PRICE_ID: process.env.PRO_SUBSCRIPTION_PRICE_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_PRO_MONTHLY_CENTS: process.env.ADMIN_PRO_MONTHLY_CENTS,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    BING_SITE_VERIFICATION: process.env.BING_SITE_VERIFICATION,
    NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  } as Input;
}

let cached: z.infer<typeof fullSchema> | null = null;

/**
 * Validated env. Throws on first use if required vars are missing.
 * Call only from server code (lib/server, app/api, app/actions, etc.).
 */
export function getEnv(): z.infer<typeof fullSchema> {
  if (cached) return cached;
  const parsed = fullSchema.safeParse(getRaw());
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const msg = first?.message ?? parsed.error.message;
    throw new Error(`Env validation failed: ${msg}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Typed env object. Use getEnv() so validation runs on first access.
 * Exported type for consumers that want Env type without calling getEnv in types.
 */
export type Env = z.infer<typeof fullSchema>;

/** Base URL for redirects and links (NEXT_PUBLIC_SITE_URL ?? NEXT_PUBLIC_APP_URL). */
export function getBaseUrl(): string {
  const e = getEnv();
  return (e.NEXT_PUBLIC_SITE_URL ?? e.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}
