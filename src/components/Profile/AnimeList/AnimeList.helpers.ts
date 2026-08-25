import type { RpcAnimeList } from "@/types/animeList";

export function progressPercent(anime: RpcAnimeList): number {
  const episodes = anime.number_of_episodes ?? 0;

  if (episodes <= 0) {
    return 0;
  }

  return Math.min(100, (anime.userAnime.progress / episodes) * 100);
}

export function fuzzyScore(query: string, title: string): number {
  const target = title.toLowerCase();

  if (target === query) {
    return 1000;
  }

  if (target.startsWith(query)) {
    return 900;
  }

  if (target.includes(query)) {
    return 800;
  }

  let queryIndex = 0;
  let consecutive = 0;
  let bestConsecutive = 0;

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      queryIndex++;
      consecutive++;

      bestConsecutive = Math.max(bestConsecutive, consecutive);
    } else {
      consecutive = 0;
    }
  }

  if (queryIndex !== query.length) {
    return 0;
  }

  return 300 + bestConsecutive * 20 - Math.max(0, target.length - query.length);
}

/*AnimeListEditModal Helpers*/

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL timestamptz values arrive as ISO strings.
  |
  | We only need YYYY-MM-DD for <input type="date">.
  |--------------------------------------------------------------------------
  */

  return value.slice(0, 10);
}

export function getBackdrop(anime: RpcAnimeList): string | null {
  const candidate = anime as RpcAnimeList & {
    backdrop?: string | null;
    backdrop_url?: string | null;
    banner?: string | null;
    banner_image?: string | null;
  };

  return (
    candidate.backdrop ??
    candidate.backdrop_url ??
    candidate.banner ??
    candidate.banner_image ??
    null
  );
}

export function clamp(value: number, min: number, max?: number): number {
  if (max === undefined) {
    return Math.max(min, value);
  }

  return Math.min(max, Math.max(min, value));
}

export function parseScore(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.round(clamp(numeric, 0, 10) * 10) / 10;
}

export function isValidDateInput(value: string): boolean {
  if (!value) {
    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | HTML date inputs normally guarantee YYYY-MM-DD,
  | but validate again before sending data to the API.
  |--------------------------------------------------------------------------
  */

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}
