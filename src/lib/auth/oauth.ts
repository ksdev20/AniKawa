import { supabase } from "@/lib/supabase/browser";

import { getAuthErrorMessage } from "./errors";
import type { AuthResult, OAuthProvider } from "./types";

export async function signInWithOAuth(
  provider: OAuthProvider,
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,

      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
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

export async function signInWithGoogle() {
  return signInWithOAuth("google");
}

export async function signInWithDiscord() {
  return signInWithOAuth("discord");
}
