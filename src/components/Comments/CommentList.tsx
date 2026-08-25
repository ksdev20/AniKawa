"use client";

import { useEffect, useRef } from "react";

import { useCommentsStore } from "@/lib/comments/commentsStore";

import CommentCard from "./CommentCard";

interface Props {
  episodeId: string;
}

export default function CommentList({ episodeId }: Props) {
  const {
    loading,

    commentsById,

    rootCommentIds,

    replyIdsByParent,

    loadingMore,

    hasMore,

    error,

    sort,

    nextCursor,

    refresh,

    loadMoreComments,
  } = useCommentsStore();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /*
    Infinite scroll observer
  */

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !loadingMore && nextCursor) {
          void loadMoreComments(episodeId);
        }
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [episodeId, hasMore, loadingMore, nextCursor, loadMoreComments]);

  const onRetry = () => {
    refresh(episodeId, sort);
  };

  /*
    Initial loading only
  */

  if (loading) {
    return (
      <div className="comments-list" aria-live="polite">
        <div className="comment-loading">
          <p>Loading comments...</p>

          <div className="comment-skeleton" aria-hidden="true" />

          <div className="comment-skeleton" aria-hidden="true" />

          <div className="comment-skeleton" aria-hidden="true" />
        </div>
      </div>
    );
  }

  /*
    Error
  */

  if (error) {
    return (
      <div className="comments-list">
        <div className="comments-error" role="alert">
          <p>{error}</p>

          <button className="retry-comments" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
    Empty
  */

  if (rootCommentIds.length === 0) {
    return (
      <div className="comments-list">
        <p className="comments-empty">Be the first to discuss this episode!</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {rootCommentIds.map((commentId) => {
        const comment = commentsById.get(commentId);

        if (!comment) {
          return null;
        }

        return (
          <CommentCard
            key={comment.id}
            comment={comment}
            commentsById={commentsById}
            replyIdsByParent={replyIdsByParent}
            depth={0}
          />
        );
      })}

      {/*
        Infinite scroll trigger
      */}

      <div
        ref={loadMoreRef}
        className="comments-load-trigger"
        aria-hidden="true"
      />

      {loadingMore && (
        <div>
          <div className="comment-loading">
            <div className="comment-skeleton" aria-hidden="true" />
          </div>
        </div>
        // <p className="comments-loading-more">Loading more comments...</p>
      )}

      {!hasMore && rootCommentIds.length > 0 && (
        <p className="comments-end" aria-hidden="true">
          You have reached the end.
        </p>
      )}
    </div>
  );
}
