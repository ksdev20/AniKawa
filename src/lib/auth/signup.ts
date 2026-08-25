import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthData, AuthResult, SignupInput } from "./types";

import { verifyTurnstile } from "./verifyTurnstile";

export async function signup(
  input: SignupInput,
): Promise<AuthResult<AuthData>> {
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

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),

      password: input.password,

      options: {
        data: {
          full_name: input.displayName.trim(),
        },
      },
    });

    if (error) {
      return {
        data: null,
        error: getAuthErrorMessage(error),
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
