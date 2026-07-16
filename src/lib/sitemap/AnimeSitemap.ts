// AnimeSitemap.ts
import buildUrlset from "./buildUrlset";
import buildIndex from "./buildIndex";
import type { SitemapUrl, SitemapIndexItem } from "./types";
import { AnimeRepository } from "@/lib/anime/AnimeRepository";
import { frontendUrl } from "@/global_assets/globalPaths";

/**
 * Build a sitemap for all anime entries.
 */
export async function buildAnimeUrlset(): Promise<string> {
  const animes = await AnimeRepository.getAllAnime();

  const urls: SitemapUrl[] = animes.map(anime => ({
    loc: `${frontendUrl}/anime/${anime.slug}`,
    lastmod: anime.endDate,
    changefreq: "weekly",
    priority: 0.8,
  }));

  return buildUrlset(urls);
}

/**
 * Build a sitemap index that references multiple sitemap files.
 */
export async function buildAnimeIndex(): Promise<string> {
  // Example: separate sitemaps for anime and episodes
  const sitemaps: SitemapIndexItem[] = [
    {
      loc: `${frontendUrl}/sitemap-anime.xml`,
      lastmod: new Date(),
    },
    {
      loc: `${frontendUrl}/sitemap-episodes.xml`,
      lastmod: new Date(),
    },
  ];

  return buildIndex(sitemaps);
}
