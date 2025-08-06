import type { Anime } from "../../filters/AnimeDataTypes";
import "./animecard.css";
import AnimeWBtn from "./AnimeWBtn";

export default function AnimeCardReact({ anime, forNewPop = false }: { anime: Anime, forNewPop: boolean }) {
    const {nanoid, slug} = anime;
    const { title, coverImage, language, description , score, episodes } = anime?.anilist ?? {};
    if (!title && !coverImage && !nanoid) return null;
    return (
        <div className={`anime-card ${forNewPop ? 'new-pop-ac' : ''}`}>
            <div className={`anime-card-first ${forNewPop ? 'new-pop-anime-card' : ''}`}>
                <img className="anime-card-image" src={coverImage ?? '/anime-image-alt.png'} />
                <div className="anime-card-title">{title}</div>
                <div className="anime-card-language">{language}</div>

                <div
                    className="anime-card-hover"
                    style={{ backgroundImage: `url(${coverImage})` }}
                >
                    <div className="anime-card-hover-details">
                        <div className="anime-card-hover-title">{title}</div>
                        <div className="anime-card-hover-rating">{score}</div>
                        <div className="anime-card-hover-episodes">
                            {episodes} Episodes
                        </div>
                        <div className="anime-card-hover-description" dangerouslySetInnerHTML={{ __html: description ?? 'No description'}}>
                        </div>
                        <div className="anime-card-hover-actions">
                            <div className="tooltip" data-tip="Play S1 E1">
                                <svg
                                    className="card-action-play"
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="35px"
                                    viewBox="0 -960 960 960"
                                    width="35px"
                                    fill="#8c52ff"
                                >
                                    <path
                                        d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"
                                    ></path>
                                </svg>
                            </div>
                            <div className="tooltip" data-tip="Add to Watchlist">
                                <AnimeWBtn nanoid={nanoid} />
                            </div>
                        </div>
                    </div>
                </div>
                <a href={`/show/${nanoid}/${anime.slug}`} className="anime-card-link"></a>
            </div>
        </div>
    )
}