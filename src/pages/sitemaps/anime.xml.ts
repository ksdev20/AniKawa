import { animeSitemap } from "@/lib/sitemap/providers/anime";

export const prerender = false;

export async function GET() {
  const xml = await animeSitemap();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
