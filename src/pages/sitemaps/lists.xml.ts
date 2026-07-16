import { listsSitemap } from "@/lib/sitemap/providers/lists";

export const prerender = false;

export async function GET() {
  const xml = await listsSitemap();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
