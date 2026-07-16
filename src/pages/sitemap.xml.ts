// /pages/sitemap.xml.ts
export const prerender = false;

import buildIndex from "@/lib/sitemap/buildIndex";
import { frontendUrl as rawFrontendUrl } from "@/global_assets/globalPaths";
import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";

const EPISODES_PER_SITEMAP = 10000;

// Normalize frontendUrl (remove trailing slash if present)
const frontendUrl = rawFrontendUrl.endsWith("/")
  ? rawFrontendUrl.slice(0, -1)
  : rawFrontendUrl;

export async function GET() {
  // Use AnimeCatalog instead of mergedList.json
  const stats = await AnimeCatalog.getStats();
  const totalEpisodes = stats.episodeCount;

  const episodeSitemapCount = Math.ceil(totalEpisodes / EPISODES_PER_SITEMAP);
  const now = new Date();

  const sitemaps = [
    {
      loc: `${frontendUrl}/sitemaps/anime.xml`,
      lastmod: now,
    },
    {
      loc: `${frontendUrl}/sitemaps/categories.xml`,
      lastmod: now,
    },
    {
      loc: `${frontendUrl}/sitemaps/lists.xml`,
      lastmod: now,
    },
    {
      loc: `${frontendUrl}/sitemaps/subCategories.xml`,
      lastmod: now,
    },
    ...Array.from({ length: episodeSitemapCount }, (_, i) => ({
      loc: `${frontendUrl}/sitemaps/episodes/${i + 1}.xml`,
      lastmod: now,
    })),
  ];

  return new Response(buildIndex(sitemaps), {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control":
        "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
