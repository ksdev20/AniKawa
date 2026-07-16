import { subcategoriesSitemap } from "@/lib/sitemap/providers/subCategories";

export const prerender = false;

export async function GET() {
  const xml = await subcategoriesSitemap();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
