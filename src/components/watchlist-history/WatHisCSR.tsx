import { useEffect, useState } from "react";
import type { Anime, Episode } from "@/lib/anime/types";
import "./wat-histw.css";
import "../../styles/lists/n-p-a-l.css";
import "../../styles/lists/e-l.css";
import { Icon } from "../../icons/icons";
import SortBtnHandler from "../ButtonHandlers/SortBtnHandler";
import AnimeCardReact from "../AnimeCard/AnimeCardReact";
import EpisodeCard from "../EpisodeCard/EpisodeCard";
import ClearHisBtn from "./ClearHisBtn";
import { backendUrl } from "../../global_assets/globalPaths";
import { getAnimeById, getEpisodeBySlug } from "@/filters/getAnimeById";

function Loader({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="relative h-[20vh] w-full">
      <div className="absolute top-[50%] left-[50%] translate-[-50%] w-6 h-6 border-4 border-t-transparent border-(--c-main) rounded-full animate-spin"></div>
    </div>
  );
}

type ListsState = {
  watchlist: ReadonlyArray<Anime>;
  history: ReadonlyArray<Episode>;
  showLoader: boolean;
  listEmpty: boolean;
};

export default function WatHisCSR({ caller }: { caller: string }) {
  const forWatchlist = caller === "w";
  const field = forWatchlist ? "watchlist" : "history";

  const [states, setStates] = useState<ListsState>({
    watchlist: [],
    history: [],
    showLoader: true,
    listEmpty: false,
  });

  const [sort, setSort] = useState("new");

  async function onSuccess(sortParam: string, data: any) {
    const dbList = data.data as any[];
    let finalList: (Anime | Episode | null)[] = [];

    if (forWatchlist) {
      const ids = sortParam === "new" ? [...dbList].reverse() : dbList;
      const seen = new Set<string>();
      finalList = await Promise.all(
        ids.map(async (id: string) => {
          if (seen.has(id)) return null;
          seen.add(id);
          return await getAnimeById(id);
        })
      );
    } else {
      const seen = new Set<string>();
      finalList = await Promise.all(
        dbList.map(async (obj: { animeId: string; slug: string }) => {
          const key = `${obj.animeId}-${obj.slug}`;
          if (seen.has(key)) return null;
          seen.add(key);
          return await getEpisodeBySlug(obj.animeId, obj.slug);
        })
      );
    }

    const cleanedList = finalList.filter(Boolean) as Anime[] | Episode[];
    setStates({
      watchlist: forWatchlist ? (cleanedList as Anime[]) : [],
      history: !forWatchlist ? (cleanedList as Episode[]) : [],
      showLoader: false,
      listEmpty: cleanedList.length === 0,
    });
  }

  const getList = (sortParam: string) => {
    fetch(`${backendUrl}/api/getList?field=${field}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          onSuccess(sortParam, data);
        } else {
          console.error(`Failed to fetch ${field.toUpperCase()}`);
          setStates((prev) => ({ ...prev, showLoader: false, listEmpty: true }));
        }
      })
      .catch((e) => {
        console.warn("Fetch error:", e.message);
        setStates((prev) => ({ ...prev, showLoader: false, listEmpty: true }));
      });
  };

  useEffect(() => {
    const sortParam =
      new URLSearchParams(window.location.search).get("sort") ?? "new";
    setSort(sortParam);
    getList(sortParam);
  }, []);

  return (
    <main className="profile-main">
      <section className="wat-his-main-box">
        <div className="wh-top">
          <Icon name="watchlist" size={38} />
          <h1 style={{ fontSize: "30px" }}>My Lists</h1>
        </div>
        <nav className="buttons-section">
          <a
            className={`wh-btn ${forWatchlist ? "active" : ""}`}
            {...(!forWatchlist ? { href: "/watchlist" } : undefined)}
            aria-label="Watchlist page"
          >
            WATCHLIST
          </a>
          <a
            className={`wh-btn ${!forWatchlist ? "active" : ""}`}
            {...(forWatchlist ? { href: "/history" } : undefined)}
            aria-label="History page"
          >
            HISTORY
          </a>
        </nav>

        {forWatchlist && !states.listEmpty && (
          <section className="wat-his-main-box watchlist-main">
            <header className="wh-top-bar">
              <h2 className="left-heading">
                {sort === "new" ? "Recently Added" : "Oldest Added"}
              </h2>
              <div id="sort-btn-wat" className="new-first-right part">
                <SortBtnHandler watHisAsking={true} />
              </div>
            </header>
            <Loader show={states.showLoader} />
            <ul id="watchlist-list" className="new-pop-anime-list">
              {states.watchlist.map((anime, i) => (
                <AnimeCardReact key={anime.nanoid ?? i} anime={anime} forNewPop={true} />
              ))}
            </ul>
          </section>
        )}

        {!forWatchlist && !states.listEmpty && (
          <section id="history-main" className="wat-his-main-box history-main">
            <header className="wm-top hm-top">
              <h2 className="left-heading">Most Recent</h2>
              <ClearHisBtn />
            </header>
            <Loader show={states.showLoader} />
            <ul id="history-list" className="episodes-list el-history">
              {states.history.map((epData, i) => (
                <EpisodeCard key={`${epData.animenanoid}-${epData.slug}-${i}`} epData={epData} forHistory={true} />
              ))}
            </ul>
          </section>
        )}

        {states.listEmpty && (
          <section id="empty-wh" className="empty-wh">
            <Icon name="library-add" size={70} />
            {forWatchlist ? (
              <h2 className="wat-des">
                Nothing is added in your watchlist. Come on, let’s add some amazing anime to watch!
              </h2>
            ) : (
              <h2 className="wat-des">
                Your history is empty. Come on, watch something!
              </h2>
            )}
            <a className="goto-home-btn" href="/">
              GO TO HOME FEED
            </a>
          </section>
        )}
      </section>
    </main>
  );
}
