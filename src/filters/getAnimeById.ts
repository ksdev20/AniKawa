import animeArray from '../data/mergedList.json';
import type { Episode } from '../types/mergedListTypes';

export function getAnimeById(nanoid: string | undefined): any{
    if (nanoid == undefined) return [];
    return animeArray.find(a => a.nanoid == nanoid);
}

export function getEpisodebySlug(animeId : string, epSlug: string): any{
    const anime = getAnimeById(animeId);
    if (!anime) return null;
    const { nanoid, slug } = anime;
    const { title } = anime;
    const language = anime?.episodes?.[0]?.audio == 'ja' ? 'Subtitled' : 'Sub|Dub'

    const animeDetails = {
        animeTitle: title,
        language,
        animenanoid: nanoid,
        animeslug: slug,
    }

    const episode = anime?.episodes?.find((e: Episode) => e?.slug == epSlug);
    
    return {
        ...animeDetails,
        ...episode
    }
}