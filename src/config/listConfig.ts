import dayjs from "dayjs";
import animeArray from '../data/mergedList.json';
export const validNames = ["new", "popular", "old"];

export const sortMap: Record<string, (a: any, b: any) => number> = {
    new: (a, b) => {
        const dateA = dayjs(a?.startDate ?? "2000-1-1");
        const dateB = dayjs(b?.startDate ?? "2000-1-1");
        return dateB.valueOf() - dateA.valueOf();
    },
    popular: (a, b) => {
        const scoreA = a?.score ?? 0.0;
        const scoreB = b?.score ?? 1.0;
        return scoreB - scoreA;
    },
    old: (a, b) => {
        const dateA = dayjs(a?.startDate ?? "2000-1-1");
        const dateB = dayjs(b?.startDate ?? "2000-1-1");
        return dateA.valueOf() - dateB.valueOf();
    },
}

function getALFinal(name: string) {
    const sortFn = sortMap[name];
    const seen = new Map();
    const finalArray = animeArray.filter((a) => {
        const url = a?.episodes?.[0]?.url;
        if (!url || seen.has(url)) return false;
        seen.set(url, true);
        return true;
    });
    finalArray.sort(sortFn);
    return finalArray;
}

export const listConfig = [
    {
        name: 'new',
        srOnly: 'New Anime List',
        label: 'Newly Added Anime',
        pageDescription: "Discover the latest anime releases added to Anikawa. Subbed and dubbed episodes, no ads, just pure anime streaming.",
        keywords: "new anime, latest anime releases, subbed anime, dubbed anime, watch new anime online, Anikawa",
        pageTitle: `Watch Newly Added Anime Online Free | Anikawa`,
        pageUrl: "https://anikawa.vercel.app/list/new",
        backdrop: "https://anikawa.vercel.app/anikawa-new-og-img-pc.png",
        animeList: getALFinal('new')
    },
    {
        name: 'popular',
        srOnly: 'Popular Anime List',
        label: 'Most Popular Anime',
        pageDescription: "Explore the most popular anime ranked by fans. Watch top-rated subbed and dubbed series online, ad-free.",
        keywords: "popular anime, top anime, best anime series, subbed anime, dubbed anime, watch popular anime online, Anikawa",
        pageTitle: `Watch Most Popular Anime Online Free | Anikawa`,
        pageUrl: "https://anikawa.vercel.app/list/popular",
        backdrop: "https://anikawa.vercel.app/anikawa-popular-og-img-pc.png",
        animeList: getALFinal('popular')
    },
    {
        name: 'old',
        srOnly: 'Old Anime List',
        label: 'The Old Classic',
        pageDescription: "Rediscover classic and nostalgic anime series from the past. Watch timeless subbed and dubbed episodes on Anikawa, ad-free.",
        keywords: "old anime, classic anime, nostalgic anime, retro anime, subbed anime, dubbed anime, watch old anime online, Anikawa",
        pageTitle: `Watch The Old Classic Online Free | Anikawa`,
        pageUrl: "https://anikawa.vercel.app/list/old",
        backdrop: "https://anikawa.vercel.app/anikawa-old-og-img-pc.png",
        animeList: getALFinal('old')
    },
];

export const filterMap: Record<string, (a: any) => void> = {
    sub: (a) => a?.episodes?.audio !== 'ja',
    dub: (a) => a?.episodes?.audio == 'ja',
    all: () => true,
}