import { useEffect } from "react";

import "../../styles/components/Comments/comments.css";

import type { CommentSort } from "@/types/comments";

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import CommentVerification from "./CommentVerification";

import { useCommentsStore } from "@/lib/comments/commentsStore";

interface Props {
  episodeId: string;
}

const SORT_OPTIONS: {
  value: CommentSort;
  label: string;
}[] = [
  {
    value: "top",
    label: "Popular",
  },
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "oldest",
    label: "Oldest",
  },
];

export default function CommentSection({ episodeId }: Props) {
  const {
    loading,
    refresh,
    sort,
    setSort,
    openMenuCommentId,
    setOpenMenuCommentId,
  } = useCommentsStore();
  useEffect(() => {
    if (!episodeId) return;

    refresh(episodeId, sort);
  }, [episodeId, sort, refresh]);

  if (!episodeId) {
    return null;
  }

  useEffect(() => {
    if (!openMenuCommentId) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      const menu = target.closest(".comment-overflow");

      if (!menu) {
        setOpenMenuCommentId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuCommentId]);

  useEffect(() => {
    if (loading) return;

    const hash = window.location.hash;

    if (!hash.startsWith("#comment-")) {
      return;
    }

    const targetId = hash.slice(1);

    let attempts = 0;
    const maxAttempts = 30;

    const interval = window.setInterval(() => {
      const element = document.getElementById(targetId);

      if (!element) {
        attempts += 1;

        if (attempts >= maxAttempts) {
          window.clearInterval(interval);

          console.warn("[Comments] Target not found:", targetId);
        }

        return;
      }

      window.clearInterval(interval);

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      element.classList.add("comment--highlighted");

      window.setTimeout(() => {
        element.classList.remove("comment--highlighted");
      }, 3000);
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading]);

  return (
    <section className={`comment-section ${loading ? "is-loading" : ""}`}>
      <header className="comment-header">
        <span>COMMUNITY</span>

        <h2>Episode Discussion</h2>

        <p>Share your thoughts about this episode.</p>
      </header>

      <CommentVerification />

      <CommentForm episodeId={episodeId} />

      <div className="comments-toolbar">
        <span>Sort by</span>

        <div className="comments-toolbar-options">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={sort === option.value ? "active" : ""}
              onClick={() => setSort(option.value)}
              aria-pressed={sort === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <CommentList episodeId={episodeId} />
    </section>
  );
}
