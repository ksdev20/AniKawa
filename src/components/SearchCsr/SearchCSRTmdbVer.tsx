import Fuse from "fuse.js";
import { useState, useEffect } from "react";
import type { Anime } from "../../types/mergedListTypes";
import "./searchtw.css";
import "../../styles/NewPopALStyles.css";
import animeArray from "../../data/mergedList.json";
import { getAnimeById, getEpisodebySlug } from "../../filters/getAnimeById";
import AnimeCardReact from "../AnimeCard/AnimeCardReact";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import { useDebounce } from "use-debounce";
import { Icon } from "../../icons/icons";

const typedAnimeArray = animeArray as any[];

const animeOptions = {
  keys: ["slug", "title", "description", "keywords"],
  threshold: 0.4,
  includeScore: true,
};

const animeSlicedList = typedAnimeArray.flatMap((anime) => {
  const { nanoid, slug } = anime;
  const { title = "N/A", description = "N/A", keywords = "" } = anime ?? {};

  return {
    nanoid,
    slug,
    title,
    description,
    keywords,
  };
});

const animeFuse = new Fuse(animeSlicedList, animeOptions);

const episodeOptions = {
  keys: ["epTitle", "epSlug", "ytTitle", "description"],
  threshold: 0.4,
  includeScore: true,
};

const episodeFlattenedList = typedAnimeArray.flatMap((anime: Anime) => {
  const { nanoid } = anime;
  if (!anime.episodes) return [];
  return anime.episodes
    .map((episode) => {
      const { slug, title } = episode;
      const epTitle = episode?.titleAlt;
      const description = episode?.description ?? "no description";
      if (!title || !epTitle || !slug) return null;

      return {
        animeNanoid: nanoid,
        epSlug: slug,
        ytTitle: title,
        epTitle,
        description,
      };
    })
    .filter(Boolean);
});

const episodeFuse = new Fuse(episodeFlattenedList, episodeOptions);

export default function SearchCSR() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [episodeResults, setEpisodeResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setAnimeResults([]);
      setEpisodeResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    const foundAnime = animeFuse.search(query).map((r: any) => r.item);
    const foundEpisodes = episodeFuse.search(query).map((r: any) => r.item);

    const animeTitlesUsed = new Set<string>();
    const episodeTitlesUsed = new Set();

    const completeAnimeList = foundAnime
      .map((a: any) => {
        const { nanoid, title } = a;
        if (!nanoid) return null;
        const anime = getAnimeById(nanoid);
        const ep1Url = anime?.episodes?.[0]?.url;
        if (!anime || !title || animeTitlesUsed.has(ep1Url) || !ep1Url)
          return null;
        animeTitlesUsed.add(ep1Url);
        return anime;
      })
      .filter(Boolean);

    const completeEpisodeList = foundEpisodes
      .map((e: any) => {
        const { epTitle, animeNanoid, epSlug } = e;
        const episode = getEpisodebySlug(animeNanoid, epSlug);
        if (!episode || !epTitle || episodeTitlesUsed.has(epTitle)) return null;
        episodeTitlesUsed.add(epTitle);
        return episode;
      })
      .filter(Boolean);

    setAnimeResults(completeAnimeList);
    setEpisodeResults(completeEpisodeList);
  }, [debouncedQuery]);

  return (
    <>
      <section className="search-top">
        <div className="st-bar-div">
          <input
            className="search-input"
            type="search"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            aria-label="Clear Search Field"
            onClick={() => setQuery("")}
            className={`search-clear-btn ${query == "" ? "hidden" : ""}`}
          >
            <Icon name="close" size={28} />
          </button>
        </div>
      </section>
      <section className="profile-main">
        {hasSearched &&
          animeResults.length == 0 &&
          episodeResults.length == 0 && (
            <div className="relative w-full h-30">
              <span className="absolute top-[50%] left-[50%] translate-x-[-50%] text-base text-[gray]">
                No results found, try different search.
              </span>
            </div>
          )}
        <div className="profile-main search-results">
          {animeResults.length > 0 && (
            <section id="ar-box" className="mov-ser-section show">
              <h2 className="mss-heading">Series</h2>
              <ul id="anime-results" className="new-pop-anime-list">
                {animeResults.map((an, i) => (
                  <AnimeCardReact key={i} anime={an} forNewPop={true} />
                ))}
              </ul>
            </section>
          )}
          {episodeResults.length > 0 && (
            <section id="er-box" className="mov-ser-section show">
              <h2 className="mss-heading">Episodes</h2>
              <ul id="episode-results" className="episodes-list el-history">
                {episodeResults.map((episode, i) => (
                  <EpisodeCard key={i} epData={episode} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </>
  );
}
