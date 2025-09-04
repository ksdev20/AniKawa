import { useState, useEffect } from 'react';
import type { Anime } from '../../types/mergedListTypes';
import './searchtw.css';
import '../../styles/NewPopALStyles.css';
import animeArray from '../../data/mergedList.json';
import AnimeCardStatic from '../AnimeCard/AnimeCardStaticTmdbVer.astro';
import EpisodeCard from '../EpisodeCard/EpisodeCard';
import { getAnimeById, getEpisodebySlug } from '../../filters/getAnimeById';
import Fuse from 'fuse.js';
import AnimeCardReact from '../AnimeCard/AnimeCardReact';
import { useDebounce } from 'use-debounce';

const animeOptions = {
    keys: [
        'slug',
        'title',
        'description',
        'keywords'
    ],
    threshold: 0.3,
    includeScore: true
};

const tsArr = animeArray as any[];

const animeSlicedList = tsArr.flatMap(anime => {
    const { nanoid, slug } = anime;
    const { title = 'N/A', description = 'N/A', keywords = '' } = anime ?? {};

    return {
        nanoid,
        slug,
        title,
        description,
        keywords
    }
})

const animeFuse = new Fuse(animeSlicedList, animeOptions);

const episodeOptions = {
    keys: ['epTitle', 'epSlug', 'ytTitle', 'description'],
    threshold: 0.3,
    includeScore: true
}

const episodeFlattenedList = tsArr.flatMap((anime: Anime, i: number) => {
    const { nanoid } = anime;
    if (!anime.episodes) return [];
    return anime.episodes.map(episode => {
        const { slug, title } = episode;
        let epTitle = 'Untitled';
        let description = 'no description';
        if (episode?.title) {
            epTitle = episode?.title || 'Untitled';
        }

        if (episode?.description) description = episode?.description || 'No Description';

        return {
            animeNanoid: nanoid,
            epSlug: slug,
            ytTitle: title,
            epTitle,
            description
        }
    })
});

const episodeFuse = new Fuse(episodeFlattenedList, episodeOptions);


export default function SearchCSR() {
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);
    const [animeResults, setAnimeResults] = useState<Anime[]>([]);
    const [episodeResults, setEpisodeResults] = useState<any[]>([]);

    useEffect(() => {
        if (debouncedQuery.trim().length === 0) {
            setAnimeResults([]);
            setEpisodeResults([]);
            return;
        }

        const foundAnime = animeFuse.search(query).map((r: any) => r.item);
        const foundEpisodes = episodeFuse.search(query).map((r: any) => r.item);

        const animeTitlesUsed = new Set();
        const episodeTitlesUsed = new Set();

        const completeAnimeList = foundAnime.map((a: any) => {
            const title = a.title || 'Untitled';
            const anime = getAnimeById(a.nanoid);
            const ep1Url = anime?.episodes?.[0]?.url;
            if (!ep1Url) return null;
            if (!anime || !title || animeTitlesUsed.has(ep1Url)) return null;
            animeTitlesUsed.add(ep1Url);
            return anime;
        }).filter(Boolean);

        const completeEpisodeList = foundEpisodes.map((e: any) => {
            const title = e.epTitle;
            if (!title || episodeTitlesUsed.has(title)) return null;
            const episode = getEpisodebySlug(e.animeNanoid, e.epSlug);
            episodeTitlesUsed.add(title);
            return episode;
        }).filter(Boolean);

        setAnimeResults(completeAnimeList);

        setEpisodeResults(completeEpisodeList);
    }, [debouncedQuery]);

    return (
        <>
            <div className="search-top">
                <div className="st-bar-div">
                    <input className="search-input" type="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    <div onClick={() => { setQuery('') }}>
                        <svg className="search-clear-btn" xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960"
                            width="28px" fill="#ffffff">
                            <path
                                d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="profile-main">
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
            </div>
        </>
    )
}