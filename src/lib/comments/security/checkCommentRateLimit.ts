import { checkRateLimit } from "@/lib/server/rateLimit";

import { COMMENT_RATE_LIMITS } from "./rateLimitConfig";

export type CommentRateLimitRole = "guest" | "user" | "moderator" | "admin";

export interface CheckCommentRateLimitInput {
  role: CommentRateLimitRole;

  userId: string | null;

  guestId: string | null;
}

export async function checkCommentRateLimit({
  role,
  userId,
  guestId,
}: CheckCommentRateLimitInput) {
  switch (role) {
    case "admin":
    case "moderator":
      if (!userId) {
        throw new Error("Moderator/Admin user id missing.");
      }

      return checkRateLimit({
        key: `comment:moderator:${userId}`,

        ...COMMENT_RATE_LIMITS.moderator,
      });

    case "user":
      if (!userId) {
        throw new Error("User id missing.");
      }

      return checkRateLimit({
        key: `comment:user:${userId}`,

        ...COMMENT_RATE_LIMITS.user,
      });

    case "guest":
      if (!guestId) {
        throw new Error("Guest id missing.");
      }

      return checkRateLimit({
        key: `comment:guest:${guestId}`,

        ...COMMENT_RATE_LIMITS.guest,
      });

    default: {
      const exhaustiveCheck: never = role;

      throw new Error(`Unsupported role: ${exhaustiveCheck}`);
    }
  }
}
