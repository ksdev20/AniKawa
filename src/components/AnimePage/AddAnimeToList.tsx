import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useAnimeListStore } from "@/stores/animeListStore";

import { STATUS_CONFIG, type AnimeListStatus } from "@/types/animeList";

import "@/styles/pages/show/AddAnimeToList.css";
import {
  CheckCircleIcon,
  CircleNotchIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useLoginModalStore } from "@/global_assets/loginModalStore";

interface AddAnimeToListProps {
  animeNanoid: string;
}

interface AnimeListEntry {
  exists: boolean;
  animeNanoid: string;
  status: AnimeListStatus | null;
  progress: number;
  score: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

type ButtonState =
  "initializing" | "checking" | "guest" | "not-added" | "added" | "error";

const STATUS_OPTIONS: AnimeListStatus[] = [
  "watching",
  "planning",
  "completed",
  "paused",
  "dropped",
];

export default function AddAnimeToList({ animeNanoid }: AddAnimeToListProps) {
  const { initialized, isAuthenticated } = useAuth();

  const addToList = useAnimeListStore((state) => state.addToList);

  const removeFromList = useAnimeListStore((state) => state.removeFromList);

  const [entry, setEntry] = useState<AnimeListEntry | null>(null);

  const [buttonState, setButtonState] = useState<ButtonState>("initializing");

  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement | null>(null);

  /*
   * Prevent an old request from updating the UI if the anime
   * changes before the request finishes.
   */
  const requestIdRef = useRef(0);

  /*
   * ----------------------------------------------------------------------
   * Authentication + single-anime list lookup
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    if (!initialized) {
      setButtonState("initializing");
      setEntry(null);
      setPickerOpen(false);
      setError(null);

      return;
    }

    /*
     * Guest:
     *
     * DO NOT call the API.
     */
    if (!isAuthenticated) {
      setButtonState("guest");
      setEntry(null);
      setPickerOpen(false);
      setError(null);

      return;
    }

    if (!animeNanoid) {
      setButtonState("error");
      setEntry(null);
      setError("Anime identifier is missing.");

      return;
    }

    const requestId = ++requestIdRef.current;

    const controller = new AbortController();

    async function checkAnimeListEntry() {
      setButtonState("checking");
      setEntry(null);
      setPickerOpen(false);
      setError(null);

      try {
        const response = await fetch(
          `/api/profile/anime-list/entry?animeNanoid=${encodeURIComponent(
            animeNanoid,
          )}`,
          {
            method: "GET",
            credentials: "same-origin",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        const result = (await response.json()) as ApiResponse<AnimeListEntry>;

        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to check your anime list.");
        }

        if (!result.data) {
          throw new Error("The server returned an invalid anime list entry.");
        }

        /*
         * Defensive client-side validation.
         */
        if (result.data.animeNanoid !== animeNanoid) {
          throw new Error("The server returned an invalid anime.");
        }

        setEntry(result.data);

        if (result.data.exists && result.data.status) {
          setButtonState("added");
        } else {
          setButtonState("not-added");
        }
      } catch (requestError) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        console.error(
          "[AddAnimeToList] Failed to check anime list:",
          requestError,
        );

        setButtonState("error");

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to check your anime list.",
        );
      }
    }

    void checkAnimeListEntry();

