import { createBrowserClient } from "@supabase/ssr";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );

  return browserClient;
}

export const supabase = getBrowserSupabaseClient();
