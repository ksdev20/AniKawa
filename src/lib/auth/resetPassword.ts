import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthResult, ResetPasswordInput } from "./types";

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<AuthResult> {
  try {
    const email = input.email.trim();

    if (!email) {
      return {
        data: null,
        error: "Please enter your email address.",
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
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
