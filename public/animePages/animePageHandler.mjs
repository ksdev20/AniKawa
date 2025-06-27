const mainSkeleton = document.getElementById("main-skeleton");
const mainContent = document.getElementById("main");
let hasRunUpdateMC = false;

function updateMainContent(anime) {
    const anilist = anime.anilist;

    const topB = document.getElementById("top-banner");
    const cardImg = document.getElementById("card-image");
    const tE = document.getElementById("title-english");
    const tR = document.getElementById("title-romaji");
    const des = document.getElementById("description-anime-hero");
    const omd = document.getElementById("other-metadata");
    const titleS = document.getElementById("season-text");

    topB.style.backgroundImage = `url(${anilist.bannerImage})`;
    cardImg.src = `${anilist.coverImage}`;
    tE.innerHTML = `${anilist.title}`;
    tR.innerHTML = `${anilist.romaji}`;
    des.innerHTML = `${anilist.description}`;
    omd.innerHTML = generateSideData(anilist);
    titleS.innerHTML = `S1: ${anilist.title}`;

    cardImg.addEventListener('load', () => {
        mainSkeleton.classList.add("hidden");
        mainContent.classList.remove("remove");
    });

    if (cardImg.complete) {
        mainSkeleton.classList.add("hidden");
        mainContent.classList.remove("remove");
    }
    hasRunUpdateMC = true;
}

function generateSideData(anilist) {
    let genre_str = "";
    anilist.genres.forEach((g, idx) => {
        if ((idx + 1) >= anilist.genres.length) {
            genre_str += `${g}`;
        } else {
            genre_str += `${g} , `;
        }
    });

    return `<p class="metadata-value"><b class="metadata-label">Type:</b> ${anilist.type}</p>
            <p class="metadata-value"><b class="metadata-label">Episodes: </b>${anilist.episodes}</p>
            <p class="metadata-value"><b class="metadata-label">Status: </b>${anilist.status}</p>
            <p class="metadata-value"><b class="metadata-label">Duration: </b>${anilist.duration}</p>
            <p class="metadata-value"><b class="metadata-label">Aired: </b>${anilist.startDate} to ${anilist.endDate}</p>
            <p class="metadata-value"><b class="metadata-label">Season: </b>${anilist.season}</p>
            <p class="metadata-value"><b class="metadata-label">Genres: </b>${genre_str}</p>`;
}

/*MORE LIKE THIS ANIME SLIDER HANDLING */

import { createAnimeCard, getScore, genreCheck, toggleWatchlist, slidersHandler, fetchWatchlist, checkWatchlist } from "../majorJs/anime-card.mjs";
import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";


function matchCategories(anime, cat, mainCategory, secondCategory) {
    if (cat == 'Popular') {
        const score = getScore(anime);

        if (score >= 5 && genreCheck(anime, mainCategory) && genreCheck(anime, secondCategory)) {
            return true;
        } else {
            return false;
        }
    }
    if (cat == 'New') {
        const startYear = getYear(anime);
        const currentYear = getCurrentDate()[2];

        if (startYear >= currentYear - 5 && genreCheck(anime, mainCategory)) {
            return true;
        } else {
            return false;
        }
    }

    if (genreCheck(anime, mainCategory) && genreCheck(anime, cat)) {
        return true;
    } else {
        return false;
    }
}

function populateSlider(sliderElement, animeArray, fn = () => Boolean, cat, mainCat, secCat) {
    let added = 0;
    let usedTitles = [];
    usedTitles.push(animeTitle);
    for (const anime of animeArray) {
        if (added >= 20) return;
        if (!anime) continue;
        if (!fn(anime, cat, mainCat, secCat)) continue;
        if (usedTitles.includes(anime?.anilist?.title)) continue;
        usedTitles.push(anime?.anilist?.title);

        const cardHtml = createAnimeCard(anime);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        const cardElement = tempDiv.firstElementChild;

        cardElement.addEventListener('click', () => {
            localStorage.setItem('selectedAnime', JSON.stringify(anime));
            window.open("/animePages/animeMainPage.html", "_blank");
        });

        const watchlistBtn = cardElement.querySelector(".card-action-watchlist");

        watchlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchlist(anime, 'watchlist', watchlistBtn).then(() => fetchWatchlist(true));
        });

        const title = anime?.anilist?.title || anime?.cleanTitle;

        const isInWatchlist = checkWatchlist(title);

        if (isInWatchlist) {
            const path = "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z";
            watchlistBtn.querySelector('path').setAttribute('d', path);
        }

        const playBtn = cardElement.querySelector(".card-action-play");

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const episodePageData = {
                animeTitle: anime?.anilist?.title,
                lang: anime?.anilist?.language,
                score: anime?.anilist?.score
            };

            const epData = {
                episode: anime?.videos?.[0],
                meta: episodePageData,
                idx: 0,
                allEpisodes: anime?.videos
            };

            localStorage.setItem('selectedAnime', JSON.stringify(anime));
            localStorage.setItem('selectedEpisode', JSON.stringify(epData));
            toggleWatchlist(epData, 'history').then(res => {
                if (res) {
                    window.location.href = "/episodePage/episodeMainPage.html";
                }
            });
        });

        sliderElement.appendChild(cardElement);
        added++;
    }
}

