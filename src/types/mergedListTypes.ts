export interface Anime {
  plId: string;
  plThumbnail?: string;
  scoreAlt: string;
  id: number;
  season: number;
  nanoid: string;
  slug: string;
  title: string;
  score: number;
  ratedBy: number;
  startDate: Date;
  poster: string;
  backdrop: null | string;
  description: string;
  tagline: string;
  popularity: number;
  episodes: Episode[];
  seasons: number;
  runtime: string;
  endDate: Date;
  genres: string[];
  status: string;
  keywords: string;
  extra_backdrops: string[];
  logos_en: string[];
  logos_hi: string[];
  season_poster: null | string;
  anikawaReview?: AnikawaReview;
  animeInsights?: AnimeInsights;
  whoShouldWatch?: WhoShouldWatch;
  whatMakesItSpecial?: WhatMakesItSpecial;
  watchOrder?: WatchOrder;
  faq?: AnimeFAQ;
  relatedArticles?: RelatedArticles;
}

type RelatedArticle = {
  title: string;
  description: string;
  slug: string;
  category: string;
  readingTime: string;
};

type RelatedArticles = {
  heading: string;
  intro: string;
  articles: RelatedArticle[];
};

type AnimeFAQ = {
  intro?: string;
  questions: {
    question: string;
    answer: string;
  }[];
};

type WatchOrderEntry = {
  title: string;
  slug: string;
  type: "Season" | "Movie" | "OVA" | "Special";
  order: number;
  recommended: boolean;
};

type WatchOrder = {
  franchiseTitle: string;
  note: string;
  entries: WatchOrderEntry[];
};

type WhatMakesItSpecial = {
  summary: string;
  standoutElements: {
    title: string;
    description: string;
  }[];
};

type WhoShouldWatch = {
  perfectFor: string[];
  maybeSkipIf: string[];
  viewingMood: string;
  commitmentLevel: "Low" | "Medium" | "High";
};

type AnimeInsights = {
  title: string;
  facts: string[];
};

type AnikawaReview = {
  verdict: string;
  review: string;
  strengths: string[];
  recommendedFor: string[];
};

export interface Episode {
  url: string;
  ytThumbnail: string;
  audio: string;
  titleAlt: string;
  nanoid: string;
  slug: string;
  air_date: Date;
  epNum: number;
  title: string;
  description: string;
  img: null | string;
  vote_average: number;
  vote_count: number;
  ratingLabel?: string;
  summary?: string;
  importance?: string;
  facts?: string[]
}