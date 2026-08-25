import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase";

export async function getProfileByUsername(
  username: string,
): Promise<Tables<"profiles"> | null> {
  try {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (error) {
      console.error("[getProfileByUsername]", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[getProfileByUsername]", error);
    return null;
  }
}
