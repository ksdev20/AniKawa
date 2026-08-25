import { createHmac } from "node:crypto";

const MAX_USER_AGENT_LENGTH = 1000;

function cleanHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();

  return cleaned ? cleaned : null;
}

export function getLoginLocation(request: Request) {
  const countryCode =
    cleanHeaderValue(
      request.headers.get("x-vercel-ip-country"),
    )?.toUpperCase() ?? null;

  const region =
    cleanHeaderValue(request.headers.get("x-vercel-ip-country-region")) ?? null;

  const city =
    cleanHeaderValue(request.headers.get("x-vercel-ip-city")) ?? null;

  return {
    countryCode,
    region,
    city,
  };
}

export function getClientIp(request: Request): string | null {
  const realIp = cleanHeaderValue(request.headers.get("x-real-ip"));

  if (realIp) {
    return realIp;
  }

  const forwardedFor = cleanHeaderValue(request.headers.get("x-forwarded-for"));

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return null;
}

export function hashClientIp(ip: string | null): string | null {
  if (!ip) {
    return null;
  }

  const secret = import.meta.env.LOGIN_SECURITY_IP_SECRET;

  if (!secret) {
    throw new Error("LOGIN_SECURITY_IP_SECRET is not configured");
  }

  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function getUserAgent(request: Request): string | null {
  const userAgent = cleanHeaderValue(request.headers.get("user-agent"));

  if (!userAgent) {
    return null;
  }

  return userAgent.slice(0, MAX_USER_AGENT_LENGTH);
}
