import type { APIContext } from "astro";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import { createCookieAdapter } from "./cookieAdapter";

export function createServerSupabaseClient(context: APIContext) {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: createCookieAdapter(context),

    auth: {
      flowType: "pkce",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
