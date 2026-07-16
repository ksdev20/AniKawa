import { AnimeRepository } from "@/lib/anime";
import type { Anime } from "@/lib/anime/types";
import stringSimilarity from "string-similarity";

/**
 * Find other seasons of an anime by title similarity.
 * @param title - The title of the current anime
 * @param excludeNanoid - The nanoid of the anime to exclude
 * @param threshold - Similarity threshold (default 0.5)
 */
export async function getOtherSeasons(
  title: string,
  excludeNanoid: string,
  threshold = 0.5
): Promise<Anime[]> {
  const allAnime = await AnimeRepository.getAllAnime();

  const results = allAnime.filter((anime) => {
    if (!anime.title || !anime.nanoid) return false;
    if (anime.nanoid === excludeNanoid) return false;

    const similarity = stringSimilarity.compareTwoStrings(anime.title, title);
    return similarity > threshold;
  });

  return results;
}
