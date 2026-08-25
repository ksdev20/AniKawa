import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const { access_token, refresh_token } = body;

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({
          error: "Invalid session",
        }),
        {
          status: 400,
        },
      );
    }

    /*
      Verify token before trusting it
    */
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },

        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid authentication",
        }),
        {
          status: 401,
        },
      );
    }

    /*
      Now safe to store cookies
    */

    cookies.set("sb-access-token", access_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    console.log(
      "✅SYNC COOKIE SET",
      access_token.slice(0, 20),
      refresh_token.slice(0, 20),
    );

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[AUTH SYNC]", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
      },
    );
  }
};
