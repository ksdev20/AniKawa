import type { Anime } from "../../filters/mergedListTypes";
import "./animecard.css";
import AnimeWBtn from "./AnimeWBtn";

export default function AnimeCardReact({ anime, forNewPop = false }: { anime: Anime, forNewPop: boolean }) {
    const {nanoid, slug} = anime;
    const { title, poster = anime?.season_poster ?? '/anime-image-alt.png', description, scoreAlt } = anime ?? {};
    const language = anime?.episodes?.[0]?.audio == 'ja' ? 'Subtitled' : 'Sub|Dub';
    const episodes = anime?.episodes.length;
    if (!title && !poster && !nanoid) return null;
    return (
        <li className={`anime-card ${forNewPop ? 'new-pop-ac' : ''}`}>
            <div className={`anime-card-first ${forNewPop ? 'new-pop-anime-card' : ''}`}>
                <img className="anime-card-image" src={poster} loading="lazy" decoding="async" alt={`Cover of ${title}`}/>
                <div className="anime-card-title">{title}</div>
                <div className="anime-card-language">{language}</div>

                <div
                    className="anime-card-hover"
                    style={{ backgroundImage: `url(${poster})` }}
                >
                    <div className="anime-card-hover-details">
                        <div className="anime-card-hover-title">{title}</div>
                        <div className="anime-card-hover-rating">{scoreAlt}</div>
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
                <a href={`/show/${nanoid}/${slug}`} className="anime-card-link"></a>
            </div>
        </li>
    )
}