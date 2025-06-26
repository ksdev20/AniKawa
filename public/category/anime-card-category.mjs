import { createAndAppendAnimeCard, createAnimeCard, genreCheck, getCurrentDate, getYear, getScore, fetchWatchlist, slidersHandler } from "../majorJs/anime-card.mjs";
import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";

function createSlider(cat) {
    return `<div id="${cat}-slider" class="anime-slider-section cat-slider">
        <div class="slider-heading cat-slider-heading">
            <div class="slider-heading-text-big cat-slider-heading-big">${cat}</div>
            <div id="" class="view-all-text-section">
                VIEW ALL
                <svg class="view-all-icon" xmlns="http://www.w3.org/2000/svg" height="17px"
                    viewBox="0 -960 960 960" width="17px" fill="#666666">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
                </svg>
            </div>
        </div>
        <div class="slider-content-wrapper sl">
            <div id="slider-buttons-section" class="slider-btn-section sbs-category">
                <div class="slider-btn left">
                    <svg class="s-btn" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                        width="30px" fill="#ffffff">
                        <path
                            d="m382-480 294 294q15 15 14.5 35T675-116q-15 15-35 15t-35-15L297-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T676-844q15 15 15 35t-15 35L382-480Z" />
                    </svg>
                </div>
                <div class="slider-btn right">
                    <svg class="s-btn" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                        width="30px" fill="#ffffff">
                        <path
                            d="M579-480 285-774q-15-15-14.5-35.5T286-845q15-15 35.5-15t35.5 15l307 308q12 12 18 27t6 30q0 15-6 30t-18 27L356-115q-15 15-35 14.5T286-116q-15-15-15-35.5t15-35.5l293-293Z" />
                    </svg>
                </div>
            </div>
            <div id="${cat}" class="slider-container">
            </div>
        </div>
    </div>`;
}

async function populateSlider(sliderElement, animeArray, fn = () => Boolean, category, mainCategory) {
    let added = 0;
    let usedTitles = [];
    let finalCategoryData = [];
    for (const anime of animeArray) {
        if (!anime) continue;
        if (!fn(anime, category, mainCategory)) continue;
        if (usedTitles.includes(anime?.anilist?.title)) continue;
        usedTitles.push(anime?.anilist?.title);
        finalCategoryData.push(anime);

        if (added <= 20) {
            createAndAppendAnimeCard(anime, sliderElement, createAnimeCard);
            added++;
        }
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    return finalCategoryData;
}

function main() {
    const categoryJson = JSON.parse(localStorage.getItem('selectedCategory'));
    if (!categoryJson && !categoryJson?.name) return;
    const mainCategory = categoryJson?.name;
    document.getElementById("category-text").innerHTML = categoryJson.name;
    document.getElementById("category-text-cat-des").innerHTML = categoryJson.extra;

    const mainRoot = document.getElementById("main-root");
    const categories = ["Popular", "New", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Music", "Romance", "Sci-Fi", "Sports", "Supernatural", "Thriller"];

    for (const category of categories) {
        if (category == mainCategory) continue;

        const cardHtml = createSlider(category);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        const c = tempDiv.firstElementChild;
        const cardElement = c.querySelector(".view-all-text-section");
        if (!cardElement) continue;

        cardElement.addEventListener('click', () => {
            localStorage.setItem('view-all-category', JSON.stringify({
                mainCategory: mainCategory,
                category: category
            }));
            window.location.href = "./sub-category.html";
        });

        mainRoot.appendChild(c);

        populateSlider(document.getElementById(`${category}`), aniOneAsiaDataAnilist3, matchCategories, category, mainCategory)
            .then(finalData => {
                if (!finalData || finalData.length == 0) {
                    document.getElementById(`${category}-slider`)?.remove();
                } else {
                    localStorage.setItem(`${category}Data`, JSON.stringify({ finalData }));
                }
            });
    }
    slidersHandler();
}

function getTitle(anime) {
    return anime?.anilist?.title;
}

function matchCategories(anime, cat, mainCategory) {
    if (cat == 'Popular') {
        const score = getScore(anime);

        if (score >= 7 && genreCheck(anime, mainCategory)) {
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

document.addEventListener('DOMContentLoaded', () => {
    fetchWatchlist(true).then(() => {
        main();
    });
});