/**/

let animeTitle = " ";
let lang = " ";
let score = " ";
let animeJson = null;
let mainCategory = '';
let secondCategory = '';

function loadMainData(newFirst = false) {
    animeJson = JSON.parse(localStorage.getItem('selectedAnime'));
    if (!animeJson) return;
    animeTitle = animeJson?.anilist?.title || animeJson?.cleanTitle;
    lang = animeJson?.language || "N/A";
    score = animeJson?.anilist?.score || "N/A";
    mainCategory = animeJson?.anilist?.genres?.[0];
    secondCategory = animeJson?.anilist?.genres?.[1];
    const episodePageData = {
        animeTitle: animeTitle,
        lang: lang,
        score: score
    };

    if (!hasRunUpdateMC) updateMainContent(animeJson);

    const orderedArray = newFirst ? animeJson.videos.slice().reverse() : animeJson.videos.slice();

    const episodeList = document.getElementById("episodes-list");
    episodeList.innerHTML = ' ';

    orderedArray.forEach((episode) => {
        const allEpisodes = animeJson.videos;

        const cardHtml = createEpisodeCard(episode);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        const cardElement = tempDiv.firstElementChild;

        const idx = episode?.episodeNumber - 1;

        cardElement.addEventListener('click', () => {
            const epData = {
                episode: episode,
                meta: episodePageData,
                idx: idx,
                allEpisodes,
            };

            localStorage.setItem('selectedEpisode', JSON.stringify(epData));
            toggleWatchlist(epData, 'history', null).then(res => {
                if (res) {
                    window.location.href = "../episodePage/episodeMainPage.html";
                }
            });
        });

        episodeList.appendChild(cardElement);
    });

    const wBtnAnimepage = document.getElementById("wBtn-animepage");

    if (wBtnAnimepage) {
        wBtnAnimepage.addEventListener('click', () => {
            toggleWatchlist(animeJson, 'watchlist', wBtnAnimepage);
        });
    }

    const MLTSlider = document.getElementById("slider-container");

    fetchWatchlist(true).then(() => {
        if (checkWatchlist(animeTitle)) {
            const path = "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z";
            wBtnAnimepage.querySelector('path').setAttribute('d', path);
            wBtnAnimepage.classList.remove("hidden");
            document.querySelector(".loader.loader-wbtn").classList.add("hidden");
        }
        populateSlider(MLTSlider, aniOneAsiaDataAnilist3, matchCategories, 'Popular', mainCategory, secondCategory);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadMainData(false);
    sortBtnHandler();
    slidersHandler();
});

function createEpisodeCard(videos) {
    const episodeImg = videos?.episodeDetails?.[0]?.thumbnail || "../assets/anime-images/episode-thumbnail-alt-2.png";
    const eTitle = videos?.episodeDetails?.[0]?.title || `Episode ${videos?.episodeNumber || "N/A"}`;
    const eDescription = videos?.episodeDetails?.[0]?.description || "No description.";
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

/*sort btn handler */

function sortBtnHandler() {
    const sortBtn = document.getElementById("sort-btn-apage");
    const sortDD = document.getElementById("dropdown-new-pop");

    function showSortDropdown() {
        sortDD.classList.add("active");
        sortBtn.classList.add("active");
    }

    function hideSortDropdown() {
        sortDD.classList.remove("active");
        sortBtn.classList.remove("active");
    }

    sortBtn.addEventListener('click', () => {
        if (sortDD.classList.contains("active")) {
            hideSortDropdown();
        } else {
            showSortDropdown();
        }
    });

    const sortNew = document.getElementById("sort-new");
    const sortOld = document.getElementById("sort-old");

    [sortNew, sortOld].forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter == 'new') {
                loadMainData(true);
                slidersHandler();
            } else {
                loadMainData(false);
                slidersHandler();
            }
        });
    });
}