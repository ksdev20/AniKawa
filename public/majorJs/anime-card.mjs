import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";

let dataBaseWatchlist = [];
let hasFetched = false;

const isIndex = window.location.pathname.endsWith("index.html");

export function fetchWatchlist(force = false) {
    if (hasFetched && !force) return Promise.resolve(true);
    return fetch('http://localhost:3000/api/me?fields=watchlist', {
        method: 'GET',
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.data || !data.data.watchlist) throw new Error("Data not valid");

            dataBaseWatchlist = data.data.watchlist;
            hasFetched = true;
            return true;
        })
        .catch(e => {
            console.error(e.message);
            hasFetched = true;
            return true;
        });
}

export function checkWatchlist(title) {
    return dataBaseWatchlist.find(anime => anime?.anilist?.title == title);
}

export function createAnimeCard(anime) {
    let desc = anime.anilist.description;
    desc = desc.replace(/<br\s*\/?>/gi, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return `<div class="anime-card">
                <div class="anime-card-first">
                    <img class="anime-card-image" src="${anime.anilist.coverImage}" />
                    <div class="anime-card-title">${anime.anilist.title}</div>
                    <div class="anime-card-language">${anime.anilist.language}</div>

                    <div class="anime-card-hover" style="background-image: url(${anime.anilist.coverImage});">
                    <div class="anime-card-hover-details">
                        <div class="anime-card-hover-title">${anime.anilist.title}</div>
                        <div class="anime-card-hover-rating">${anime.anilist.score}</div>
                        <div class="anime-card-hover-episodes">${anime.anilist.episodes} Episodes</div>
                        <div class="anime-card-hover-description">${desc}</div>
                        <div class="anime-card-hover-actions">
                            <div class="tooltip" data-tip="Play S1 E1">
                                <svg class="card-action-play" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"
                                fill="#ff640a">
                                <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                                </svg>
                            </div>
                            <div class="tooltip" data-tip="Add to Watchlist">
                                <svg class="card-action-watchlist" xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px"
                                fill="#ff640a">
                                <path
                                    d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>`;
}

export function createAndAppendAnimeCard(anime, sliderElement, fn = () => "", disableCardClick = false) {
    const cardHtml = fn(anime);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHtml;
    const cardElement = tempDiv.firstElementChild;

    if (!disableCardClick) {
        cardElement.addEventListener('click', () => {
            localStorage.setItem('selectedAnime', JSON.stringify(anime));
            window.location.href = isIndex ? "./animePages/animeMainPage.html" : "../animePages/animeMainPage.html";
        });
    }

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
                window.location.href = isIndex ? "./episodePage/episodeMainPage.html"  : "../episodePage/episodeMainPage.html";
            }
        });
    });

    sliderElement.appendChild(cardElement);
}

const slider = document.getElementById("slider-container-hero");
const slider2 = document.getElementById("slider-container2");
const slider3 = document.getElementById("slider-container3");
const slider4 = document.getElementById("slider-container4");
const slider5 = document.getElementById("slider-container5");
const slider6 = document.getElementById("slider-container6");

