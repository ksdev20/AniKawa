import { getCollection } from "astro:content";

const usedTitlesGlobal: string[] = [];

const posts = await getCollection("blog");

export const BlogSection2 = {
  heading: "Anime Stories & Recommendations",
  subheading:
    "Thoughtfully crafted guides, recommendations, and anime deep-dives curated by the AniKawa team.",
  btnText: "Read More Articles",
  btnLink: "/blog",
  posts: posts,
};

export const recentlyWatched = {
  bigH: "Recently Watched",
  smallH: "Pick up where you left off",
  forRW: true,
};

export const SliderData = [
  {
    bigH: "Watch Top-Rated Anime in HD – 100% Ad-Free!",
    smallH:
      "Explore the most popular anime from the last 5 years, all in stunning high definition.",
    filterName: "topRatedLast5",
    usedTitlesGlobal,
  },
  {
    bigH: "",
    smallH: "",
    filterName: "recommendedByAnikawa",
    usedTitlesGlobal,
  },
  {
    bigH: "New Anime Releases This Month",
    smallH:
      "Stay updated with the latest anime episodes and series airing this month.",
    filterName: "sameMonthAnimeGen",
    usedTitlesGlobal,
  },
  {
    bigH: "Most Popular Anime Worldwide",
    smallH: "Fan-favorite anime loved by viewers across the globe.",
    filterName: "isPopular",
    usedTitlesGlobal,
  },
  {
    bigH: "Action-Packed Anime Series",
    smallH: "High-energy battles, epic storylines, and unforgettable heroes.",
    filterName: "actionPopular",
    usedTitlesGlobal,
  },
  {
    bigH: "Adventure Anime You Can’t Miss",
    smallH:
      "Thrilling journeys, mysterious lands, and incredible worlds to explore.",
    filterName: "adventurePopular",
    usedTitlesGlobal,
  },
  {
    bigH: "Top Romance Anime with 7★+ Ratings",
    smallH: "Heartwarming stories and emotional moments for romance lovers.",
    filterName: "romancePopular",
    usedTitlesGlobal,
  },
];
