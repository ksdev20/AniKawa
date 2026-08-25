import { AnimeRepository } from ".";

import type {
  Anime,
  AnimeRecord,
  CatalogIndexes,
  CatalogStats,
  EpisodeRecord,
} from "./types";

class AnimeCatalogClass {
  /**
   * True once all indexes have been built.
   */
  private initialized = false;

  /**
   * Raw anime from the repository.
   */
  private anime: ReadonlyArray<Anime> = [];

  /**
   * All readonly indexes.
   *
   * Built exactly once.
   */
  private indexes!: CatalogIndexes;

  /**
   * Prevent duplicate initialization when
   * multiple requests hit simultaneously.
   */
  private initializationPromise: Promise<void> | null = null;

  /**
   * ------------------------------------------------------------------------
   * Lazy initialization
   * ------------------------------------------------------------------------
   */

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initialize();

    await this.initializationPromise;

    this.initializationPromise = null;
  }

  /**
   * ------------------------------------------------------------------------
   * Initializes the catalog.
   *
   * Loads anime from repository.
   * Builds every index.
   * Runs exactly once.
   * ------------------------------------------------------------------------
   */

  private async initialize(): Promise<void> {
    console.time("AnimeCatalog.initialize");

    this.anime = await AnimeRepository.getAllAnime();

    // Build every readonly index.
    // (implemented in next section)
    this.indexes = this.buildIndexes(this.anime);

    this.initialized = true;

    console.timeEnd("AnimeCatalog.initialize");
  }

  /**
   * ------------------------------------------------------------------------
   * Builds every lookup map.
   *
   * Implemented in Part 2.
   * ------------------------------------------------------------------------
   */

  private buildIndexes(animeList: ReadonlyArray<Anime>): CatalogIndexes {
    const animeById = new Map<string, AnimeRecord>();
    const animeBySlug = new Map<string, AnimeRecord>();

    const episodeByKey = new Map<string, EpisodeRecord>();
    const episodeByNanoid = new Map<string, EpisodeRecord>();

    const genreMap = new Map<string, AnimeRecord[]>();

    const latestAnime: AnimeRecord[] = [];
    const popularAnime: AnimeRecord[] = [];
    const ongoingAnime: AnimeRecord[] = [];
    const completedAnime: AnimeRecord[] = [];
    const movies: AnimeRecord[] = [];

    for (const anime of animeList) {
      const episodes = anime.episodes ?? [];

      const firstEpisode = episodes.length > 0 ? episodes[0] : null;

      const latestEpisode =
        episodes.length > 0 ? episodes[episodes.length - 1] : null;

      const hasSub = episodes.some((ep) => ep.audio === "ja");

      const hasDub = episodes.some((ep) => ep.audio !== "ja");

      const record: AnimeRecord = {
        anime,

        episodeCount: episodes.length,

        firstEpisode,

        latestEpisode,

        hasSub,

        hasDub,
      };

      /*
        |--------------------------------------------------------------------------
        | Anime lookups
        |--------------------------------------------------------------------------
        */

      animeById.set(anime.nanoid, record);

      animeBySlug.set(anime.slug, record);

      /*
        |--------------------------------------------------------------------------
        | Sitemap Anime URL
        |--------------------------------------------------------------------------
        */

      /*
        |--------------------------------------------------------------------------
        | Genres
        |--------------------------------------------------------------------------
        */

      for (const genre of anime.genres ?? []) {
        let list = genreMap.get(genre);

        if (!list) {
          list = [];

          genreMap.set(genre, list);
        }

        list.push(record);
      }

      /*
        |--------------------------------------------------------------------------
        | Episodes
        |--------------------------------------------------------------------------
        */

      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i];

        const record: EpisodeRecord = {
          anime,
          episode,
          previousEpisode: i > 0 ? episodes[i - 1] : null,
          nextEpisode: i < episodes.length - 1 ? episodes[i + 1] : null,
        };

        episodeByKey.set(`${anime.nanoid}:${episode.slug}`, record);

        episodeByNanoid.set(`${anime.nanoid}:${episode.nanoid}`, record);
      }

      /*
        |--------------------------------------------------------------------------
        | Collections
        |--------------------------------------------------------------------------
        */

      latestAnime.push(record);

      popularAnime.push(record);

      if (anime.status?.toLowerCase() === "ongoing") {
        ongoingAnime.push(record);
      }

      if (anime.status?.toLowerCase() === "completed") {
        completedAnime.push(record);
      }

      if (anime.runtime?.toLowerCase().includes("movie")) {
        movies.push(record);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Sort once
    |--------------------------------------------------------------------------
    */

    latestAnime.sort(
      (a, b) =>
        new Date(b.anime.startDate).getTime() -
        new Date(a.anime.startDate).getTime(),
    );

    popularAnime.sort(
      (a, b) => (b.anime.popularity ?? 0) - (a.anime.popularity ?? 0),
    );

    return {
      animeById,

      animeBySlug,

      episodeByKey,

      episodeByNanoid,

      genreMap,

      latestAnime,

      popularAnime,

      ongoingAnime,

      completedAnime,

      movies,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Statistics
   * ------------------------------------------------------------------------
   */

  public async getStats(): Promise<CatalogStats> {
    await this.ensureInitialized();

    return {
      animeCount: this.anime.length,

      episodeCount: this.anime.reduce(
        (total, anime) => total + anime.episodes.length,
        0,
      ),

      genreCount: this.indexes.genreMap.size,
    };
  }
  /* ============================================================================
   * Anime
   * ========================================================================== */

  public async getAnime(id: string) {
    await this.ensureInitialized();

    return this.indexes.animeById.get(id) ?? null;
  }

  public async getAnimeByIds(ids: string[]) {
    await this.ensureInitialized();

    return ids
      .map((id) => this.indexes.animeById.get(id) ?? null)
      .filter((record): record is AnimeRecord => record !== null);
  }

  public async getAnimeBySlug(slug: string) {
    await this.ensureInitialized();

    return this.indexes.animeBySlug.get(slug) ?? null;
  }

  public async getAllAnime() {
    await this.ensureInitialized();

    return this.anime;
  }

  /* ============================================================================
   * Episodes
   * ========================================================================== */

  public async getEpisode(animeId: string, episodeSlug: string) {
    await this.ensureInitialized();

    return this.indexes.episodeByKey.get(`${animeId}:${episodeSlug}`) ?? null;
  }

  public async getEpisodeByNanoid(animeId: string, episodeNanoid: string) {
    await this.ensureInitialized();

    return (
      this.indexes.episodeByNanoid.get(`${animeId}:${episodeNanoid}`) ?? null
    );
  }

  public async getEpisodesByNanoids(
  items: Array<{
    animeId: string;
    episodeNanoid: string;
  }>,
) {
  await this.ensureInitialized();

  return items
    .map(({ animeId, episodeNanoid }) => {
      const record = this.indexes.episodeByNanoid.get(
        `${animeId}:${episodeNanoid}`,
      );

      if (!record) {
        return null;
      }

      return record;
    })
    .filter(
      (record): record is EpisodeRecord =>
        record !== null,
    );
}

  /* ============================================================================
   * Genres
   * ========================================================================== */

  public async getGenre(genre: string) {
    await this.ensureInitialized();

    return this.indexes.genreMap.get(genre) ?? [];
  }

  public async getGenres() {
    await this.ensureInitialized();

    return [...this.indexes.genreMap.keys()];
  }

  /* ============================================================================
   * Collections
   * ========================================================================== */

  public async getLatest() {
    await this.ensureInitialized();

    return this.indexes.latestAnime;
  }

  public async getPopular() {
    await this.ensureInitialized();

    return this.indexes.popularAnime;
  }

  public async getOngoing() {
    await this.ensureInitialized();

    return this.indexes.ongoingAnime;
  }

  public async getCompleted() {
    await this.ensureInitialized();

    return this.indexes.completedAnime;
  }

  public async getMovies() {
    await this.ensureInitialized();

    return this.indexes.movies;
  }

  /* ============================================================================
   * Sitemap
   * ========================================================================== */
  public async getAnimeRecords() {
    await this.ensureInitialized();

    return this.indexes.animeById.values();
  }

  public async getEpisodeRecords() {
    await this.ensureInitialized();

    return this.indexes.episodeByKey.values();
  }

  public async getGenreNames() {
    await this.ensureInitialized();

    return this.indexes.genreMap.keys();
  }
}

/*Singleton */
export const AnimeCatalog = new AnimeCatalogClass();
