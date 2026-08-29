import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import type { CreateNotificationInput } from "./types";

export async function createNotification(
  supabase: SupabaseClient<Database>,
  input: CreateNotificationInput,
) {
  if (!input.userId) {
    return null;
  }

  if (input.actorId && input.actorId === input.userId) {
    return null;
  }

  const { data, error } = await supabase.rpc(
    "rpc_create_notification",
    {
      p_user_id: input.userId,
      p_type: input.type,
      p_title: input.title,
      p_body: input.body ?? undefined,
      p_actor_id: input.actorId ?? undefined,
      p_url: input.url ?? undefined,
      p_data: input.data ?? {},
      p_dedupe_key: input.dedupeKey ?? undefined,
    },
  );

  if (error) {
    console.error(
      "[Notifications] Failed to create notification:",
      error,
    );

    throw error;
  }

  return data;
}