export async function populateSlider(sliderElement, animeArray, fn = () => Boolean) {
    let added = 0;
    let usedTitles = [];
    for (const anime of animeArray) {
        if (added >= 20) return;
        if (!anime) continue;
        if (!fn(anime)) continue;
        if (usedTitles.includes(anime?.anilist?.title)) continue;
        usedTitles.push(anime?.anilist?.title);

        createAndAppendAnimeCard(anime, sliderElement, createAnimeCard);
        added++;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
}

if (slider) {
    fetchWatchlist().then(() => {
        hasFetched = true;
        populateSlider(slider, aniOneAsiaDataAnilist3, topRatedLast5);
        populateSlider(slider2, aniOneAsiaDataAnilist3, beginnerAnime);
        populateSlider(slider3, aniOneAsiaDataAnilist3, sameMonthAnimeGen);
        populateSlider(slider4, aniOneAsiaDataAnilist3, isPopular);
        populateSlider(slider5, aniOneAsiaDataAnilist3, actionPopular);
        populateSlider(slider6, aniOneAsiaDataAnilist3, adventurePopular);
        slidersHandler();
    });
}

function sameMonthAnimeGen(anime) {
    const currentDate = getCurrentDate();
    const startDate = anime?.anilist?.startDate.split('/');

    if ((currentDate[2] >= startDate[2]) && (currentDate[1] <= startDate[1])) {
        return true;
    }

    return false;
}

function beginnerAnime(anime) {
    const startDate = getYear(anime);
    const score = getScore(anime);

    if (startDate < getCurrentDate()?.[2] - 3 && startDate > getCurrentDate()?.[2] - 10 && score >= 7) {
        return true;
    } else {
        return false;
    }
}

function isPopular(anime) {
    const score = getScore(anime);
    if (score >= 8) {
        return true;
    } else {
        return false;
    }
}

function actionPopular(anime) {
    const score = getScore(anime);
    const isAction = genreCheck(anime, "Action");

    if (isAction && score >= 8) {
        return true;
    } else {
        return false;
    }
}

function adventurePopular(anime) {
    const score = getScore(anime);
    const isAdventure = genreCheck(anime, "Adventure");

    if (isAdventure && score >= 7) {
        return true;
    } else {
        return false;
    }
}

function topRatedLast5(anime) {
    const score = getScore(anime);
    const startDate = getYear(anime);

    if (startDate < getCurrentDate()[2] - 3 && startDate >= getCurrentDate()[2] - 10 && score >= 7.5) {
        return true;
    } else {
        return false;
    }
}

export function getScore(anime) {
    return parseFloat(anime?.anilist?.score.split(' ')[0]);
}

export function getYear(anime) {
    return anime?.anilist?.startDate.split('/')[2];
}

export function genreCheck(anime, genre) {
    return anime?.anilist?.genres.includes(genre);
}

export function getCurrentDate() {
    const now = new Date();
    const date = String(now.getDate());
    const month = String(now.getMonth());
    const year = String(now.getFullYear());

    const formattedData = [date, month, year];
    return formattedData;
}

export function toggleWatchlist(data, method, btn, delFromHis = false, ac2BtnText = null) {
    return fetch("http://localhost:3000/api/updateWatchlistOrHistory", {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ newItem: data, method, delFromHis })
    })
        .then(res => res.json())
        .then(data => {
            if (!data) throw new Error("Json parsed data not valid");
            if (data?.success) {
                if (data.action == 'added') {
                    console.warn(`✅ Added to ${method} successfully`);
                    if (method == 'watchlist') {
                        const path = "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z";
                        btn.querySelector('path').setAttribute('d', path);
                        if (ac2BtnText) ac2BtnText.innerHTML = "IN WATCHLIST";
                    }
                } else if (data.action == 'removed') {
                    console.warn(`✅ Removed from ${method} successfully`);
                    if (method == 'watchlist') {
                        const path = "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z";
                        btn.querySelector('path').setAttribute('d', path);
                        if (ac2BtnText) ac2BtnText.innerHTML = "ADD TO WATCHLIST";
                    }
                }
                return true;
            } else {
                console.error("❌ Unsuccessful");
                return false;
            }
        })
        .catch(e => {
            console.error(e.message);
            return false;
        });
}

export function slidersHandler() {
    const sliderWrapper = document.querySelectorAll(".slider-content-wrapper");

    sliderWrapper.forEach(sw => {
        const sliderContainer = sw.querySelector(".slider-container");
        const btnL = sw.querySelector(".slider-btn.left") || sw.querySelector(".slider-btn.left.hidden");
        const btnR = sw.querySelector(".slider-btn.right") || sw.querySelector(".slider-btn.right.hidden");

        function update() {
            const scrollLeft = sliderContainer.scrollLeft;
            const cWidth = sliderContainer.clientWidth;

            btnL.classList.toggle("hidden", scrollLeft <= 5);
            btnR.classList.toggle("hidden", scrollLeft + cWidth >= sliderContainer.scrollWidth - 1);
        }

        function lock() {
            btnL.classList.add("disable-click");
            btnR.classList.add("disable-click");
            setTimeout(() => {
                btnL.classList.remove("disable-click");
                btnR.classList.remove("disable-click");
            }, 400);
        }

        btnL.onclick = () => { sliderContainer.scrollBy({ left: -sliderContainer.clientWidth, behavior: 'smooth' }); lock(); };
        btnR.onclick = () => { sliderContainer.scrollBy({ left: sliderContainer.clientWidth, behavior: 'smooth' }); lock(); }
        sliderContainer.addEventListener('scroll', update);

        update();
    });
}

document.addEventListener('DOMContentLoaded', slidersHandler);
