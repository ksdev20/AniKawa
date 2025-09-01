import { useRef, useEffect, useState } from "react";
import fetchUserDetails from "../../global_assets/FetchUserDetails";

type AnimeWbtnProps = {
  nanoid: string;
  forAC2?: boolean;
};

type MainBtnProps = {
  addedStatus: boolean;
};

function MainWBtn({ addedStatus }: MainBtnProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={28}
      viewBox="0 -960 960 960"
      width={28}
      fill="#8c52ff"
    >
      <path
        d={`${
          addedStatus
            ? "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z"
            : "M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"
        }`}
      ></path>
    </svg>
  );
}

export default function AnimeWBtn({
  nanoid = "xyzxyz",
  forAC2 = false,
}: AnimeWbtnProps) {
  const markerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<Element | null | undefined>(null);
  const [addedStatus, setAddedStatus] = useState(false);

  useEffect(() => {
    const w = localStorage.getItem("watchlist");
    if (!w) return;
    const watchlist = JSON.parse(w);
    if (watchlist.includes(nanoid)) setAddedStatus(true);

    const parent = markerRef.current?.closest(".tooltip.w");
    if (parent) tooltipRef.current = parent;
  }, []);

  useEffect(() => {
    const ttp = tooltipRef.current;
    if (!ttp) return;
    addedStatus
      ? ttp?.setAttribute("data-tip", "Remove From Watchlist")
      : ttp?.setAttribute("data-tip", "Add To Watchlist");
  }, [addedStatus]);

  function fetchFunction() {
    if (localStorage.getItem("isLoggedIn") == "false") return;
    const action = addedStatus ? "deleteFromList" : "addToList";
    const successLog = addedStatus
      ? "Removed from watchlist✅"
      : "Added to watchlist✅";
    const failLog = addedStatus
      ? "Failed to remove from watchlist❌"
      : "Failed to add to watchlist❌";
    const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

    fetch(`${backendUrl}/api/${action}?item=${nanoid}&field=watchlist`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(successLog);
          setAddedStatus(!addedStatus);
          fetchUserDetails();
        } else {
          console.log(failLog);
        }
      })
      .catch((e) => {
        console.error(e.message);
      });
  }

  return forAC2 ? (
    <button className="anime-card-2-watchlist-btn" onClick={fetchFunction}>
      <div><MainWBtn addedStatus={addedStatus}/></div>
      <div className="anime-card-2-watchlist-text">
        {addedStatus ? "IN WATCHLIST" : "ADD TO WATCHLIST"}
      </div>
    </button>
  ) : (
    <button
      type="button"
      ref={markerRef}
      onClick={fetchFunction}
      className="ac-wbtn"
    >
      <MainWBtn
        addedStatus={addedStatus}
      />
    </button>
  );
}
