const toShow = localStorage.getItem('selectedBtn');

function createAnimeCardNewPop(anime) {
    return `<div class="anime-card new-pop-ac">
                <div class="anime-card-first new-pop-anime-card">
                    <img class="anime-card-image" src="${anime.anilist.coverImage}" />
                    <div class="anime-card-title">${anime.anilist.title}</div>
                    <div class="anime-card-language">${anime.anilist.language}</div>

                    <div class="anime-card-hover" style="background-image: url(${anime.anilist.coverImage});">
                    <div class="anime-card-hover-details">
                        <div class="anime-card-hover-title">${anime.anilist.title}</div>
                        <div class="anime-card-hover-rating">${anime.anilist.score}</div>
                        <div class="anime-card-hover-episodes">${anime.anilist.episodes}</div>
                        <div class="anime-card-hover-description">${anime.anilist.description}</div>
                        <div class="anime-card-hover-actions">
                            <div class="tooltip" data-tip="Play S1 E1">
                                <svg class="card-action-play" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"
                                fill="#ff640a">
                                <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                                </svg>
                            </div>
                            <div class="tooltip" data-tip="Remove From Watchlist">
                                <svg class="card-action-watchlist" xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px"
                                fill="#ff640a">S
                                <path
                                    d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>`;
}

function createEpisodeCard(episode) {
    const { animeTitle, lang } = episode.meta;
    const videos = episode.episode;
    const episodeImg = videos?.episodeDetails?.[0]?.thumbnail || "/assets/anime-images/episode-thumbnail-alt-2.png";
    const eTitle = videos?.episodeDetails?.[0]?.title || `Episode ${videos?.episodeNumber || "N/A"}`;
    const eDescription = videos?.episodeDetails?.[0]?.description || "N/A";
    return `<div class="episode-card">
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
        <svg id="ec-del-icon" class="ec-del-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
    </div>`;
}

import { toggleWatchlist } from "../majorJs/anime-card.mjs";

const baseURL = window.location.origin;

function loadWatHis(thing, newlyadded = false) {
    fetch(`${baseURL}/api/me?fields=${thing}`, {
        method: 'GET',
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.data) {
                alert(`${thing} not found`);
            }

            if (thing == 'watchlist') {
                document.querySelector(".new-pop-anime-list.np-watchlist.skeletons").classList.add("hidden");
                localStorage.setItem('selectedBtn', 'watchlist');
                const watchlist = data.data.watchlist;
                if (watchlist.length == 0) {
                    showEmpty('watchlist');
                    return;
                }
                const watchlistList = document.getElementById("watchlist-list");
                watchlistList.innerHTML = ' ';
                const order = newlyadded ? watchlist.slice().reverse() : watchlist.slice();

                order.forEach(anime => {
                    const cardHtml = createAnimeCardNewPop(anime);

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cardHtml;
                    const cardElement = tempDiv.firstElementChild;

                    cardElement.addEventListener('click', () => {
                        localStorage.setItem('selectedAnime', JSON.stringify(anime));
                        window.location.href = "../animePages/animeMainPage.html";
                    });

                    const watchlistBtnTemp = cardElement.querySelector(".card-action-watchlist");

                    if (watchlistBtnTemp) {
                        watchlistBtnTemp.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            toggleWatchlist(anime, 'watchlist', watchlistBtnTemp).then(res => {
                                if (res) {
                                    window.location.reload();
                                }
                            });
                        });
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
                                window.location.href = "../episodePage/episodeMainPage.html";
                            }
                        });
                    });

                    watchlistList.appendChild(cardElement);
                });
            } else if (thing == 'history') {
                document.querySelector(".episodes-list.el-history.skeletons").classList.add("hidden");
                localStorage.setItem('selectedBtn', 'history');
                const history = data.data.history;
                if (history.length == 0) {
                    showEmpty('history');
                    return;
                }
                const historyList = document.getElementById("history-list");
                historyList.innerHTML = ' ';

                history.slice().reverse().forEach(episode => {
                    const cardHtml = createEpisodeCard(episode);

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cardHtml;
                    const cardElement = tempDiv.firstElementChild;

                    cardElement.addEventListener('click', () => {
                        localStorage.setItem('selectedEpisode', JSON.stringify(episode));
                        window.location.href = "../episodePage/episodeMainPage.html";
                    });

                    const ecDelIcon = cardElement.querySelector(".ec-del-icon");
                    if (ecDelIcon) {
                        ecDelIcon.addEventListener('click', (e) => {
                            e.stopPropagation();

                            toggleWatchlist(episode, 'history', null, true).then(res => {
                                if (res) {
                                    window.location.reload();
                                }
                            });
                        });
                    }

                    historyList.appendChild(cardElement);
                });
            }
        });
}

