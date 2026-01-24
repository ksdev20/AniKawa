import animeArray from '../data/mergedList.json';
import { frontendUrl } from '../global_assets/globalPaths';

export interface urlListItem {
    loc: string
}

export function isValidLoc(loc: string): boolean {
    return typeof loc === 'string' &&
        loc.startsWith(frontendUrl) &&
        !/\s/.test(loc) && // no whitespace
        loc.length < 2048; // sanity limit
}

export default async function getSitemapUrls() {
    const [showEpUrls, categoryUrls, npoUrls] = await Promise.all([
        getShowEpUrls(),
        getCategoryUrls(),
        getNPOUrls()
    ]);
    return [{ loc: frontendUrl }, ...npoUrls, ...categoryUrls, ...showEpUrls];
}

export async function getShowEpUrls() {
    const urls: urlListItem[] = [];

    for (const anime of animeArray) {
        const { nanoid, slug, startDate, episodes } = anime;
        if (!nanoid || !slug) continue;

        urls.push({
            loc: `${frontendUrl}/show/${nanoid}/${slug}`,
        });

        if (Array.isArray(episodes) && episodes?.length > 0) {
            for (const ep of episodes) {
                const { slug: epSlug = 'n-a', air_date } = ep ?? {};
                if (!epSlug) continue;
                urls.push({
                    loc: `${frontendUrl}/episode/${nanoid}/${epSlug}`,
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
                loc: `${frontendUrl}/category/${g}`,
            });
        });
    });
    return categoryUrls;
}

export async function getNPOUrls() {
    const npo = ['new', 'popular', 'old'];
    return npo.map(i => ({
        loc: `${frontendUrl}/list/${i}`,
    }));
}