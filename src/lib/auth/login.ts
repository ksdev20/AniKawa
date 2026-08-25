import { supabase } from "@/lib/supabase/browser";
import { verifyTurnstile } from "./verifyTurnstile";
import { getAuthErrorMessage } from "./errors";
import type { AuthData, AuthResult, LoginInput } from "./types";

export async function login(input: LoginInput): Promise<AuthResult<AuthData>> {
  try {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocal) {
      if (!input.captchaToken) {
        return {
          data: null,
          error: "Please complete bot verification.",
        };
      }

      const captchaResult = await verifyTurnstile({
        token: input.captchaToken,
      });

      if (captchaResult.error) {
        return {
          data: null,
          error: captchaResult.error,
        };
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      return {
        data: null,
        error: getAuthErrorMessage(error),
      };
    }

    if (!data.user.email_confirmed_at) {
      return {
        data: null,
        error: "Please verify your email before logging in.",
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getAuthErrorMessage(error),
    };
  }
}
