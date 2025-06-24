import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";
import { createAnimeCardNewPop } from "../cardTemplates/createAnimeCardNewPop.mjs";
import { toggleWatchlist, createAndAppendAnimeCard, fetchWatchlist } from "../majorJs/anime-card.mjs";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.min.js";

const options = {
    keys: [
        'anilist.title',
        'anilist.romaji',
        'cleantitle'
    ],
    threshold: 0.3,
    includeScore: true
};

const animeFuse = new Fuse(aniOneAsiaDataAnilist3, options);

const flattenedData = aniOneAsiaDataAnilist3.flatMap(anime =>
    anime.videos.map(video => {
        const epDetail = video?.episodeDetails?.[0] || {};

        return {
            anime,
            animeTitle: anime.anilist.title || anime.cleanTitle || "N/A",
            language: anime.anilist.language || anime.language || "N/A",
            score: anime.anilist.score || "N/A",
            video,
            episodeTitle: epDetail.title || "N/A",
            episodeImage: epDetail.thumbnail,
            episodeDetails: epDetail.description || "N/A",
            allEpisodes: anime.videos
        }
    })
);

const episodeFuse = new Fuse(flattenedData, {
    keys: ['episodeTitle', 'episodeDetails'],
    threshold: 0.3
});

const searchInput = document.querySelector(".search-input");
const searchClearBtn = document.querySelector(".search-clear-btn");

const animeResults = document.getElementById("anime-results");
const episodeResults = document.getElementById("episode-results");

const arBox = document.getElementById("ar-box");
const erBox = document.getElementById("er-box");

function searchMechanism() {
    searchInput.addEventListener('input', () => {
        animeResults.innerHTML = ' ';
        episodeResults.innerHTML = ' ';

        if (searchInput.value.length > 0) {
            searchClearBtn.style.display = "flex";
            arBox.classList.add("show");
            erBox.classList.add("show");

            const query = searchInput.value.trim();

            const animeMatches = animeFuse.search(query).map(r => r.item);
            const episodeMatches = episodeFuse.search(query).map(r => r.item);

            const usedAnime = [];
            const usedEpisodes = [];

            for (const anime of animeMatches) {
                if (usedAnime.includes(anime?.anilist?.title)) continue;

                createAndAppendAnimeCard(anime, animeResults, createAnimeCardNewPop);
                usedAnime.push(anime?.anilist?.title);
            }

            if (usedAnime.length == 0) arBox.classList.remove("show");

            for (const episode of episodeMatches) {
                if (usedEpisodes.includes(episode?.episodeTitle)) continue;
                if (episode?.episodeTitle == 'N/A') continue;

                const cardHtml = createEpisodeCard(episode);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHtml;
                const cardElement = tempDiv.firstElementChild;

                cardElement.addEventListener('click', () => {

                    const episodePageData = {
                        animeTitle: episode.animeTitle,
                        lang: episode.language,
                        score: episode.score
                    };

                    const idx = episode.video.episodeNumber - 1;

                    const epData = {
                        episode: episode.video,
                        meta: episodePageData,
                        idx: idx,
                        allEpisodes: episode.allEpisodes
                    };

                    const anime = episode.anime;
                    localStorage.setItem('selectedAnime', JSON.stringify(anime));

                    localStorage.setItem('selectedEpisode', JSON.stringify(epData));
                    toggleWatchlist(epData, 'history', null).then(res => {
                        if (res) {
                            window.location.href = "../episodePage/episodeMainPage.html";
                        }
                    });
                });

                episodeResults.appendChild(cardElement);
                usedEpisodes.push(episode?.episodeTitle);
            }
            if (usedEpisodes.length == 0) erBox.classList.remove("show");
        }
        else {
            searchClearBtn.style.display = "none";
            arBox.classList.remove("show");
            erBox.classList.remove("show");
        }
    });
}

searchClearBtn.addEventListener('click', () => {
    searchInput.value = "";
    searchClearBtn.style.display = "none";
    arBox.classList.remove("show");
    erBox.classList.remove("show");
});

function createEpisodeCard(episode) {
    const animeTitle = episode.animeTitle;
    const lang = episode.language;
    const episodeImg = episode.episodeImage || "/assets/anime-images/episode-thumbnail-alt-2.png";
    const eTitle = episode.episodeTitle;
    const eDescription = episode.episodeDetails || "N/A";
    return `<a class="episode-card" href="../episodePage/episodeMainPage.html">
                            <div class="episode-card-first">
                                <img class="episode-card-image"
                                    src=${episodeImg} />
                                <div class="anime-title">${animeTitle}</div>
                                <div class="episode-number-name">${eTitle}</div>
                                <div class="language-section">${lang}</div>

                                <div class="episode-card-hover">
                                <div class="anime-title">${animeTitle}</div>
                                <div class="episode-number-name">${eTitle}</div>
                                <div class="episode-number-name episode-description">
                                    ${eDescription}
                                </div>
                                <div class="episode-play-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" width="40px"
                                        viewBox="0 -960 960 960" fill="#ff640a">
                                        <path
                                            d="M360-272.31v-415.38L686.15-480 360-272.31ZM400-480Zm0 134 211.54-134L400-614v268Z" />
                                    </svg>
                                    PLAY
                                </div>
                            </div>
                            </div>
                        </a>`;
}

document.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
    fetchWatchlist(true).then(searchMechanism);
});