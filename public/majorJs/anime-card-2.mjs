import { toggleWatchlist, fetchWatchlist, checkWatchlist } from "./anime-card.mjs";
import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";

/*let dataBaseWatchlist = [];*/

function createAnimeCard2(anime) {
    const data = anime?.anilist;
    return `<div class="wrapper">
        <img class="anime-card-2-image" src="${data?.coverImage}" />
        <div class="anime-card-2-details">
            <div class="anime-card-2-heading">${data?.title}</div>
            <div class="anime-card-sub-dub">${data?.language}</div>
            <div class="anime-card-2-para">${data?.description}</div>
            <div class="anime-card-2-btn-section">
                <div class="start-watching-btn card-2">
                    <img class="watch-logo" src="./assets/icons/play_arrow_24dp_black.svg" />
                    START WATCHING S1 E1
                </div>
                <div id="anime-card-2-watchlist-btn" class="anime-card-2-watchlist-btn">
                    <svg class="wat-icon-ac-2" xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px"
                        fill="#ff640a">
                        <path
                            d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                    </svg>
                    <div id="ac-2-wat-text" class="anime-card-2-watchlist-text">ADD TO WATCHLIST</div>
                </div>
            </div>
        </div>
    </div>`;
}

let usedTitles = [];
let categories = ["Romance", "Action", "Action", "Comedy", "Adventure", "Fantasy"];
let idx = 0;

function populateAnimeCard2(cardElement, animeArray, fn = () => Boolean) {
    for (const anime of animeArray) {
        if (!anime) continue;
        if (!anime?.anilist) continue;
        if (usedTitles.includes(anime?.anilist?.title)) continue;
        if (!fn(anime, categories[idx])) continue;

        const cardHtml = createAnimeCard2(anime);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        const cElement = tempDiv.firstElementChild;

        const wBtn = cElement.querySelector(".wat-icon-ac-2");
        const wBtnText = cElement.querySelector(".anime-card-2-watchlist-text");

        cElement.querySelector(".anime-card-2-watchlist-btn").addEventListener('click', () => {
            toggleWatchlist(anime, 'watchlist', wBtn, false, wBtnText);
        });

        const t = anime?.anilist?.title || anime?.cleanTitle;

        if (checkWatchlist(t)) {
            const path = "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z";
            wBtn.querySelector('path').setAttribute('d', path);
            wBtnText.innerHTML = "IN WATCHLIST";
        }

        cardElement.appendChild(cElement);

        cElement.querySelector(".anime-card-2-image").addEventListener('click', () => {
            localStorage.setItem('selectedAnime', JSON.stringify(anime));
            window.location.href = "./animePages/animeMainPage.html";
        });

        cElement.querySelector(".anime-card-2-heading").addEventListener('click', () => {
            localStorage.setItem('selectedAnime', JSON.stringify(anime));
            window.location.href = "./animePages/animeMainPage.html";
        });

        cElement.querySelector(".start-watching-btn.card-2").addEventListener('click', () => {
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
                    window.location.href = "./episodePage/episodeMainPage.html";
                }
            });
        });

        usedTitles.push(anime?.anilist?.title);

        idx++;
        return;
    }
}

const sliders = [];

for (let i = 1; i < 7; i++) {
    const el = document.getElementById(`anime-card-2-${i}`);
    if (el) sliders.push(el);
}

fetchWatchlist().then(() => {
    sliders.forEach(s => {
        populateAnimeCard2(s, aniOneAsiaDataAnilist3, thisYearTopByCategory);
    });
});

function thisYearTopByCategory(anime, category) {
    const score = parseFloat(anime?.anilist?.score.split(' ')?.[0]);
    if (!score) return false;
    const startYear = anime?.anilist?.startDate?.split('/')?.[2];
    if (!startYear) return false;

    if (startYear >= getCurrentDate()?.[2] - 1 && anime?.anilist?.genres?.includes(category) && score >= 7) {
        return true;
    } else {
        return false;
    }
}

function getCurrentDate() {
    const now = new Date();
    const date = String(now.getDate());
    const month = String(now.getMonth());
    const year = String(now.getFullYear());

    const formattedData = [date, month, year];
    return formattedData;
}