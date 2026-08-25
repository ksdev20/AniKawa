import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, locals }) => {
  try {
    const supabase = locals.supabase;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("PROFILE ACCESS", cookies.get("sb-access-token")?.value);

    if (authError) {
      console.error(
        "[Profile API] Failed to get authenticated user.",
        authError,
      );

      return new Response(
        JSON.stringify({
          error: "Authentication failed.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        `[Profile API] Failed to fetch profile for user ${user.id}.`,
        profileError,
      );

      return new Response(
        JSON.stringify({
          error: "Failed to fetch profile.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!profile) {
      console.error(
        `[Profile API] Profile row missing for authenticated user ${user.id}.`,
      );

      return new Response(
        JSON.stringify({
          error: "Profile not found.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Profile API] Unexpected server error.", error);

    return new Response(
      JSON.stringify({
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
