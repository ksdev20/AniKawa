import animeArray from "@/data/mergedList.json";

import type {
    Anime,
    AnimeRepository as IAnimeRepository,
} from "./types";

/**
 * JSON implementation of the AnimeRepository.
 *
 * The rest of the application should NEVER import
 * mergedList.json directly.
 *
 * If we migrate to PostgreSQL later,
 * only this file changes.
 */
class JsonAnimeRepository implements IAnimeRepository {

    private readonly anime: ReadonlyArray<Anime>;

    constructor() {
        this.anime = Object.freeze(
            animeArray as Anime[],
        );
    }

    async getAllAnime(): Promise<ReadonlyArray<Anime>> {
        return this.anime;
    }

}

export const AnimeRepository = new JsonAnimeRepository();