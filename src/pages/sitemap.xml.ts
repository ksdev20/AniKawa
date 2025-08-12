export const prerender = true;
import getAllUrlsForSitemap from "../filters/getAnimeForSitemap";

export async function GET() {
    const urls = await getAllUrlsForSitemap();

    const finalUrls = urls.map(({ loc, lastmod }) => `
        <url>
            <loc>${loc}</loc>
            <lastmod>${lastmod}</lastmod>
            <priority>0.8</priority>
        </url>
    `).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${finalUrls}
    </urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'no-cache'
        }
    })
}