import { AnimeCatalog } from "@/lib/anime";
import type { Episode, Anime } from "@/lib/anime/types";

/**
 * Get a single anime by its nanoid.
 */
export async function getAnimeById(
  nanoid: string | undefined,
): Promise<Anime | null> {
  if (!nanoid) return null;

  const record = await AnimeCatalog.getAnime(nanoid);

  return record?.anime ?? null;
}

/**
 * Get a specific episode by slug, along with anime details.
 */
export async function getEpisode(
  animeId: string,
  epNanoid: string,
): Promise<
  | (Episode & {
      animeTitle: string;
      language: string;
      animenanoid: string;
      animeslug: string;
    })
  | null
> {
  if (!animeId || !epNanoid) return null;

  const record = await AnimeCatalog.getEpisodeByNanoid(animeId, epNanoid);

  if (!record) return null;

  const { anime, episode } = record;

  const language =
    anime.episodes?.[0]?.audio === "ja" ? "Subtitled" : "Sub|Dub";

  return {
    animeTitle: anime.title,
    language,
    animenanoid: anime.nanoid,
    animeslug: anime.slug,
    ...episode,
  };
}
