import type { APIContext } from "astro";
import type { CookieMethodsServer } from "@supabase/ssr";

export function createCookieAdapter(context: APIContext): CookieMethodsServer {
  return {
    getAll() {
      const header = context.request.headers.get("cookie");

      if (!header) {
        return [];
      }

      return header
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .map((cookie) => {
          const index = cookie.indexOf("=");

          const name = cookie.slice(0, index);

          const value = decodeURIComponent(cookie.slice(index + 1));

          return {
            name,
            value,
          };
        });
    },

    setAll(cookies) {
      for (const cookie of cookies) {
        context.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    },
  };
}