    return () => {
      controller.abort();
    };
  }, [animeNanoid, initialized, isAuthenticated]);

  /*
   * ----------------------------------------------------------------------
   * Close picker when clicking outside
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [pickerOpen]);

  /*
   * ----------------------------------------------------------------------
   * Keyboard handling
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pickerOpen]);

  /*
   * ----------------------------------------------------------------------
   * Guest
   * ----------------------------------------------------------------------
   */

  function handleGuestClick() {
    useLoginModalStore.getState().openLogin();
  }

  /*
   * ----------------------------------------------------------------------
   * Main button
   * ----------------------------------------------------------------------
   */

  function handleMainClick() {
    if (buttonState === "initializing") {
      return;
    }

    if (buttonState === "checking") {
      return;
    }

    if (buttonState === "guest") {
      handleGuestClick();
      return;
    }

    if (buttonState === "error") {
      /*
       * The component will automatically retry when auth/anime
       * changes. We don't silently spam the API here.
       */
      return;
    }

    setPickerOpen((current) => !current);
  }

  /*
   * ----------------------------------------------------------------------
   * Add / update anime
   * ----------------------------------------------------------------------
   */

  async function handleStatusSelect(status: AnimeListStatus) {
    if (saving || !animeNanoid) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saved = await addToList({
        anime_nanoid: animeNanoid,
        status,
        progress: entry?.progress ?? 0,
        score: entry?.score ?? null,
      });

      if (!saved) {
        throw new Error("Unable to update your anime list.");
      }

      /*
       * Optimistically update our tiny local representation.
       *
       * We don't refetch the entire anime list.
       */
      setEntry({
        exists: true,
        animeNanoid,
        status,
        progress: entry?.progress ?? 0,
        score: entry?.score ?? null,
      });

      setButtonState("added");
      setPickerOpen(false);
    } catch (saveError) {
      console.error("[AddAnimeToList] Failed to save anime:", saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update your anime list.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveFromList() {
    if (saving || !animeNanoid || !entry?.exists) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const removed = await removeFromList(animeNanoid);

      if (!removed) {
        throw new Error("Unable to remove anime from your list.");
      }

      /*
       * The anime is no longer in the user's list.
       *
       * No refetch is required because we already know
       * exactly which entry was removed.
       */
      setEntry({
        exists: false,
        animeNanoid,
        status: null,
        progress: 0,
        score: null,
      });

      setButtonState("not-added");
      setPickerOpen(false);
    } catch (removeError) {
      console.error("[AddAnimeToList] Failed to remove anime:", removeError);

      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove anime from your list.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ----------------------------------------------------------------------
   * Render state
   * ----------------------------------------------------------------------
   */

  const currentStatus = entry?.status ?? null;

  const statusConfig = currentStatus ? STATUS_CONFIG[currentStatus] : null;

  const StatusIcon = statusConfig?.icon;

  /*
   * ----------------------------------------------------------------------
   * Initializing
   * ----------------------------------------------------------------------
   */

  if (buttonState === "initializing") {
    return (
      <div
        className="add-anime-list add-anime-list--loading"
        aria-hidden="true"
      >
        <button type="button" className="add-anime-list__button" disabled>
          <CircleNotchIcon
            className="add-anime-list__spinner"
            size={19}
            weight="bold"
          />

          <span>Add to List</span>
        </button>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Checking authenticated user's list
   * ----------------------------------------------------------------------
   */

  if (buttonState === "checking") {
    return (
      <div className="add-anime-list add-anime-list--loading" aria-busy="true">
        <button type="button" className="add-anime-list__button" disabled>
          <CircleNotchIcon
            className="add-anime-list__spinner"
            size={19}
            weight="bold"
          />

          <span>Checking List</span>
        </button>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Guest
   * ----------------------------------------------------------------------
   */

  if (buttonState === "guest") {
    return (
      <div className="add-anime-list">
        <button
          type="button"
          className="add-anime-list__button add-anime-list__button--guest"
          onClick={handleGuestClick}
          aria-label="Log in to add this anime to your list"
        >
          <PlusIcon size={19} weight="bold" />

          <span>Add to List</span>
        </button>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Error
   * ----------------------------------------------------------------------
   */

  if (buttonState === "error") {
    return (
      <div className="add-anime-list">
        <button
          type="button"
          className="add-anime-list__button add-anime-list__button--error"
          disabled
          title={error ?? "Unable to load list status"}
        >
          <XCircleIcon size={19} weight="bold" />

          <span>List Unavailable</span>
        </button>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Added — status button
   * ----------------------------------------------------------------------
   */

  if (buttonState === "added" && currentStatus && statusConfig && StatusIcon) {
    return (
      <div className="add-anime-list" ref={pickerRef}>
        <button
          type="button"
          className={[
            "add-anime-list__button",
            "add-anime-list__button--status",
            statusConfig.className,
          ].join(" ")}
          onClick={handleMainClick}
          aria-expanded={pickerOpen}
          aria-haspopup="menu"
          disabled={saving}
          aria-busy={saving}
        >
          <StatusIcon size={19} weight="fill" />

          <span>{statusConfig.label}</span>

          <span className="add-anime-list__chevron" aria-hidden="true">
            {pickerOpen ? "−" : "+"}
          </span>
        </button>

        {pickerOpen && (
          <StatusPicker
            currentStatus={currentStatus}
            saving={saving}
            onSelect={handleStatusSelect}
            onRemove={handleRemoveFromList}
          />
        )}

        {error && <p className="add-anime-list__error">{error}</p>}
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Not added
   * ----------------------------------------------------------------------
   */

  return (
    <div className="add-anime-list" ref={pickerRef}>
      <button
        type="button"
        className="add-anime-list__button add-anime-list__button--add"
        onClick={handleMainClick}
        aria-expanded={pickerOpen}
        aria-haspopup="menu"
        disabled={saving}
      >
        <PlusIcon size={19} weight="bold" />

        <span>Add to List</span>

        <span className="add-anime-list__chevron" aria-hidden="true">
          {pickerOpen ? "−" : "+"}
        </span>
      </button>

      {pickerOpen && (
        <StatusPicker
          currentStatus={null}
          saving={saving}
          onSelect={handleStatusSelect}
          onRemove={handleRemoveFromList}
        />
      )}

      {error && <p className="add-anime-list__error">{error}</p>}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Status Picker
|--------------------------------------------------------------------------
*/

interface StatusPickerProps {
  currentStatus: AnimeListStatus | null;
  saving: boolean;
  onSelect: (status: AnimeListStatus) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}

function StatusPicker({
  currentStatus,
  saving,
  onSelect,
  onRemove,
}: StatusPickerProps) {
  return (
    <div
      className="add-anime-list__picker"
      role="menu"
      aria-label="Choose anime list status"
    >
      <div className="add-anime-list__picker-header">
        <span>{currentStatus ? "Change status" : "Add to your list"}</span>
      </div>

      <div className="add-anime-list__options">
        {STATUS_OPTIONS.map((status) => {
          const config = STATUS_CONFIG[status];

          const Icon = config.icon;

          const selected = status === currentStatus;

          return (
            <button
              key={status}
              type="button"
              className={[
                "add-anime-list__option",
                config.className,
                selected ? "add-anime-list__option--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                void onSelect(status);
              }}
              disabled={saving}
              role="menuitem"
              aria-current={selected ? "true" : undefined}
            >
              <span className="add-anime-list__option-icon">
                <Icon size={18} weight={selected ? "fill" : "regular"} />
              </span>

              <span className="add-anime-list__option-label">
                {config.label}
              </span>

              {selected && (
                <CheckCircleIcon
                  className="add-anime-list__option-check"
                  size={17}
                  weight="fill"
                />
              )}
            </button>
          );
        })}
      </div>
      {currentStatus && (
        <div className="add-anime-list__danger">
          <div className="add-anime-list__divider" aria-hidden="true" />

          <button
            type="button"
            className="add-anime-list__remove"
            onClick={() => {
              void onRemove();
            }}
            disabled={saving}
            role="menuitem"
          >
            <span className="add-anime-list__remove-icon">
              <TrashIcon size={17} weight="bold" />
            </span>

            <span className="add-anime-list__remove-label">
              Remove from List
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
