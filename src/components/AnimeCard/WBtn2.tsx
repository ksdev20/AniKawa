import toggleWatchlist from "../../global_assets/toggleWatchlist";
import { IconW } from "../../icons/icons";

export default function WBtn2({ nanoid }: { nanoid: string }) {
  return (
    <button
      aria-label="Add Anime to Watchlist"
      className="ac-wbtn"
      onClick={(e) => {
        toggleWatchlist(nanoid, e.currentTarget);
      }}
    >
      <IconW nanoid={nanoid} />
    </button>
  );
}
