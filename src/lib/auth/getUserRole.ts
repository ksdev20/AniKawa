import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "guest" | "user" | "moderator" | "admin";

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<UserRole> {
  if (!userId) {
    return "guest";
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return "user";
  }

  return data.role;
}
