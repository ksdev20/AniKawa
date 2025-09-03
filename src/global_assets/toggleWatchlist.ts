import fetchUserDetails from "./FetchUserDetails";
import { inWatchlistPath, inWatchlistTip, notInWatchlistPath, notInWatchlistTip } from "./globalPaths";

const toggleWatchlist = (nanoid: string, btn: HTMLButtonElement) => {
  if (localStorage.getItem("isLoggedIn") == "false") {
    return;
  }
  let success = false; //success of request to server
  const addedStatus = localStorage?.getItem("watchlist")?.includes(nanoid);
  const action = addedStatus ? "deleteFromList" : "addToList";
  const successLog = addedStatus
    ? "Removed from watchlist✅"
    : "Added to watchlist✅";
  const failLog = addedStatus
    ? "Failed to remove from watchlist❌"
    : "Failed to add to watchlist❌";
  const backendUrl = import.meta.env.PUBLIC_BACKEND_URL;

  const updatePath = () => {
    if (!success) return;
    const path = btn.querySelector('svg path');
    const newPath = !addedStatus ? inWatchlistPath : notInWatchlistPath;
    const newTip = !addedStatus ? inWatchlistTip : notInWatchlistTip;
    path?.setAttribute('d', newPath); //changing path of svg
    btn?.closest?.('.tooltip.w')?.setAttribute('data-tip', newTip); //changing text of tooltip
  }

  fetch(`${backendUrl}/api/${action}?item=${nanoid}&field=watchlist`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log(successLog);
        success = true;
        fetchUserDetails();
      } else {
        console.log(failLog);
      }
    })
    .catch((e) => {
      console.error(e.message);
    }).finally(updatePath);
};

export default toggleWatchlist;