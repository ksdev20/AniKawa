const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResponse {
  success: boolean;

  challenge_ts?: string;

  hostname?: string;

  error_codes?: string[];
}

export async function verifyTurnstile(
  token: string,
  request: Request,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secret = import.meta.env.TURNSTILE_COMMENT_SECRET_KEY;

  if (!secret) {
    console.error("Missing TURNSTILE_COMMENT_SECRET_KEY");

    return false;
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    undefined;

  const body = new URLSearchParams();

  body.append("secret", secret);

  body.append("response", token);

  if (ip) {
    body.append("remoteip", ip);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",

    body,
  });

  if (!response.ok) {
    console.error("Turnstile request failed", response.status);

    return false;
  }

  const result = (await response.json()) as TurnstileResponse;

  if (!result.success) {
    console.warn("Turnstile rejected", result.error_codes);
  }

  return result.success;
}
