// /lib/sitemap/providers/lists.ts
import type { SitemapUrl } from "../types";
import buildUrlset from "../buildUrlset";
import { frontendUrl } from "@/global_assets/globalPaths";

/**
 * Lists sitemap provider
 * Generates a <urlset> XML for collection pages like latest, popular, ongoing, completed, movies.
 */
export async function listsSitemap(): Promise<string> {

  const urls: SitemapUrl[] = [
    {
      loc: `${frontendUrl}/list/new`,
      lastmod: new Date(),
      changefreq: "daily",
      priority: 0.8,
    },
    {
      loc: `${frontendUrl}/list/popular`,
      lastmod: new Date(),
      changefreq: "daily",
      priority: 0.8,
    },
    {
      loc: `${frontendUrl}/list/old`,
      lastmod: new Date(),
      changefreq: "daily",
      priority: 0.7,
    }
  ];

  return buildUrlset(urls);
}
