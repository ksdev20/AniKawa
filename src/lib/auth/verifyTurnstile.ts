import type { AuthResult, VerifyTurnstileInput, VerifyTurnstileResponse } from "./types";

export async function verifyTurnstile(
  input: VerifyTurnstileInput,
): Promise<AuthResult<boolean>> {
  try {
    if (!input.token) {
      return {
        data: false,
        error: "Please complete bot verification.",
      };
    }

    const response = await fetch("/api/verify-turnstile", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        token: input.token,
      }),
    });

    if (!response.ok) {
      return {
        data: false,
        error: "Verification service unavailable. Try again.",
      };
    }

    const data = (await response.json()) as VerifyTurnstileResponse;

    if (!data.success) {
      return {
        data: false,
        error: "Bot verification failed.",
      };
    }

    return {
      data: true,
      error: null,
    };
  } catch {
    return {
      data: false,
      error: "Verification failed. Try again.",
    };
  }
}
