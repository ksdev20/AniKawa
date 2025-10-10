export function createAnimeCardNewPop(anime) {
    return `<div class="anime-card new-pop-ac">
                <div class="anime-card-first  new-pop-anime-card">
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