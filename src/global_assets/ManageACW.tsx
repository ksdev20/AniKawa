import { useEffect } from "react";
import { inWatchlistPath, inWatchlistTip } from "./globalPaths";

export default function ManageACW() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const watchlist = localStorage.getItem("watchlist");
      document.querySelectorAll(".tooltip.w").forEach((ttp) => {
        const svg = ttp.querySelector('svg');
        const id = svg?.getAttribute("data-nanoid");
        if (id && watchlist?.includes(id)) {
          svg?.querySelector("path")?.setAttribute("d", inWatchlistPath);
          ttp?.setAttribute('data-tip', inWatchlistTip);
        }
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return null;
}
