import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const monthAgo = new Date();

  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { count } = await supabase
    .from("username_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthAgo.toISOString());

  return new Response(
    JSON.stringify({
      used: count ?? 0,
      remaining: Math.max(0, 3 - (count ?? 0)),
    }),
  );
};
