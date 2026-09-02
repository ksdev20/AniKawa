import { defineMiddleware } from "astro:middleware";
import { updateSession } from "./lib/supabase/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  console.log("[MIDDLEWARE] START", context.url.pathname);

  try {
    await updateSession(context);

    console.log("[MIDDLEWARE] SESSION OK", {
      hasSupabase: !!context.locals.supabase,
      hasUser: !!context.locals.user,
    });
  } catch (error) {
    console.error("[MIDDLEWARE] SESSION FAILED", error);

    throw error;
  }

  return next();
});
