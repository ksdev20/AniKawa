import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthResult, ResendVerificationInput } from "./types";

export async function resendVerification(
  input: ResendVerificationInput,
): Promise<AuthResult> {
  try {
    const email = input.email.trim();

    if (!email) {
      return {
        data: null,
        error: "Please enter your email address.",
      };
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      return {
        data: null,
        error: getAuthErrorMessage(error),
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getAuthErrorMessage(error),
    };
  }
}
