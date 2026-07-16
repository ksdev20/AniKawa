export interface SitemapUrl {
    loc: string;
    lastmod?: Date | string;
    changefreq?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
    priority?: number;
}

export interface SitemapIndexItem {
    loc: string;
    lastmod?: Date | string;
}