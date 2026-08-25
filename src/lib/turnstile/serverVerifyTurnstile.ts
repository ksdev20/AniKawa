export async function serverVerifyTurnstile(
  token: string,
  ip?: string,
): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }

    const secret = import.meta.env.TURNSTILE_COMMENT_SECRET_KEY;

    if (!secret) {
      console.error("[Turnstile] Missing secret key");

      return false;
    }

    const body = new URLSearchParams();

    body.append("secret", secret);

    body.append("response", token);

    if (ip) {
      body.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );

    const result = await response.json();

    console.log("[Turnstile result]", result);

    return result.success === true;
  } catch (error) {
    console.error("[Turnstile verify]", error);

    return false;
  }
}
