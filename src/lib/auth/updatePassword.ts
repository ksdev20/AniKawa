import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthResult, UpdatePasswordInput } from "./types";

export async function updatePassword(
  input: UpdatePasswordInput,
): Promise<AuthResult> {
  try {
    const password = input.password.trim();

    if (!password) {
      return {
        data: null,
        error: "Please enter a password.",
      };
    }

    if (password.length < 8) {
      return {
        data: null,
        error: "Password must contain at least 8 characters.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password,
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
