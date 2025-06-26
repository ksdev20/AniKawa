/* NEW HERO SECTION CODE*/

import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";
import { createAndAppendAnimeCard, fetchWatchlist, checkWatchlist } from "./anime-card.mjs";

const heroSlider = document.getElementById("hs-slider");
let interval;
let idx = 0;
let bars = [];
let cards = [];

function createHeroCard(anime) {
    const { title, language, description, coverImage, bannerImage, color } = anime?.anilist;
    return `<div class="hero-section-root">
            <div class="hs-img-section">
                <img class="hs-anime-img"
                    src=${coverImage} />
                <div class="hero-section-overlay">
                    <div class="hs-title">${title}</div>
                    <span class="dub-sub">${language}</span>
                    <p class="hero-description">${description}</p>
                    <div class="hero-button-section">
                        <div class="card-action-play start-watching-btn hero-play">
                            <img src="./assets/icons/play_arrow_24dp_black.svg" class="watch-logo" />
                            START WATCHING S1 E1
                        </div>
                        <div class="watchlist-btn">
                            <svg class="card-action-watchlist" xmlns="http://www.w3.org/2000/svg" height="28px"
                                viewBox="0 -960 960 960" width="28px" fill="#ff640a">
                                <path
                                    d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <img class="hs-anime-banner"
                src=${bannerImage} />
            <div class="hero-gradient-left" style="background: linear-gradient(to right, ${color}, transparent);"></div>
            <div class="hero-gradient-bottom"></div>
        </div>`;
}

const heroAnime = ["JUJUTSU KAISEN Season2", "Dr. STONE Season 4", "Astra Lost in Space", "BLEACH: Thousand-Year Blood War - The Conflict", "Umamusume: Pretty Derby Season 2"];

function hsPoplator() {
    fetchWatchlist(true).then(() => {
        document.querySelector(".hs-slider.skeleton").classList.add("hidden");
        for (const a of heroAnime) {
            const anime = aniOneAsiaDataAnilist3.find(n => n?.cleanTitle == a);

            if (anime) {
                createAndAppendAnimeCard(anime, heroSlider, createHeroCard, true);
            }
        }
        scrollHandler();
    });
}

function scrollHandler() {
    bars = document.querySelectorAll('.progress-bar');
    cards = heroSlider.querySelectorAll('.hero-section-root');

    bars.forEach((bar, i) => {
        bar.addEventListener('click', () => {
            const i = Number(bar.dataset.index);
            mainScrollFn(i);
            resetAutoScroll();
        });
    });
    startAutoScroll();
}

function mainScrollFn(i = null) {
    idx = i ? i : (idx + 1) % bars.length;
    const target = cards[idx];
    heroSlider.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });

    bars.forEach(bar => bar.classList.remove("active"));
    bars[idx].classList.add("active");
}

function startAutoScroll() {
    interval = setInterval(mainScrollFn, 4000);
}

function resetAutoScroll() {
    clearInterval(interval);
    startAutoScroll();
}

document.addEventListener('DOMContentLoaded', hsPoplator);