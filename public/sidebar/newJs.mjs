import { aniOneAsiaDataAnilist3 } from "../data/aniOneAsiaDataAnilist3.mjs";
import { createAnimeCardNewPop } from "../cardTemplates/createAnimeCardNewPop.mjs";
import { fetchWatchlist, createAndAppendAnimeCard } from "../majorJs/anime-card.mjs";

function loadMain() {
    const newPopJson = JSON.parse(localStorage.getItem('selectedSidebarBtn'));
    const currentFilter = JSON.parse(localStorage.getItem('currentFilter'))?.filter || "all";
    if (!newPopJson?.title || !newPopJson?.des || !newPopJson?.filter) return;
    document.getElementById("new-popular-page-title").innerHTML = newPopJson.title;
    document.getElementById("new-popular-first-heading").innerHTML = newPopJson.des;
    document.getElementById("new-popular-first-filter-name").innerHTML = newPopJson.filter;
    const newAnimeList = document.getElementById("new-popular-anime-list");
    newAnimeList.innerHTML = ' ';
    let sortedList = [];
    sortedList = aniOneAsiaDataAnilist3.slice().filter(anime => {
        return currentFilter == 'all' ? true : anime?.anilist?.language.toLowerCase() == currentFilter.toLowerCase();
    });

    if (newPopJson.title == 'Popular Anime') {
        sortedList.sort((a, b) => {
            const scoreA = parseFloat(a?.anilist?.score) || 5;
            const scoreB = parseFloat(b?.anilist?.score) || 4;

            return scoreB - scoreA;
        });
    } else {
        sortedList.sort((a, b) => {
            const dateA = new Date(a?.anilist?.startDate || "1/1/1990");
            const dateB = new Date(b?.anilist?.startDate || "1/1/1990");
            return dateB - dateA;
        });
    }

    if (sortedList.length == 0) return;
    let usedTitles = [];
    sortedList.forEach(anime => {
        if (usedTitles.includes(anime?.anilist?.title)) return;

        createAndAppendAnimeCard(anime, newAnimeList, createAnimeCardNewPop);
        usedTitles.push(anime?.anilist?.title);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWatchlist(true).then(() => {
        document.querySelector(".new-pop-anime-list.skeletons").classList.add("hidden");
        loadMain();
    });
});

const filterNewPopBtn = document.getElementById("filter-new-pop");
const filterLanguage = document.getElementById("filter-language");
const pageTitle = document.getElementById("new-popular-page-title");
let showingNewPopDropdown = false;
let showingLanguageDropdown = false;

function showDropdown(btn, filter) {
    btn.style.backgroundColor = "#242424";
    btn.querySelector(".dropdown-new-pop").style.display = "flex";
    if (filter == 'new-pop-filter') {
        showingNewPopDropdown = true;
    } else {
        showingLanguageDropdown = true;
    }
}

function hideDropdown(btn, filter) {
    btn.style.backgroundColor = "transparent";
    btn.querySelector(".dropdown-new-pop").style.display = "none";
    if (filter == 'new-pop-filter') {
        showingNewPopDropdown = false;
    } else {
        showingLanguageDropdown = false;
    }
}

document.querySelectorAll(".new-first-right.part").forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter == 'new-pop-filter') {
            if (showingNewPopDropdown) {
                hideDropdown(btn, filter);
            } else {
                if (showingLanguageDropdown) {
                    hideDropdown(filterLanguage, 'language-filter');
                }
                showDropdown(btn, filter);
            }
        } else if (filter == 'language-filter') {
            if (showingLanguageDropdown) {
                hideDropdown(btn, filter);
            } else {
                if (showingNewPopDropdown) {
                    hideDropdown(filterNewPopBtn, 'new-pop-filter');
                }
                showDropdown(btn, filter);
            }
        }
    });
});

function storageSet(name) {
    if (name == 'Popular') {
        localStorage.setItem('selectedSidebarBtn', JSON.stringify({
            title: "Popular Anime",
            des: "Most Popular Anime",
            filter: "POPULARITY"
        }));
    } else {
        localStorage.setItem('selectedSidebarBtn', JSON.stringify({
            title: "New Anime",
            des: "Newly Added Anime",
            filter: "NEWEST"
        }));
    }
}

document.querySelectorAll(".dropdown-new-pop-btn.pop-new").forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter == 'pop') {
            if (pageTitle.innerHTML == 'Popular Anime') {
                hideDropdown(filterNewPopBtn, 'new-pop-filter');
                return;
            }
            storageSet('Popular');
            loadMain();
        }
        else {
            if (pageTitle.innerHTML == 'New Anime') {
                hideDropdown(filterNewPopBtn, 'new-pop-filter');
                return;
            }
            storageSet('New');
            loadMain();
        }
    });
});

const defaultPath = "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z";
const nextPath = "M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z";

document.querySelectorAll(".dropdown-new-pop-btn.language").forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const filter = btn.dataset.filter;

        document.querySelectorAll(".dropdown-new-pop-btn.language").forEach(b => {
            b.querySelector(".radio-btn-dropdown").style.fill = "#666666";
            b.querySelector('path').setAttribute("d", defaultPath);
        });

        if (filter == 'dub') {
            localStorage.setItem('currentFilter', JSON.stringify({ filter: 'Sub | Dub' }));
        } else if (filter == 'sub') {
            localStorage.setItem('currentFilter', JSON.stringify({ filter: 'Subtitled' }));
        } else {
            localStorage.setItem('currentFilter', JSON.stringify({ filter: 'all' }));
        }

        btn.querySelector(".radio-btn-dropdown").style.fill = "#2abdbb";
        btn.querySelector("path").setAttribute("d", nextPath);

        loadMain();
    });
});

document.addEventListener('click', (event) => {
    if (
        showingNewPopDropdown &&
        !filterNewPopBtn.contains(event.target)
    ) {
        hideDropdown(filterNewPopBtn, 'new-pop-filter');
    }
    if (
        showingLanguageDropdown &&
        !filterLanguage.contains(event.target)
    ) {
        hideDropdown(filterLanguage, 'language-filter');
    }
});