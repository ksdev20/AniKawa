import { defineMiddleware } from "astro:middleware";
import { updateSession } from "./lib/supabase/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  await updateSession(context);
  return next();
});
