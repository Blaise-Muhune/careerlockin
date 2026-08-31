import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logError } from "@/lib/server/logging";

export type ProductEventName =
  | "roadmap_generate_started"
  | "roadmap_regenerate_started"
  | "checkout_unlock_started"
  | "checkout_pro_started"
  | "profile_updated"
  | "roadmap_deleted"
  | "account_deleted";

/**
 * Fire-and-forget funnel event. Never throws to callers.
 */
export async function trackProductEvent(
  userId: string | null,
  eventName: ProductEventName,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("product_events").insert({
      user_id: userId,
      event_name: eventName,
      properties,
    });
    if (error) {
      void logError("product-events", error, { eventName });
    }
  } catch (err) {
    void logError("product-events", err, { eventName });
  }
}
