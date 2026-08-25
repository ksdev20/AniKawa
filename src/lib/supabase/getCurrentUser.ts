import type { APIContext } from "astro";

import { createServerSupabaseClient } from "./server";

export async function getCurrentUser(context: APIContext) {
  const supabase = createServerSupabaseClient(context);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}
