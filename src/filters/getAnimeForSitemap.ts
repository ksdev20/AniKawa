import animeArray from '../data/mergedList.json';

export interface urlListItem {
    loc: string; lastmod: string, priority: number
}

export default async function getSitemapUrls() {
    const [showEpUrls, categoryUrls, npoUrls] = await Promise.all([
        getShowEpUrls(),
        getCategoryUrls(),
        getNPOUrls()
    ]);
    return [...npoUrls, ...categoryUrls, ...showEpUrls]; 
}

export async function getShowEpUrls() {
    const urls: urlListItem[] = [];

    for (const anime of animeArray) {
        const { nanoid, slug, startDate, episodes } = anime;
        if (!nanoid || !slug) continue;

        urls.push({
            loc: `https://anikawa.vercel.app/show/${nanoid}/${slug}`,
            lastmod: new Date(startDate ?? Date.now()).toISOString(),
            priority: 0.8
        });

        if (Array.isArray(episodes) && episodes?.length > 0) {
            for (const ep of episodes) {
                const { slug: epSlug = 'n-a', air_date } = ep ?? {};
                if (!epSlug) continue;
                urls.push({
                    loc: `https://anikawa.vercel.app/episode/${nanoid}/${epSlug}`,
                    lastmod: new Date(air_date ?? Date.now()).toISOString(),
                    priority: 0.8
                })
            }
        }
    }

    return urls;
}

export async function getCategoryUrls() {
    const categoryUrls: urlListItem[] = [];
    const usedCategories: string[] = [];
    animeArray.forEach(anime => {
        const gen = anime?.genres;
        if (!anime || !gen || gen?.length == 0) return;
        gen.forEach(g => {
            if (usedCategories.includes(g)) return;
            usedCategories.push(g);
            categoryUrls.push({
                loc: `https://anikawa.vercel.app/category/${g}`,
                lastmod: new Date().toISOString(),
                priority: 0.8
            });
        });
    });
    return categoryUrls;
}

export async function getNPOUrls() {
    const npo = ['new', 'popular', 'old'];
    return npo.map(i => ({
        loc: `https://anikawa.vercel.app/list/${i}`,
        lastmod: new Date().toISOString(),
        priority: 1.0
    }));
}