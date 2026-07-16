// /lib/sitemap/providers/categories.ts
import type { SitemapUrl } from "../types";
import buildUrlset from "../buildUrlset";
import { AnimeCatalog } from "@/lib/anime";
import { frontendUrl } from "@/global_assets/globalPaths";

/**
 * Main categories sitemap provider
 */
export async function categoriesSitemap(): Promise<string> {
    const categories = Array.from(await AnimeCatalog.getGenreNames());
  const urls: SitemapUrl[] = categories.map(cat => ({
    loc: `${frontendUrl}/category/${encodeURIComponent(cat)}`,
    lastmod: new Date(),
    changefreq: "weekly",
    priority: 0.7,
  }));

  return buildUrlset(urls);
}
