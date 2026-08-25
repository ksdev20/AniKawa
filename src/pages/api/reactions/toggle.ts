import type { APIRoute } from "astro";

import { createServerSupabaseClient } from "@/lib/supabase";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();

    const { episodeId, reactionId, guestId } = body;

    if (typeof episodeId !== "string" || typeof reactionId !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createServerSupabaseClient(context);

    let user = null;

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError) {
      user = authUser;
    }

    if (!user && !guestId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Guest ID required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    let query = supabase
      .from("episode_reactions")
      .select("id")
      .eq("episode_id", episodeId)
      .eq("reaction_id", reactionId);

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("guest_id", guestId!);
    }

    const { data: existing, error: existingError } = await query.maybeSingle();

    if (existingError) {
      console.error(existingError);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed checking reaction.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (existing) {
      const { error } = await supabase
        .from("episode_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error(error);

        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed removing reaction.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: "removed",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { error } = await supabase.from("episode_reactions").insert({
      episode_id: episodeId,
      reaction_id: reactionId,
      user_id: user?.id ?? null,
      guest_id: user ? null : guestId,
    });

    if (error) {
      console.error(error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed saving reaction.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: "added",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("[POST /api/reactions/toggle]", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
