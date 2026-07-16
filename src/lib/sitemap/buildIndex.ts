import escapeXml from "./escapeXml";
import type { SitemapIndexItem } from "./types";

function formatDate(date: Date | string) {
    return new Date(date).toISOString();
}

export default function buildIndex(
    sitemaps: SitemapIndexItem[],
): string {

    const body = sitemaps.map(item => {

        return `
    <sitemap>

        <loc>${escapeXml(item.loc)}</loc>

        ${
            item.lastmod
                ? `<lastmod>${formatDate(item.lastmod)}</lastmod>`
                : ""
        }

    </sitemap>`;

    }).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>

<sitemapindex
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${body}

</sitemapindex>`;
}