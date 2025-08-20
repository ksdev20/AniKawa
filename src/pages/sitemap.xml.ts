export const prerender = true;
import getSitemapUrls, { isValidLoc, type urlListItem } from "../filters/getAnimeForSitemap";

export async function GET() {
    const urls: urlListItem[] = await getSitemapUrls();

    const validUrls = urls.filter(({ loc }) => {
        const isValid = isValidLoc(loc);
        if (!isValid) console.warn('🚨 Invalid loc skipped:', loc);
        return isValid;
    });

    const finalUrls = validUrls.map(({ loc }) => (
        `  <url>
    <loc>${loc}</loc>
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