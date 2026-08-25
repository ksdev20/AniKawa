import { createHash } from "node:crypto";

/**
 * Creates a stable anonymous hash for guest emails.
 *
 * Used for:
 * - duplicate detection
 * - abuse prevention
 * - moderation history
 *
 * Never stores raw email.
 */
export function hashEmail(email: string): string | null {
  if (!email) {
    return null;
  }

  const secret = import.meta.env.GUEST_EMAIL_HASH_SECRET;

  if (!secret) {
    throw new Error("Missing GUEST_EMAIL_HASH_SECRET");
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return createHash("sha256").update(`${secret}:${normalized}`).digest("hex");
}
