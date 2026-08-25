import type { APIRoute } from "astro";

export const PATCH: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("profiles")
    .update(body)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
};
