import { createHash } from "node:crypto";

export function hashIp(ip: string): string {
  const secret = import.meta.env.IP_HASH_SECRET;

  if (!secret) {
    throw new Error("Missing IP_HASH_SECRET");
  }

  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}
