import type { APIRoute } from "astro";

import { createServerSupabaseClient } from "@/lib/supabase";

import { getEpisodeReactions } from "@/lib/reactions/getEpisodeReactions";

export const GET: APIRoute = async (context) => {
  // console.log("[reactions] START");

  const episodeId = context.params.episodeId;

  if (!episodeId) {
    return new Response(
      JSON.stringify({
        error: "Episode ID missing",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const supabase = createServerSupabaseClient(context);

    // console.log("[reactions] client created", Date.now() - start);

    const reactions = await getEpisodeReactions(supabase, episodeId);

    // console.log("[reactions] db finished", Date.now() - start);

    return new Response(JSON.stringify(reactions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[GET /api/reactions]", error);

    return new Response(
      JSON.stringify({
        error: "Failed loading reactions",
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
