import type { APIRoute } from "astro";

type VoteValue = 1 | -1 | null;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);

  const episodeId = url.searchParams.get("episodeId");

  if (!episodeId) {
    return Response.json({ error: "episodeId is required" }, { status: 400 });
  }

  const guestId = url.searchParams.get("guestId");

  const userId = locals.user?.id ?? null;

  /*
    Get vote counts
  */

  const { data: counts, error: countsError } = await locals.supabase
    .from("episode_votes")
    .select("vote")
    .eq("episode_id", episodeId);

  if (countsError) {
    console.error(countsError);

    return Response.json({ error: "Failed to fetch votes" }, { status: 500 });
  }

  let likes = 0;
  let dislikes = 0;

  for (const row of counts) {
    if (row.vote === 1) likes++;
    else if (row.vote === -1) dislikes++;
  }

  /*
    Current user's vote
  */

  let myVote: VoteValue = null;

  if (userId || guestId) {
    let query = locals.supabase
      .from("episode_votes")
      .select("vote")
      .eq("episode_id", episodeId);

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("guest_id", guestId!);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(error);

      return Response.json(
        { error: "Failed to fetch user vote" },
        { status: 500 },
      );
    }

    const vote = data?.vote;

    myVote = vote === 1 || vote === -1 ? vote : null;
  }

  return Response.json({
    episodeId,
    likes,
    dislikes,
    myVote,
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json();

  const episodeId = body.episodeId as string | undefined;
  const vote = body.vote as VoteValue;

  if (!episodeId) {
    return Response.json({ error: "episodeId is required" }, { status: 400 });
  }

  if (![1, -1, null].includes(vote)) {
    return Response.json({ error: "Invalid vote" }, { status: 400 });
  }

  const userId = locals.user?.id ?? null;

  const guestId = userId ? null : (body.guestId as string | null);

  if (!userId && !guestId) {
    return Response.json({ error: "guestId required" }, { status: 400 });
  }

  /*
    Find existing vote
  */

  let existingQuery = locals.supabase
    .from("episode_votes")
    .select("id, vote")
    .eq("episode_id", episodeId);

  existingQuery = userId
    ? existingQuery.eq("user_id", userId)
    : existingQuery.eq("guest_id", guestId!);

  const { data: existing, error: existingError } =
    await existingQuery.maybeSingle();

  if (existingError) {
    console.error(existingError);

    return Response.json(
      { error: "Failed to fetch existing vote" },
      { status: 500 },
    );
  }

  /*
    Toggle off
  */

  /*
  Apply vote
*/

  if (vote === null) {
    // Remove vote

    if (existing) {
      const { error } = await locals.supabase
        .from("episode_votes")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error(error);

        return Response.json(
          { error: "Failed to remove vote" },
          { status: 500 },
        );
      }
    }
  } else if (!existing) {
    // First vote

    const { error } = await locals.supabase.from("episode_votes").insert({
      episode_id: episodeId,
      user_id: userId,
      guest_id: guestId,
      vote,
    });

    if (error) {
      console.error(error);

      return Response.json({ error: "Failed to add vote" }, { status: 500 });
    }
  } else {
    // Change existing vote

   await locals.supabase
      .from("episode_votes")
      .update({
        vote,
      })
      .eq("id", existing.id)
      .select();

  }

  /*
    Fresh counts
  */

  const { data: votes, error: countError } = await locals.supabase
    .from("episode_votes")
    .select("vote")
    .eq("episode_id", episodeId);

  if (countError) {
    console.error(countError);

    return Response.json({ error: "Failed to count votes" }, { status: 500 });
  }

  let likes = 0;
  let dislikes = 0;

  for (const row of votes) {
    if (row.vote === 1) likes++;

    if (row.vote === -1) dislikes++;
  }

  return Response.json({
    episodeId,
    likes,
    dislikes,
    myVote: vote,
  });
};
