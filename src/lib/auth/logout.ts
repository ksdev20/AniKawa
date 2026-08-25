import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthResult } from "./types";

export async function logout(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

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
