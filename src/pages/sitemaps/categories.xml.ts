import { categoriesSitemap } from "@/lib/sitemap/providers/categories";

export const prerender = false;

export async function GET() {
  const xml = await categoriesSitemap();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
