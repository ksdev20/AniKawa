import { useEffect, useRef, useState } from "react";

import { Icon } from "@/icons/icons";
import { getGuestId } from "@/utils/getGuestId";

type VoteValue = 1 | -1 | null;

interface EpisodeVotesProps {
  episodeId: string;
}

interface VoteResponse {
  episodeId: string;
  likes: number;
  dislikes: number;
  myVote: VoteValue;
}

export default function EpisodeVotes({ episodeId }: EpisodeVotesProps) {
  const [likes, setLikes] = useState(0);

  const [dislikes, setDislikes] = useState(0);

  const [myVote, setMyVote] = useState<VoteValue>(null);
  const [updating, setUpdating] = useState<VoteValue>(null);
  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const loaded = useRef(false);

  async function fetchVotes() {
    const guestId = getGuestId();

    const params = new URLSearchParams({
      episodeId,
      guestId,
    });

    const response = await fetch(`/api/episode/vote?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed loading votes");
    }

    const data: VoteResponse = await response.json();

    setLikes(data.likes);

    setDislikes(data.dislikes);

    setMyVote(data.myVote);
  }

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;

    (async () => {
      try {
        await fetchVotes();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [episodeId]);

  async function handleVote(clicked: 1 | -1) {
    if (busy) return;

    setBusy(true);
    setUpdating(clicked);

    try {
      const guestId = getGuestId();

      const nextVote: VoteValue = myVote === clicked ? null : clicked;

      const response = await fetch("/api/episode/vote", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          episodeId,
          guestId,
          vote: nextVote,
        }),
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      const data: VoteResponse = await response.json();

      setLikes(data.likes);

      setDislikes(data.dislikes);

      setMyVote(data.myVote);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="episode-votes">
      <button
        className={`comment-action-btn ${myVote === 1 ? "active" : ""}`}
        disabled={busy}
        onClick={() => handleVote(1)}
      >
        <Icon
          name={myVote === 1 ? "thumbs-up-filled" : "thumbs-up-outlined"}
          size={20}
        />

        {loading || (busy && updating == 1) ? (
          <div className="loader" />
        ) : (
          <span>{likes}</span>
        )}
      </button>

      <button
        className={`comment-action-btn ${myVote === -1 ? "active" : ""}`}
        disabled={busy}
        onClick={() => handleVote(-1)}
      >
        <Icon
          name={myVote === -1 ? "thumbs-down-filled" : "thumbs-down-outlined"}
          size={20}
        />

        {loading || (busy && updating == -1) ? (
          <div className="loader" />
        ) : (
          <span>{dislikes}</span>
        )}
      </button>
    </div>
  );
}
