import { describe, expect, it } from "vitest";
import {
  decideStripeEventClaim,
  isCheckoutSessionPaid,
} from "@/lib/server/stripe/webhook-utils";

describe("decideStripeEventClaim", () => {
  it("returns already_processed when processed_at is set", () => {
    expect(
      decideStripeEventClaim({ processed_at: "2026-01-01T00:00:00.000Z" })
    ).toBe("already_processed");
  });

  it("returns claimed when row is missing", () => {
    expect(decideStripeEventClaim(null)).toBe("claimed");
  });

  it("returns claimed when processed_at is null (failed prior attempt)", () => {
    expect(decideStripeEventClaim({ processed_at: null })).toBe("claimed");
  });
});

describe("isCheckoutSessionPaid", () => {
  it("accepts paid and no_payment_required", () => {
    expect(isCheckoutSessionPaid("paid")).toBe(true);
    expect(isCheckoutSessionPaid("no_payment_required")).toBe(true);
  });

  it("rejects unpaid statuses", () => {
    expect(isCheckoutSessionPaid("unpaid")).toBe(false);
    expect(isCheckoutSessionPaid(null)).toBe(false);
    expect(isCheckoutSessionPaid(undefined)).toBe(false);
  });
});
