import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CalendarBlankIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";

import type { AnimeListStatus, RpcAnimeList } from "@/types/animeList";

import "@/styles/components/Profile/AnimeListEditModal.css";

import ConfirmModal from "@/components/Modals/ConfirmModal";
import { useAnimeListStore } from "@/stores/animeListStore";
import {
  toDateInputValue,
  getBackdrop,
  clamp,
  parseScore,
  isValidDateInput,
} from "./AnimeList.helpers";
import { Icon } from "@/icons/icons";

const STATUSES: ReadonlyArray<{
  value: AnimeListStatus;
  label: string;
}> = [
  {
    value: "watching",
    label: "Watching",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "paused",
    label: "Paused",
  },
  {
    value: "dropped",
    label: "Dropped",
  },
  {
    value: "planning",
    label: "Planning",
  },
];

export interface AnimeListEditData {
  status: AnimeListStatus;
  progress: number;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

interface Props {
  anime: RpcAnimeList;
  opBtnClass: string;
}

export default function AnimeListEditModal({
  anime,
  opBtnClass = "anime-list__options",
}: Props) {
  const addToList = useAnimeListStore((state) => state.addToList);
  const removeFromList = useAnimeListStore((state) => state.removeFromList);
  const animeNanoid = anime.nanoid;
  const deleting = useAnimeListStore((state) => state.saving);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [status, setStatus] = useState<AnimeListStatus>(anime.userAnime.status);

  const [progress, setProgress] = useState<number>(
    anime.userAnime.progress ?? 0,
  );

  const [score, setScore] = useState<string>(
    anime.userAnime.score == null ? "" : String(anime.userAnime.score),
  );

  const [startedAt, setStartedAt] = useState<string>(
    toDateInputValue(anime.userAnime.started_at),
  );

  const [completedAt, setCompletedAt] = useState<string>(
    toDateInputValue(anime.userAnime.completed_at),
  );

  const [notes, setNotes] = useState<string>(anime.userAnime.notes ?? "");

  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /*
  |--------------------------------------------------------------------------
  | ANIME METADATA
  |--------------------------------------------------------------------------
  */

  const totalEpisodes =
    anime.number_of_episodes ?? anime.episodes?.length ?? null;

  const maxProgress =
    totalEpisodes !== null && totalEpisodes > 0 ? totalEpisodes : undefined;

  const backdrop = getBackdrop(anime);

  /*
  |--------------------------------------------------------------------------
  | FORM SYNCHRONIZATION
  |--------------------------------------------------------------------------
  |
  | Important when the same modal instance receives
  | a different anime.
  |
  */

  useEffect(() => {
    setStatus(anime.userAnime.status);

    setProgress(anime.userAnime.progress ?? 0);

    setScore(
      anime.userAnime.score == null ? "" : String(anime.userAnime.score),
    );

    setStartedAt(toDateInputValue(anime.userAnime.started_at));

    setCompletedAt(toDateInputValue(anime.userAnime.completed_at));

    setNotes(anime.userAnime.notes ?? "");

    setError(null);

    setSaving(false);

    setShowDeleteModal(false);
  }, [anime]);

  const changeProgress = (amount: number) => {
    setProgress((current) => clamp(current + amount, 0, maxProgress));
  };

  /*Score*/

  const handleScoreChange = (value: string) => {
    /*
    |--------------------------------------------------------------------------
    | Allow the user to temporarily clear the field.
    |--------------------------------------------------------------------------
    */

    if (value === "") {
      setScore("");
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Only allow numeric score input.
    |--------------------------------------------------------------------------
    */

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Don't allow more than one decimal place.
    |--------------------------------------------------------------------------
    */

    const decimalIndex = value.indexOf(".");

    if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 1) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Don't allow values above 10.
    |--------------------------------------------------------------------------
    */

    const numeric = Number(value);

    if (Number.isFinite(numeric) && numeric > 10) {
      setScore("10");
      return;
    }

    setScore(value);
  };

  /*STATUS*/
  const handleStatusChange = (nextStatus: AnimeListStatus) => {
    setStatus(nextStatus);

    /*
    |--------------------------------------------------------------------------
    | Completing an anime:
    |
    | If total episodes are known, move progress to
    | the final episode.
    |
    | Only set completedAt when there isn't already
    | a completion date.
    |--------------------------------------------------------------------------
    */

    if (nextStatus === "completed" && maxProgress !== undefined) {
      setProgress(maxProgress);

      if (!completedAt) {
        setCompletedAt(new Date().toISOString().slice(0, 10));
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    /*
  |--------------------------------------------------------------------------
  | Prevent duplicate submissions.
  |--------------------------------------------------------------------------
  */

    if (saving || deleting) {
      return;
    }

    setError(null);

    /*
  |--------------------------------------------------------------------------
  | Validate anime nanoid.
  |--------------------------------------------------------------------------
  */

    if (!animeNanoid.trim()) {
      setError("Invalid anime.");

      return;
    }

    /*
  |--------------------------------------------------------------------------
  | Validate progress.
  |--------------------------------------------------------------------------
  */

    if (
      !Number.isInteger(progress) ||
      progress < 0 ||
      (maxProgress !== undefined && progress > maxProgress)
    ) {
      setError("Invalid episode progress.");

      return;
    }

    /*
  |--------------------------------------------------------------------------
  | Validate score.
  |--------------------------------------------------------------------------
  */

    const numericScore = parseScore(score);

    if (score.trim() !== "" && numericScore === null) {
      setError("Score must be between 0 and 10.");

      return;
    }

    /*
  |--------------------------------------------------------------------------
  | Validate dates.
  |--------------------------------------------------------------------------
  */

    if (!isValidDateInput(startedAt)) {
      setError("Invalid start date.");

      return;
    }

    if (!isValidDateInput(completedAt)) {
      setError("Invalid completion date.");

      return;
    }

    /*
  |--------------------------------------------------------------------------
  | Date consistency.
  |--------------------------------------------------------------------------
  */

    if (startedAt && completedAt && completedAt < startedAt) {
      setError("Completion date cannot be before the start date.");

      return;
    }

    setSaving(true);

    try {
      /*
    |--------------------------------------------------------------------------
    | Upsert anime list entry.
    |--------------------------------------------------------------------------
    */

      const saved = await addToList({
        anime_nanoid: animeNanoid,

        status,

        progress,

        score: numericScore,

        startedAt: startedAt || null,

        completedAt: completedAt || null,

        notes: notes.trim() || null,
      });

      /*
    |--------------------------------------------------------------------------
    | Store catches its own errors and returns null.
    |--------------------------------------------------------------------------
    */

      if (!saved) {
        throw new Error("Failed to save changes.");
      }

      /*
    |--------------------------------------------------------------------------
    | Save successful.
    |
    | The modal owns its Dialog, so close it here.
    |--------------------------------------------------------------------------
    */

      setError(null);

      closeButtonRef.current?.click();
    } catch (err) {
      console.error("[AnimeListEditModal] Failed to save changes:", err);

      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async () => {
    /*
    |--------------------------------------------------------------------------
    | Prevent conflicting operations.
    |--------------------------------------------------------------------------
    */

    if (saving || deleting) {
      return;
    }

    setError(null);

    try {
      const success = await removeFromList(anime.userAnime.anime_nanoid);

      if (!success) {
        /*
        |--------------------------------------------------------------------------
        | The store may already have a useful error,
        | but the modal should still have a local fallback.
        |--------------------------------------------------------------------------
        */

        const storeError = useAnimeListStore.getState().error;

        setError(storeError ?? "Unable to remove anime from your list.");

        return;
      }

      setShowDeleteModal(false);

      closeButtonRef.current?.click();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove anime from your list.",
      );
    }
  };

  return (
    <>
      <Dialog.Root>
        <Dialog.Close asChild>
          <button
            ref={closeButtonRef}
            type="button"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </Dialog.Close>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className={opBtnClass}
            aria-label={`Edit ${anime.title}`}
          >
            <Icon name="more-horiz" color="currentColor" size={20} />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="anime-list-edit-modal__overlay" />

          <Dialog.Content
            className="anime-list-edit-modal__content"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            {/* HERO */}

            <div className="anime-list-edit-modal__hero">
              {backdrop ? (
                <img
                  src={backdrop}
                  alt=""
                  className="anime-list-edit-modal__backdrop"
                />
              ) : (
                <div className="anime-list-edit-modal__backdrop-placeholder" />
              )}

              <div className="anime-list-edit-modal__hero-gradient" />

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="anime-list-edit-modal__close"
                  aria-label="Close editor"
                  disabled={saving}
                >
                  <XIcon size={20} weight="bold" />
                </button>
              </Dialog.Close>

              <div className="anime-list-edit-modal__hero-content">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="anime-list-edit-modal__poster"
                />

                <div className="anime-list-edit-modal__hero-info">
                  <span className="anime-list-edit-modal__eyebrow">
                    EDIT YOUR LIBRARY
                  </span>

                  <Dialog.Title className="anime-list-edit-modal__title">
                    {anime.title}
                  </Dialog.Title>

                  <div className="anime-list-edit-modal__meta">
                    {anime.format && <span>{anime.format}</span>}

                    {anime.startDate && (
                      <>
                        <i />
                        <span>{anime.startDate.split("-")[0]}</span>
                      </>
                    )}

                    {maxProgress !== undefined && (
                      <>
                        <i />
                        <span>{maxProgress} episodes</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="anime-list-edit-modal__body">
              {/* STATUS */}

              <section className="anime-list-edit-modal__section">
                <div className="anime-list-edit-modal__label">Status</div>

                <div className="anime-list-edit-modal__status-grid">
                  {STATUSES.map((item) => {
                    const active = status === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        className={`anime-list-edit-modal__status ${
                          active ? "is-active" : ""
                        }`}
                        onClick={() => handleStatusChange(item.value)}
                        disabled={saving || deleting}
                      >
                        {active && <CheckIcon size={13} weight="bold" />}

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* PROGRESS + SCORE */}

              <div className="anime-list-edit-modal__compact-grid">
                <section className="anime-list-edit-modal__compact-field">
                  <div className="anime-list-edit-modal__field-top">
                    <span>Progress</span>
                  </div>

                  <div className="anime-list-edit-modal__stepper">
                    <button
                      type="button"
                      onClick={() => changeProgress(-1)}
                      disabled={saving || deleting || progress <= 0}
                      aria-label="Decrease episode progress"
                    >
                      <MinusIcon size={17} />
                    </button>

                    <span className="anime-list-edit-modal__progress-value">
                      {progress}
                      <small>/ {maxProgress ?? "?"}</small>
                    </span>

                    <button
                      type="button"
                      onClick={() => changeProgress(1)}
                      disabled={
                        saving ||
                        deleting ||
                        (maxProgress !== undefined && progress >= maxProgress)
                      }
                      aria-label="Increase episode progress"
                    >
                      <PlusIcon size={17} />
                    </button>
                  </div>
                </section>

                <section className="anime-list-edit-modal__compact-field">
                  <div className="anime-list-edit-modal__field-top">
                    <span>Score</span>

                    <StarIcon size={15} weight="fill" />
                  </div>

                  <div className="anime-list-edit-modal__score">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={score}
                      placeholder="—"
                      onChange={(event) =>
                        handleScoreChange(event.target.value)
                      }
                      disabled={saving}
                    />

                    <span>/ 10</span>
                  </div>
                </section>
              </div>

              {/* DATES */}

              <div className="anime-list-edit-modal__compact-grid">
                <label className="anime-list-edit-modal__date">
                  <span>Started</span>

                  <div>
                    <CalendarBlankIcon size={16} />

                    <input
                      type="date"
                      value={startedAt}
                      onChange={(event) => setStartedAt(event.target.value)}
                      disabled={saving}
                    />
                  </div>
                </label>

                <label className="anime-list-edit-modal__date">
                  <span>Completed</span>

                  <div>
                    <CalendarBlankIcon size={16} />

                    <input
                      type="date"
                      value={completedAt}
                      onChange={(event) => setCompletedAt(event.target.value)}
                      disabled={saving}
                    />
                  </div>
                </label>
              </div>

              {/* DELETE BUTTON */}

              <div className="anime-list-edit-modal__danger-zone">
                <button
                  type="button"
                  className="anime-list-edit-modal__delete"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={saving || deleting}
                >
                  <TrashIcon size={18} weight="bold" />
                  <span>Remove from list</span>
                </button>
              </div>

              {/* NOTES */}

              <section className="anime-list-edit-modal__notes">
                <div className="anime-list-edit-modal__field-top">
                  <span>Notes</span>

                  <small>{notes.length}/2000</small>
                </div>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add a note..."
                  maxLength={2000}
                  rows={3}
                  disabled={saving}
                />
              </section>

              {error && (
                <div className="anime-list-edit-modal__error">{error}</div>
              )}
            </div>

            {/* FOOTER */}

            <div className="anime-list-edit-modal__footer">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="anime-list-edit-modal__cancel"
                  disabled={saving || deleting}
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="button"
                className="anime-list-edit-modal__save"
                onClick={handleSave}
                disabled={saving || deleting}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmModal
        open={showDeleteModal}
        title="Remove from your list?"
        description={`This will remove ${anime.title} from your anime list.`}
        confirmText="Remove"
        cancelText="Cancel"
        danger
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
