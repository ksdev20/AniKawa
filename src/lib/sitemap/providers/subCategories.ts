// /lib/sitemap/providers/subcategories.ts
import type { SitemapUrl } from "../types";
import buildUrlset from "../buildUrlset";
import { AnimeCatalog } from "@/lib/anime";
import { frontendUrl } from "@/global_assets/globalPaths";
/**
 * Subcategories sitemap provider
 * Generates URLs for every mainCategory + subCategory pair.
 */
export async function subcategoriesSitemap(): Promise<string> {
  const urls: SitemapUrl[] = [];
  const categories = await AnimeCatalog.getGenreNames();
  for (const mainCategory of categories) {
    for (const subCategory of categories) {
      if (subCategory === mainCategory) continue;

      urls.push({
        loc: `${frontendUrl}/category/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subCategory)}`,
        lastmod: new Date(),
        changefreq: "weekly",
        priority: 0.5,
      });
    }
  }

  return buildUrlset(urls);
}
