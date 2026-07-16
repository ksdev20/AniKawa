// /pages/sitemaps/episodes/[page].xml.ts
import { episodesSitemap } from "@/lib/sitemap/providers/episodes";

export const prerender = false;

const EPISODES_PER_SITEMAP = 10000;

interface EpisodeParams {
  page: string;
}

export async function GET({ params }: { params: EpisodeParams }) {
  const page = Number(params.page);

  if (isNaN(page) || page < 1) {
    return new Response("Invalid page", { status: 400 });
  }

  const xml = await episodesSitemap(page, EPISODES_PER_SITEMAP);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
