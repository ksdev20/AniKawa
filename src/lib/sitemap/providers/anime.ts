// /lib/sitemap/providers/anime.ts
import type { SitemapUrl } from "../types";
import buildUrlset from "../buildUrlset";
import { AnimeRepository } from "@/lib/anime/AnimeRepository";
import { frontendUrl } from "@/global_assets/globalPaths";

/**
 * Anime sitemap provider
 * Generates a <urlset> XML for all anime entries.
 */
export async function animeSitemap(): Promise<string> {
  const animes = await AnimeRepository.getAllAnime();

  const urls: SitemapUrl[] = animes.map(anime => ({
    loc: `${frontendUrl}/show/${anime.nanoid}/${anime.slug}`,
    lastmod: anime.endDate ?? anime.startDate,
    changefreq: "weekly",
    priority: 0.8,
  }));

  return buildUrlset(urls);
}