let showingNewFirst = false;

const watchlistBtn = document.getElementById("watchlist-btn");
const historyBtn = document.getElementById("history-btn");

const watchlistMain = document.getElementById("watchlist-main");
const historyMain = document.getElementById("history-main");
const whEmpty = document.getElementById("empty-wh");

const watDes = document.getElementById("watchlist-des");
const hisDes = document.getElementById("history-des");

function watchlistAction(action) {
    action == 'show' ? watchlistBtn.classList.add('active') : watchlistBtn.classList.remove('active');
    action == 'show' ? loadWatHis('watchlist', showingNewFirst) : {};
    watchlistMain.style.display = action == 'show' ? "flex" : "none";
}

function historyAction(action) {
    historyMain.style.display = action == 'show' ? "flex" : "none";
    action == 'show' ? historyBtn.classList.add('active') : historyBtn.classList.remove('active');
    action == 'show' ? loadWatHis('history') : {};
}

function showEmpty(thing) {
    if (thing == 'watchlist') {
        watchlistAction('hide');
        watchlistBtn.classList.add('active');
        whEmpty.style.display = "flex";
        watDes.classList.add("active");
    } else {
        historyAction('hide');
        historyBtn.classList.add('active');
        whEmpty.style.display = "flex";
        hisDes.classList.add("active");
    }
}

function hideEmpty() {
    whEmpty.style.display = "none";
    if (watDes.classList.contains("active")) watDes.classList.remove("active");
    if (hisDes.classList.contains("active")) hisDes.classList.remove("active");
}

if (toShow == 'watchlist') {
    showingNewFirst = true;
    watchlistAction('show');
} else if (toShow == 'history') {
    historyAction('show');
}

watchlistBtn.addEventListener('click', () => {
    if (!watchlistBtn.classList.contains("active")) {
        if (watDes.classList.contains("active")) return;
        hideEmpty();
        historyAction('hide');
        watchlistAction('show');
    }
});

historyBtn.addEventListener('click', () => {
    if (!historyBtn.classList.contains("active")) {
        if (hisDes.classList.contains("active")) return;
        hideEmpty();
        watchlistAction('hide');
        historyAction('show');
    }
});

function clearHistory(del) {
    return fetch(`${baseURL}/api/clearHistory`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ del })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("✅ Successfully cleared history");
                return true;
            } else {
                if (data.error) alert(data.error);
                return false;
            }
        })
        .catch(e => {
            console.error(e.message);
            return false;
        });
}

const clearHistoryBtn = document.getElementById("clear-history-btn");

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        clearHistory(true).then(res => {
            if (res) {
                window.location.reload();
            }
        });
    });
}

/*watchlist sort btn handling */

const sortBtn = document.getElementById("sort-btn-wat");
const sortDD = sortBtn.querySelector(".dropdown-new-pop");
const leftTitle = document.getElementById("left-heading");
let showingSDD = false;

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
            loadWatHis('watchlist', true);
            leftTitle.innerHTML = 'Recently Added';
            showingNewFirst = true;
        } else {
            loadWatHis('watchlist', false);
            leftTitle.innerHTML = 'Oldest First';
            showingNewFirst = false;
        }
    });
});