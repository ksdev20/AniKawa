// /lib/sitemap/providers/episodes.ts
import type { SitemapUrl } from "../types";
import buildUrlset from "../buildUrlset";
import { AnimeCatalog } from "@/lib/anime/AnimeCatalog";
import { frontendUrl } from "@/global_assets/globalPaths";

export async function episodesSitemap(page: number, limit: number): Promise<string> {
  const episodeRecords = Array.from(await AnimeCatalog.getEpisodeRecords());

  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = episodeRecords.slice(start, end);

  const urls: SitemapUrl[] = slice.map(record => {
    const { anime, episode } = record;
    return {
      loc: `${frontendUrl}/episode/${anime.nanoid}/${episode.nanoid}/${episode.slug}`,
      lastmod: episode.air_date ?? anime.endDate ?? anime.startDate,
      changefreq: "weekly",
      priority: 0.6,
    };
  });

  return buildUrlset(urls);
}
