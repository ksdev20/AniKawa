import Fuse from "fuse.js";
import { useState, useEffect, useMemo } from "react";
import type { Anime } from "@/lib/anime/types";
import "./searchtw.css";
import "../../styles/NewPopALStyles.css";

import { AnimeRepository } from "@/lib/anime";
import { getAnimeById, getEpisodeBySlug } from "@/filters/getAnimeById";
import AnimeCardReact from "../AnimeCard/AnimeCardReact";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import { useDebounce } from "use-debounce";
import { Icon } from "../../icons/icons";

export default function SearchCSR() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [episodeResults, setEpisodeResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [allAnime, setAllAnime] = useState<ReadonlyArray<Anime>>([]);

  // ✅ Load anime once
  useEffect(() => {
    AnimeRepository.getAllAnime().then(setAllAnime);
  }, []);

  // ✅ Build Fuse indexes once
  const animeFuse = useMemo(() => {
    const animeOptions = {
      keys: ["slug", "title", "description", "keywords"],
      threshold: 0.4,
      includeScore: true,
    };
    const animeSlicedList = allAnime.map(a => ({
      nanoid: a.nanoid,
      slug: a.slug,
      title: a.title ?? "N/A",
      description: a.description ?? "N/A",
      keywords: a.keywords ?? "",
    }));
    return new Fuse(animeSlicedList, animeOptions);
  }, [allAnime]);

  const episodeFuse = useMemo(() => {
    const episodeOptions = {
      keys: ["epTitle", "epSlug", "ytTitle", "description"],
      threshold: 0.4,
      includeScore: true,
    };
    const episodeFlattenedList = allAnime.flatMap(a =>
      (a.episodes ?? []).map(ep => ({
        animeNanoid: a.nanoid,
        epSlug: ep.slug,
        ytTitle: ep.title,
        epTitle: ep.titleAlt,
        description: ep.description ?? "no description",
      }))
    );
    return new Fuse(episodeFlattenedList, episodeOptions);
  }, [allAnime]);

  // ✅ Search logic
  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setAnimeResults([]);
      setEpisodeResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    const runSearch = async () => {
      const foundAnime = animeFuse.search(debouncedQuery).map(r => r.item);
      const foundEpisodes = episodeFuse.search(debouncedQuery).map(r => r.item);

      const animeIdsUsed = new Set<string>();
      const episodeIdsUsed = new Set<string>();

      const completeAnimeList = await Promise.all(
        foundAnime.map(async (a: any) => {
          const { nanoid, title } = a;
          if (!nanoid) return null;
          const anime = await getAnimeById(nanoid);
          const ep1Url = anime?.episodes?.[0]?.url;
          if (!anime || !title || !ep1Url || animeIdsUsed.has(nanoid)) return null;
          animeIdsUsed.add(nanoid);
          return anime;
        })
      ).then(list => list.filter(Boolean));

      const completeEpisodeList = await Promise.all(
        foundEpisodes.map(async (e: any) => {
          const { epTitle, animeNanoid, epSlug, nanoid: epNanoid } = e;
          const episode = await getEpisodeBySlug(animeNanoid, epSlug);
          if (!episode || !epTitle || episodeIdsUsed.has(epNanoid)) return null;
          episodeIdsUsed.add(epNanoid);
          return episode;
        })
      ).then(list => list.filter(Boolean));

      setAnimeResults(completeAnimeList as Anime[]);
      setEpisodeResults(completeEpisodeList);
    };

    runSearch();
  }, [debouncedQuery, animeFuse, episodeFuse]);

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
          animeResults.length === 0 &&
          episodeResults.length === 0 && (
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
