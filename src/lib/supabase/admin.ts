import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
}

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);
