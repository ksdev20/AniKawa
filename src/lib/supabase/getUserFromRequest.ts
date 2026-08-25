import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) {
    console.error("[getUserFromRequest]", error);

    return null;
  }

  return user;
}
