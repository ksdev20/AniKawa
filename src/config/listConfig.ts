import dayjs from "dayjs";
import { AnimeRepository } from "@/lib/anime";
import type { Anime } from "@/lib/anime/types";
import { frontendUrl } from "@/global_assets/globalPaths";

export const validNames = ["new", "popular", "old"] as const;

export const sortMap: Record<string, (a: Anime, b: Anime) => number> = {
  new: (a, b) => {
    const dateA = dayjs(a?.startDate ?? "2000-01-01");
    const dateB = dayjs(b?.startDate ?? "2000-01-01");
    return dateB.valueOf() - dateA.valueOf();
  },
  popular: (a, b) => {
    const scoreA = a?.score ?? 0;
    const scoreB = b?.score ?? 0;
    return scoreB - scoreA;
  },
  old: (a, b) => {
    const dateA = dayjs(a?.startDate ?? "2000-01-01");
    const dateB = dayjs(b?.startDate ?? "2000-01-01");
    return dateA.valueOf() - dateB.valueOf();
  },
};

/**
 * Get a sorted, deduplicated anime list.
 */
async function getALFinal(name: string): Promise<Anime[]> {
  const sortFn = sortMap[name];
  const allAnime = await AnimeRepository.getAllAnime();

  const seen = new Set<string>();
  const finalArray = allAnime.filter((a) => {
    const id = a.nanoid;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return finalArray.sort(sortFn);
}

export const listConfig = async () => [
  {
    name: "new",
    srOnly: "New Anime List",
    label: "Newly Added Anime",
    pageDescription:
      "Discover the latest anime releases added to Anikawa. Subbed and dubbed episodes, no ads, just pure anime streaming.",
    keywords:
      "new anime, latest anime releases, subbed anime, dubbed anime, watch new anime online, Anikawa",
    pageTitle: `Watch Newly Added Anime Online Free | Anikawa`,
    pageUrl: `${frontendUrl}/list/new`,
    backdrop: `${frontendUrl}/anikawa-new-og-img-pc.webp`,
    animeList: await getALFinal("new"),
  },
  {
    name: "popular",
    srOnly: "Popular Anime List",
    label: "Most Popular Anime",
    pageDescription:
      "Explore the most popular anime ranked by fans. Watch top-rated subbed and dubbed series online, ad-free.",
    keywords:
      "popular anime, top anime, best anime series, subbed anime, dubbed anime, watch popular anime online, Anikawa",
    pageTitle: `Watch Most Popular Anime Online Free | Anikawa`,
    pageUrl: `${frontendUrl}/list/popular`,
    backdrop: `${frontendUrl}/anikawa-popular-og-img-pc.webp`,
    animeList: await getALFinal("popular"),
  },
  {
    name: "old",
    srOnly: "Old Anime List",
    label: "The Old Classic",
    pageDescription:
      "Rediscover classic and nostalgic anime series from the past. Watch timeless subbed and dubbed episodes on Anikawa, ad-free.",
    keywords:
      "old anime, classic anime, nostalgic anime, retro anime, subbed anime, dubbed anime, watch old anime online, Anikawa",
    pageTitle: `Watch The Old Classic Online Free | Anikawa`,
    pageUrl: `${frontendUrl}/list/old`,
    backdrop: `${frontendUrl}/anikawa-old-og-img-pc.webp`,
    animeList: await getALFinal("old"),
  },
];

export const filterMap: Record<string, (a: Anime) => boolean> = {
  sub: (a) => a?.episodes?.some((ep) => ep.audio === "ja") ?? false,
  dub: (a) => a?.episodes?.some((ep) => ep.audio !== "ja") ?? false,
  all: () => true,
};
