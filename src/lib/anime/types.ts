import type { Anime, Episode } from "@/types/mergedListTypes";

export type { Anime, Episode };

/* ============================================================================
 * Records
 * ========================================================================== */

export interface AnimeRecord {
    anime: Anime;

    episodeCount: number;

    firstEpisode: Episode | null;
    latestEpisode: Episode | null;

    hasSub: boolean;
    hasDub: boolean;
}

export interface EpisodeRecord {
    anime: Anime;
    episode: Episode;

    previousEpisode: Episode | null;
    nextEpisode: Episode | null;
}

/* ============================================================================
 * Statistics
 * ========================================================================== */

export interface CatalogStats {
    animeCount: number;
    episodeCount: number;
    genreCount: number;
}

/* ============================================================================
 * Repository
 * ========================================================================== */

export interface AnimeRepository {
    getAllAnime(): Promise<ReadonlyArray<Anime>>;
}

/* ============================================================================
 * Internal Indexes
 * Everything here is built ONCE during initialization.
 * ========================================================================== */

export interface CatalogIndexes {

    animeById: ReadonlyMap<string, AnimeRecord>;

    animeBySlug: ReadonlyMap<string, AnimeRecord>;

    episodeByKey: ReadonlyMap<string, EpisodeRecord>;

    genreMap: ReadonlyMap<string, readonly AnimeRecord[]>;

    latestAnime: readonly AnimeRecord[];

    popularAnime: readonly AnimeRecord[];

    ongoingAnime: readonly AnimeRecord[];

    completedAnime: readonly AnimeRecord[];

    movies: readonly AnimeRecord[];

}