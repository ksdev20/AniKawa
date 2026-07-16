// src/lib/anime/helpers/getAnimeById.ts

import { AnimeRepository, AnimeCatalog } from "@/lib/anime";
import type { Episode, Anime } from "@/lib/anime/types";

/**
 * Get a single anime by its nanoid.
 */
export async function getAnimeById(nanoid: string | undefined): Promise<Anime | null> {
  if (!nanoid) return null;

  const allAnime = await AnimeRepository.getAllAnime();
  return allAnime.find(a => a.nanoid === nanoid) ?? null;
}

/**
 * Get a specific episode by slug, along with anime details.
 */
export async function getEpisodeBySlug(animeId: string, epSlug: string): Promise<(Episode & {
  animeTitle: string;
  language: string;
  animenanoid: string;
  animeslug: string;
}) | null> {
  const anime = await getAnimeById(animeId);
  if (!anime) return null;

  const { nanoid, slug, title, episodes } = anime;
  const language = episodes?.[0]?.audio === "ja" ? "Subtitled" : "Sub|Dub";

  const episode = episodes?.find((e: Episode) => e.slug === epSlug);
  if (!episode) return null;

  return {
    animeTitle: title,
    language,
    animenanoid: nanoid,
    animeslug: slug,
    ...episode,
  };
}
