export interface Anilist{
    id: number | null,
    title: string | null,
    romaji: string | null,
    language: string | null,
    score: string | null,
    episodes: number | null,
    description: string | null,
    coverImage: string | null,
    bannerImage: string | null,
    genres: string[] | null,
    type: string | null,
    status: string | null,
    duration: string | null,
    season: string | null,
    startDate: string | null,
    endDate: string | null
}

export interface EpisodeDetail{
    title: string | null,
    thumbnail: string | null,
    url: string | null,
    site: string | null,
    description?: string | null
}

export interface Video{
    nanoid: string | null,
    slug: string | null,
    episodeNumber: number | null;
    title: string | null,
    url: string | null,
    episodeDetails: EpisodeDetail[] | null;
}

export interface EpisodeCardProps{
    animeTitle: string | null;
    language: string | null;
    animenanoid: string;
    animeslug: string;
    nanoid: string,
    slug: string,
    episodeNumber: number | null;
    title: string | null,
    url: string | null,
    episodeDetails: EpisodeDetail[] | null;
}

export interface Anime{
    nanoid: string | null,
    slug: string | null,
    id: string | null,
    title: string | null,
    videoCount: number | null,
    cleanTitle: string | null,
    language: string | null,
    anilist: Anilist | null,
    videos: Video[] | null,
}

export interface EpisodeCardProps{
    animeTitle: string | null,
    language: string | null,
    nanoid: string,
}

export interface Name{
    first: string | null,
    full: string | null,
    native: string | null,
    alternative: string[] | null,
    userPreferred: string | null
}

export interface Character{
    name: Name | null,
    image: string | null
}

export interface Banner{
    title: string,
    banner: string
}