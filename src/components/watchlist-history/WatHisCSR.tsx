import { useEffect, useState } from 'react';
import '../../styles/config.css';
import './wat-his.css';
import SortBtnHandler from '../ButtonHandlers/SortBtnHandler';
import { getWatchlistItems, getHistoryItems } from '../../filters/wat-his-match-logic';
import AnimeCardStatic from '../AnimeCard/AnimeCardStatic.astro';
import { type Anime, type Video } from "../../filters/AnimeDataTypes";
import EpisodeCard from '../EpisodeCard/EpisodeCard';
import EpisodeCardStatic from '../EpisodeCard/EpisodeCardStatic.astro';
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default function WatHisCSR({ caller }: { caller: string }) {
    const field = caller == 'w' ? 'watchlist' : 'history';
    const populateWatchlist = caller == 'w';
    const [watchlist, setWatchist] = useState<Anime[]>([]);
    const [history, setHistory] = useState<Video[]>([]);

    const getList = () => {
        fetch(`${backendUrl}/api/getList?field=${field}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const titleList= data.data;
                    const finalList = caller == 'w' ? getWatchlistItems(titleList) : getHistoryItems(titleList);
                    caller == 'w' ? setWatchist(finalList) : setHistory(finalList);
                } else {
                    alert(`Failed to fetch ${field.toUpperCase()}`);
                }
            })
            .catch(e => {
                console.error(e.message);
            })
        // const getLS = localStorage.getItem(field);
        // if (getLS){
        //     caller == 'w' ? setWatchist(JSON.parse(getLS)) : setHistory(JSON.parse(getLS));
        // }
    }

    useEffect(getList, []);

    return (
        <div className="profile-main">
            <div className="wat-his-main-box">
                <div className="wh-top">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="38px"
                        viewBox="0 -960 960 960"
                        width="38px"
                        fill="#ffffff"
                    >
                        <path
                            d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"
                        ></path>
                    </svg>
                    <div style={{ fontSize: "30px" }}>My Lists</div>
                </div>
                <div className="buttons-section">
                    <a className={`wh-btn ${caller == 'w' ? 'active' : ''}`} href='/watchlist'>WATCHLIST</a>
                    <a className={`wh-btn ${caller == 'h' ? 'active' : ''}`} href='/history'>HISTORY</a>
                </div>
                <div
                    className={`wat-his-main-box watchlist-main ${caller == 'w' ? 'active' : ''}`}
                >
                    <div className="wh-top-bar">
                        <div className="left-heading">
                            Recently Added
                        </div>
                        <div id="sort-btn-wat" className="new-first-right part">
                            <SortBtnHandler watHisAsking={true} />
                        </div>
                    </div>
                    <div
                        id="watchlist-list"
                        className="new-pop-anime-list np-watchlist"
                    >
                        {populateWatchlist && (
                            watchlist.map((anime, i) => (
                                <AnimeCardStatic key={i} anime={anime}/>
                            ))
                        )}
                    </div>
                </div>
                <div id="history-main" className={`wat-his-main-box history-main ${caller == 'h' ? 'active' : ''}`}>
                    <div className="wm-top hm-top">
                        <div className="left-heading">Most Recent</div>
                        <div id="clear-history-btn" className="clear-history">
                            CLEAR HISTORY
                        </div>
                    </div>
                    <div id="history-list" className="episodes-list el-history">
                        {!populateWatchlist && (
                            history.map(epData => (
                                <EpisodeCardStatic epData={epData} forHistory={true}/>
                            ))
                        )}
                    </div>
                </div>
                <div id="empty-wh" className="empty-wh">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="70px"
                        viewBox="0 -960 960 960"
                        width="70px"
                        fill="#ffffff"
                    >
                        <path
                            d="M520-400h80v-120h120v-80H600v-120h-80v120H400v80h120v120ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
                        ></path>
                    </svg>
                    <div id="watchlist-des" className="wat-des">
                        Nothing is added in your watchlist.Come on let's add
                        some amazing anime to watch !
                    </div>
                    <div id="history-des" className="wat-des">
                        Your history is empty man come on watch something !
                    </div>
                    <a className="goto-home-btn" href="../index.html"
                    >GO TO HOME FEED</a>
                </div>
            </div>
        </div>
    )
}