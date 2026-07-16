/**
 * Google allows 50,000 URLs.
 * We intentionally keep it much lower for faster responses.
 */
export const URLS_PER_EPISODE_SITEMAP = 10000;

/**
 * XML content type.
 */
export const XML_HEADERS = {
    "Content-Type": "application/xml; charset=UTF-8",

    // Vercel CDN cache
    "Cache-Control":
        "public, max-age=3600, stale-while-revalidate=86400",
};