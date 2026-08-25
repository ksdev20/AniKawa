import { supabase } from "@/lib/supabase";

import type { Tables, Updates } from "@/lib/supabase";

type EditableProfileFields = Pick<
  Updates<"profiles">,
  | "username"
  | "display_name"
  | "avatar_url"
  | "banner_url"
  | "bio"
  | "about"
  | "watching_since"
  | "gender"
  | "country"
>;

export async function updateProfile(
  updates: EditableProfileFields,
): Promise<Tables<"profiles"> | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const payload: EditableProfileFields = {
      ...updates,
    };

    if (payload.username !== undefined) {
      payload.username = payload.username.trim().toLowerCase();
    }

    if (typeof payload.display_name === "string") {
      payload.display_name = payload.display_name.trim();
    }

    if (typeof payload.bio === "string") {
      payload.bio = payload.bio.trim();
    }

    if (typeof payload.about === "string") {
      payload.about = payload.about.trim();
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("[updateProfile]", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[updateProfile]", error);
    return null;
  }
}
