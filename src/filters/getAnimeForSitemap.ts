import animeArray from '../data/mergedList.json';

export default async function getAllUrlsForSitemap(){
    const urls: {loc: string; lastmod: string}[] = [];

    for (const anime of animeArray){
        const {nanoid, slug, startDate, episodes } = anime;
        if (!nanoid || !slug) continue;

        urls.push({
            loc: `https://anikawa.vercel.app/${nanoid}/${slug}`,
            lastmod: new Date(startDate ?? Date.now()).toISOString()
        });

        if (Array.isArray(episodes) && episodes?.length > 0){
            for (const ep of episodes){
                const {slug: epSlug, air_date} = ep ?? {};
                if (!epSlug) continue;
                urls.push({
                    loc: `https://anikawa.vercel.app/episode/${nanoid}/${epSlug}`,
                    lastmod: new Date(air_date ?? Date.now()).toISOString()
                })
            }
        }
    }

    return urls;
}