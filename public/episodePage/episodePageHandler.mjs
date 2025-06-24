
function updateEpisodePage(episodeData, animeData) {
    const embedUrl = episodeData?.url;
    const aTitle = animeData?.animeTitle;
    const aScore = animeData?.score;
    const aLanguage = animeData?.lang;
    const eTitle = episodeData?.episodeDetails?.[0]?.title || `Episode ${episodeData?.episodeNumber}`;
    const eDescription = episodeData?.episodeDetails?.[0]?.description || "No description.";
    return `<div class="video-container">
        <iframe width="560" height="315" src=${embedUrl}
            title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;  web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
    <div class="episode-page-details">
        <div class="episode-page-details epd-first">
            <div class="epd-first-top">
                <div class="epd-first-top first-part">
                    <a class="first-part-anime-title" href="../animePages/animeMainPage.html">${aTitle}</a>
                    |
                    <div class="first-part-rating">${aScore}</div>
                </div>
                <svg class="add-to-watchlist-icon" xmlns="http://www.w3.org/2000/svg" height="25px"
                    viewBox="0 -960 960 960" width="25px" fill="#ffffff">
                    <path
                        d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                </svg>
            </div>
            <div class="epd-ep-title">${eTitle}</div>
            <div class="epd-language">${aLanguage}</div>
            <div class="epd-description">${eDescription}
            </div>
            <div class="episode-list-endline"></div>
        </div>
        <div class="episode-change-section">
            <a class="episode-change-card-container" id="previous-episode">
                <div class="eccc-heading">PREVIOUS EPISODE</div>
                <div class="episode-change-card">
                    <img id="p-ep-img" class="ecc-image"
                        src="https://img1.ak.crunchyroll.com/i/spire1-tmb/00aacbb8bcfe784b3c8e728b269af0821644957412_full.jpg" />
                    <div class="episode-change-card-container ecc-text-section" id="epd-text-section">
                        <div id="p-ep-title" class="epd-ep-title for-card">Episode 2 - The Fairy Tail</div>
                        <div class="epd-language ecc-language">${aLanguage}</div>
                    </div>
                </div>
            </a>
            <a class="episode-change-card-container" id="next-episode">
                <div class="eccc-heading">NEXT EPISODE</div>
                <div class="episode-change-card">
                    <img id="n-ep-img" class="ecc-image"
                        src="https://img1.ak.crunchyroll.com/i/spire1-tmb/00aacbb8bcfe784b3c8e728b269af0821644957412_full.jpg" />
                    <div class="episode-change-card-container ecc-text-section" id="epd-text-section">
                        <div id="n-ep-title" class="epd-ep-title for-card">Episode 3 - The Fairy Tail</div>
                        <div class="epd-language ecc-language">${aLanguage}</div>
                    </div>
                </div>
            </a>
        </div>
        <div class="site-footer">
            <a href="../legalStuff/terms.html" target="_blank">Terms of Services</a>
            <div class="sf-separator">|</div>
            <a href="../legalStuff/privacy.html" target="_blank">Privacy Policies</a>
            <div class="sf-separator">|</div>
            <a href="../legalStuff/about.html">About</a>
            <div class="sf-separator">|</div>
            <a href="../legalStuff/credits.html">Credits</a>
        </div>
    </div>`;
}

function main() {
    const episodeJson = JSON.parse(localStorage.getItem('selectedEpisode'));
    if (!episodeJson) return;
    const episodeMain = episodeJson.episode;
    const idx = episodeJson.idx;
    const animeDetails = episodeJson.meta;
    const allEpisodes = episodeJson.allEpisodes;

    const previousEpisode = episodeJson?.allEpisodes[idx - 1];
    const nextEpisode = episodeJson?.allEpisodes[idx + 1];

    const mainEpisodePage = document.getElementById("main-episode-page");

    mainEpisodePage.innerHTML = updateEpisodePage(episodeMain, animeDetails);

    if (previousEpisode) {
        document.getElementById("p-ep-img").src = previousEpisode?.episodeDetails?.[0]?.thumbnail || "../assets/anime-images/episode-thumbnail-alt-2.png";
        document.getElementById("p-ep-title").innerHTML = previousEpisode?.episodeDetails?.[0]?.title || `Episode ${previousEpisode?.episodeNumber}`;

        const newIdx = (previousEpisode?.episodeNumber - 1);

        document.getElementById("previous-episode").addEventListener('click', () => {
            localStorage.setItem('selectedEpisode', JSON.stringify({
                episode: previousEpisode,
                meta: animeDetails,
                idx: newIdx,
                allEpisodes
            }));
            window.location.reload();
        });
    } else {
        document.getElementById("previous-episode").style.display = "none";
    }

    if (nextEpisode) {
        document.getElementById("n-ep-img").src = nextEpisode?.episodeDetails?.[0]?.thumbnail || "../assets/anime-images/episode-thumbnail-alt-2.png";
        document.getElementById("n-ep-title").innerHTML = nextEpisode?.episodeDetails?.[0]?.title || `Episode ${nextEpisode?.episodeNumber}`;

        const newIdx = (nextEpisode?.episodeNumber - 1);

        document.getElementById("next-episode").addEventListener('click', () => {
            localStorage.setItem('selectedEpisode', JSON.stringify({
                episode: nextEpisode,
                meta: animeDetails,
                idx: newIdx,
                allEpisodes
            }));
            window.location.reload();
        });
    } else {
        document.getElementById("next-episode").style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', main);
