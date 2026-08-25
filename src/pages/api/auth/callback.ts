import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const { url, redirect } = context;

  const code = url.searchParams.get("code");

  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return redirect("/?auth_error=missing_code");
  }

  const supabase = context.locals.supabase;

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[AUTH CALLBACK]", error);

    return redirect(`/?auth_error=${encodeURIComponent(error.message)}`);
  }

  return redirect(next);
};
