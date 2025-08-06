import getEpisodeTitle from '../../utils/getEpisodeTitle';
import './episode-card.css';
export default function EpisodeCard({ epData }: { epData: any}) {
    const { animeTitle= 'Anime Title N/A', language='Language N/A', animenanoid, slug, epNum } = epData;
    const { title, img = epData.ytThumbnail || '/episode-thumbnail-alt-2.png', description = 'No description' } = epData ?? [];
    return (
        <div className="episode-card">
            <div className="episode-card-first">
                <img className="episode-card-image"
                    src={img} />
                <div className="anime-title">{animeTitle}</div>
                <div className="episode-number-name">{getEpisodeTitle(title, epNum)}</div>
                <div className="language-section">{language}</div>

                <div className="episode-card-hover">
                    <div className="anime-title">{animeTitle}</div>
                    <div className="episode-number-name">{title}</div>
                    <div className="episode-number-name episode-description" dangerouslySetInnerHTML={{ __html: description}}>
                    </div>
                    <div className="episode-play-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" width="40px"
                            viewBox="0 -960 960 960" fill="#8c52ff">
                            <path
                                d="M360-272.31v-415.38L686.15-480 360-272.31ZM400-480Zm0 134 211.54-134L400-614v268Z" />
                        </svg>
                        PLAY
                    </div>
                </div>
                <a href={`/episode/${animenanoid}/${slug}`} className="episode-card-link"></a>
            </div>
        </div>
    )
}