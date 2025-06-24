function updateMainContent(anime) {
    const anilist = anime.anilist;
    let genre_str = "";
    anilist.genres.forEach((g, idx) => {
        if ((idx + 1) >= anilist.genres.length) {
            genre_str += `${g}`;
        } else {
            genre_str += `${g} , `;
        }
    });

    return `<div id="top-banner" class="top-banner"
            style="background-image: url(${anilist.bannerImage});">
            <div class="bottom-gradient"></div>
            </div>
             <div id="overlay-main" class="overlay-main">
                <div class="empty-top-banner"></div>
                <div class="anime-hero-section">
                    <div class="hero-column image">
                        <img id="card-image" class="card-image"
                            src=${anilist.coverImage} />
                    </div>
                    <div class="hero-column metadata">
                        <div class="titles-section">
                            <div id="title-english" class="poetsen-one-regular english">${anilist.title}</div>
                            <div id="title-romaji" class="poetsen-one-regular romaji">${anilist.romaji}</div>
                            <svg id="wBtn-animepage" class="watchlist-btn-animepage" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px"
                            fill="#ffffff">
                            <path
                                d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                            </svg>
                        </div>
                        <div class="description-section">
                            <div class="des-only">
                                <p id="description-anime-hero" class="description-anime-hero">${anilist.description}</p>
                            </div>
                            <div class="other-metadata">
                                <p class="metadata-value"><b class="metadata-label">Type:</b> ${anilist.type}</p>
                                <p class="metadata-value"><b class="metadata-label">Episodes: </b>${anilist.episodes}</p>
                                <p class="metadata-value"><b class="metadata-label">Status: </b>${anilist.status}</p>
                                <p class="metadata-value"><b class="metadata-label">Duration: </b>${anilist.duration}</p>
                                <p class="metadata-value"><b class="metadata-label">Aired: </b>${anilist.startDate} to ${anilist.endDate}</p>
                                <p class="metadata-value"><b class="metadata-label">Season: </b>${anilist.season}</p>
                                <p class="metadata-value"><b class="metadata-label">Genres: </b>${genre_str}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="episodes-section">
                    <div class="top-controls">
                        <div class="top-controls-btn">
                            <svg class="arrow-down" xmlns="http://www.w3.org/2000/svg" height="30px"
                                viewBox="0 -960 960 960" width="30px" fill="#ffffff">
                                <path d="M480-360 280-560h400L480-360Z" />
                            </svg>
                            <div class="season-text">S1: ${anilist.title}</div>
                        </div>
                        <div id="sort-btn-apage" class="new-first-right part">
                        <div class="new-first-right">
                            <svg class="part-icon" xmlns="http://www.w3.org/2000/svg" height="30px"
                                viewBox="0 -960 960 960" width="30px" fill="#666666">
                                <path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z" />
                            </svg>
                            <div class="filter-name">SORT</div>
                        </div>
                        <div class="dropdown-new-pop">
                            <div class="dropdown-new-pop-btn pop-new" data-filter="new">Newest</div>
                            <div class="dropdown-new-pop-btn pop-new" data-filter="old">Oldest</div>
                        </div>
                        </div>
                    </div>
                    <div id="episodes-list" class="episodes-list">
                    </div>
                    <div class="episode-list-endline"></div>
                    <div class="season-change-section">
                        <div class="season-change-section scs-part">
                            <svg class="chevron-arrow" xmlns="http://www.w3.org/2000/svg" height="15px"
                                viewBox="0 -960 960 960" width="15px" fill="#808080">
                                <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                            </svg>
                            PREVIOUS SEASON
                        </div>
                        <div class="season-change-section scs-part">
                            NEXT SEASON
                            <svg class="chevron-arrow" xmlns="http://www.w3.org/2000/svg" height="15px"
                                viewBox="0 -960 960 960" width="15px" fill="#808080">
                                <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="more-section">
                    <div class="anime-slider-section ms-anime-slider">
                    <div class="slider-heading sl-heading-apage">
                        <div class="slider-section-text-big" style="font-size: 23px;">More Like This</div>
                    </div>
                    <div class="slider-content-wrapper">
                        <div id="slider-buttons-section" class="slider-btn-section">
                            <div class="slider-btn left">
                                <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                                    width="30px" fill="#ffffff">
                                    <path
                                        d="m382-480 294 294q15 15 14.5 35T675-116q-15 15-35 15t-35-15L297-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T676-844q15 15 15 35t-15 35L382-480Z" />
                                </svg>
                            </div>
                            <div class="slider-btn right">
                                <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                                    width="30px" fill="#ffffff">
                                    <path
                                        d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z" />
                                </svg>
                            </div>
                        </div>
                        <div id="slider-container" class="sl-heading-apage slider-container">
                        </div>
                    </div>
                </div>
                </div>
                <div class="site-footer">
        <a href="../legalStuff/terms.html" target="_blank">Terms of Services</a>
        <div class="sf-separator" target="_blank">|</div>
        <a href="../legalStuff/privacy.html" target="_blank">Privacy Policies</a>
        <div class="sf-separator">|</div>
        <a href="../legalStuff/about.html">About</a>
        <div class="sf-separator">|</div>
        <a href="../legalStuff/credits.html">Credits</a>
    </div>
            </div`;
}

/*MORE LIKE THIS ANIME SLIDER HANDLING */

import { createAnimeCard, getScore, genreCheck, toggleWatchlist, slidersHandler } from "../majorJs/anime-card.mjs";
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
            window.location.reload();
            window.scrollTo(0, 0);
        });

        const watchlistBtn = cardElement.querySelector(".card-action-watchlist");

        watchlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchlist(anime, 'watchlist', watchlistBtn);
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

function loadMainData(newFirst) {
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

    const overlayMain = document.getElementById("main");

    overlayMain.innerHTML = updateMainContent(animeJson);

    sortBtnHandler();

    const orderedArray = newFirst ? animeJson.videos.slice().reverse() : animeJson.videos.slice();

    orderedArray.forEach((episode) => {
        const allEpisodes = animeJson.videos;
        const episodeList = document.getElementById("episodes-list");

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

    populateSlider(MLTSlider, aniOneAsiaDataAnilist3, matchCategories, 'Popular', mainCategory, secondCategory);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMainData(false);
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

let showingSDD = false;

function sortBtnHandler() {
    const sortBtn = document.getElementById("sort-btn-apage");
    const sortDD = sortBtn.querySelector(".dropdown-new-pop");

    function showSortDropdown() {
        sortDD.classList.add("active");
        sortBtn.classList.add("active");
        showingSDD = true;
    }

    function hideSortDropdown() {
        sortDD.classList.remove("active");
        sortBtn.classList.remove("active");
        showingSDD = false;
    }

    sortBtn.addEventListener('click', () => {
        if (!showingSDD) {
            showSortDropdown();
        } else {
            hideSortDropdown();
        }
    });

    sortDD.querySelectorAll(".dropdown-new-pop-btn.pop-new").forEach(btn => {
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

function sHandler() {
    const sw = document.querySelector(".slider-content-wrapper");

    const sliderContainer = sw.querySelector(".slider-container");

    sw.querySelector(".slider-btn.left").addEventListener('click', () => {
        console.log("Scrolling left");
        sliderContainer.scrollBy({ left: -sliderContainer.clientWidth, behavior: 'smooth' });
    });

    sw.querySelector(".slider-btn.right").addEventListener('click', () => {
        console.log("Scrolling right");
        sliderContainer.scrollBy({ left: sliderContainer.clientWidth, behavior: 'smooth' });
    });
}