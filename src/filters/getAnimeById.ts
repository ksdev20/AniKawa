import aniOneData2 from '../data/aniOneData2.json';
import type { Video } from './AnimeDataTypes';

export function getAnimeById(nanoid: string | undefined): any{
    if (nanoid == undefined) return [];
    return aniOneData2.find(a => a.nanoid == nanoid);
}

export function getEpisodebySlug(animeId : string, epSlug: string): any{
    const anime = getAnimeById(animeId);
    const { nanoid, slug } = anime;
    const { language, title, romaji } = anime?.anilist;

    const animeDetails = {
        animeTitle: title,
        language,
        animenanoid: nanoid,
        animeslug: slug,
    }

    const episode = anime.videos.find((e: Video) => e.slug == epSlug);

    return {
        ...animeDetails,
        ...episode
    }
}