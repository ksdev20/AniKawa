export const prerender = true;
import getSitemapUrls, { type urlListItem } from "../filters/getAnimeForSitemap";

export async function GET() {
    const urls: urlListItem[] = await getSitemapUrls();

    const finalUrls = urls.map(({ loc, lastmod, priority }) => (
        `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`
    )).join("\n");

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${finalUrls}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=UTF-8",
            "Cache-Control": "no-cache"
        }
    });
}