import type { APIContext } from "astro";
import { createServerSupabaseClient } from "./server";

export async function updateSession(context: APIContext) {
  const supabase = createServerSupabaseClient(context);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  context.locals.supabase = supabase;

  context.locals.session = session;

  context.locals.user = session?.user ?? null;
}
