import escapeXml from "./escapeXml";
import type { SitemapUrl } from "./types";

function formatDate(date: Date | string) {
    return new Date(date).toISOString();
}

export default function buildUrlset(
    urls: SitemapUrl[],
): string {

    const body = urls.map(url => {

        return `
    <url>
        <loc>${escapeXml(url.loc)}</loc>

        ${
            url.lastmod
                ? `<lastmod>${formatDate(url.lastmod)}</lastmod>`
                : ""
        }

        ${
            url.changefreq
                ? `<changefreq>${url.changefreq}</changefreq>`
                : ""
        }

        ${
            typeof url.priority === "number"
                ? `<priority>${url.priority.toFixed(1)}</priority>`
                : ""
        }

    </url>`;

    }).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${body}

</urlset>`;
}