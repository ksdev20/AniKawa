import { useEffect, useState } from "react";
import "../../styles/config.css";
import "./wat-histw.css";
import SortBtnHandler from "../ButtonHandlers/SortBtnHandler";
import {
  getWatchlistItems,
  getHistoryItems,
} from "../../filters/wat-his-match-logic";
import { type Anime, type Episode } from "../../types/mergedListTypes";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import AnimeCardReact from "../AnimeCard/AnimeCardReact";
import ClearHisBtn from "./ClearHisBtn";
import { Icon } from "../../icons/icons";
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

export default function WatHisCSR({ caller }: { caller: string }) {
  const field = caller == "w" ? "watchlist" : "history";
  const forWatchlist = caller == "w";
  const [watchlist, setWatchist] = useState<Anime[]>([]);
  const [history, setHistory] = useState<Episode[]>([]);
  const [sort, setSort] = useState("new");
  const [listEmpty, setLE] = useState(false);

  const getList = (sortParam: string) => {
    fetch(`${backendUrl}/api/getList?field=${field}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const titleList = data.data;
          const finalList =
            caller == "w"
              ? getWatchlistItems(titleList)
              : getHistoryItems(titleList);
          if (sortParam == "new") finalList.reverse();
          caller == "w" ? setWatchist(finalList) : setHistory(finalList);
          if (finalList.length == 0) setLE(true);
        } else {
          alert(`Failed to fetch ${field.toUpperCase()}`);
        }
      })
      .catch((e) => {
        console.error(e.message);
      });
  };

  const main = () => {
    const sortParam =
      new URLSearchParams(window.location.search).get("sort") ?? "new";
    setSort(sortParam);
    getList(sortParam);
  };

  useEffect(main, []);
  return (
    <main className="profile-main">
      <section className="wat-his-main-box">
        <div className="wh-top">
          <Icon name="watchlist" size={38} />
          <h1 style={{ fontSize: "30px" }}>My Lists</h1>
        </div>
        <nav className="buttons-section">
          <a
            className={`wh-btn ${caller == "w" ? "active" : ""}`}
            href={`${caller == "h" ? "/watchlist" : "javascript:void(0)"}`}
            aria-label="Watchlist page"
          >
            WATCHLIST
          </a>
          <a
            className={`wh-btn ${caller == "h" ? "active" : ""}`}
            href={`${caller == "w" ? "/history" : "javascript:void(0)"}`}
            aria-label="History page"
          >
            HISTORY
          </a>
        </nav>
        <section
          className={`wat-his-main-box watchlist-main ${caller == "w" && !listEmpty ? "active" : ""}`}
        >
          <header className="wh-top-bar">
            <h2 className="left-heading">
              {sort == "new" ? "Recently Added" : "Oldest added"}
            </h2>
            <div id="sort-btn-wat" className="new-first-right part">
              <SortBtnHandler watHisAsking={true}/>
            </div>
          </header>
          <ul id="watchlist-list" className="new-pop-anime-list">
            {forWatchlist &&
              watchlist.map((anime, i) => (
                <AnimeCardReact key={i} anime={anime} forNewPop={true} />
              ))}
          </ul>
        </section>
        <section
          id="history-main"
          className={`wat-his-main-box history-main ${caller == "h" && !listEmpty ? "active" : ""}`}
        >
          <header className="wm-top hm-top">
            <h2 className="left-heading">Most Recent</h2>
            <ClearHisBtn />
          </header>
          <ul id="history-list" className="episodes-list el-history">
            {!forWatchlist &&
              history.map((epData, i) => <EpisodeCard key={i} epData={epData} forHistory={true}/>)}
          </ul>
        </section>
        <div id="empty-wh" className={`empty-wh ${listEmpty ? "active" : ""}`}>
          <Icon name="library-add" size={70} />
          <div
            id="watchlist-des"
            className={`wat-des ${caller == "w" ? "active" : ""}`}
          >
            Nothing is added in your watchlist.Come on let's add some amazing
            anime to watch !
          </div>
          <div
            id="history-des"
            className={`wat-des ${caller == "h" ? "active" : ""}`}
          >
            Your history is empty man come on watch something !
          </div>
          <a className="goto-home-btn" href="/">
            GO TO HOME FEED
          </a>
        </div>
      </section>
    </main>
  );
}
