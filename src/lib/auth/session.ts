import { supabase } from "@/lib/supabase/browser";
import type { Session, User } from "@supabase/supabase-js";

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  return session?.user ?? null;
}
