import { getCollection } from "astro:content";

const title = "AniKawa Blog | Anime Recommendations, Guides & Hidden Gems";

const pageDes =
  "Discover anime recommendations, beginner guides, hidden gems, seasonal picks, watch guides, and thoughtful anime analysis. Find your next favorite anime with AniKawa.";

const pageKw = [
  "anime blog",
  "anime recommendations",
  "anime guides",
  "anime watch guides",
  "anime beginner guides",
  "hidden gem anime",
  "best anime to watch",
  "anime analysis",
  "anime genres",
  "seasonal anime",
  "anime articles",
  "anime discoveries",
  "anime suggestions",
  "what anime to watch",
  "AniKawa blog",
];

const pageUrl = "https://anikawa.fun/blog";

const currentThumbnail =
  "https://ik.imagekit.io/anikawa/Page%20Images/blog-homepage-thumbnail.avif";
const posts = await getCollection("blog");

export const data = {
  title,
  pageDes,
  pageKw,
  pageUrl,
  currentThumbnail,
  posts,
};

export const discoverAnimeConfig = [
  {
    href: "/blog/10-emotional-anime-that-will-make-you-cry",
    icon: "😭",
    title: "Make Me Cry",
    description:
      "Emotional stories, unforgettable characters, and moments that hit right in the heart.",
  },
  {
    href: "/blog/10-anime-that-will-blow-your-mind",
    icon: "🧠",
    title: "Blow My Mind",
    description:
      "Twists, mysteries, psychological thrillers, and anime you'll think about for days.",
  },
  {
    href: "/blog/hidden-gem-anime-that-deserve-more-attention",
    icon: "💎",
    title: "Show Me Hidden Gems",
    description: "Underrated anime that deserve way more love than they get.",
  },
  {
    href: "/blog/10-action-anime-that-deliver-from-start-to-finish",
    icon: "🔥",
    title: "Give Me Action",
    description:
      "Epic battles, powerful rivals, and nonstop excitement from start to finish.",
  },
  {
    href: "/blog/10-relaxing-anime-to-watch-when-you-need-a-break",
    icon: "🌸",
    title: "Something Relaxing",
    description:
      "Cozy worlds, slice-of-life stories, and anime that feel like comfort food.",
  },
  {
    href: "/blog/romance-anime-that-are-actually-worth-your-time",
    icon: "❤️",
    title: "A Great Romance",
    description:
      "Heartwarming relationships, emotional connections, and memorable love stories.",
  },
  {
    href: "/blog/10-new-anime-everyone-is-talking-about-right-now",
    icon: "🚀",
    title: "Something New",
    description:
      "Fresh releases, new seasons, and anime everyone's starting to talk about.",
  },
  {
    href: "/blog/fantasy-anime-that-will-transport-you-to-another-world",
    icon: "🌍",
    title: "Take Me Somewhere New",
    description:
      "Fantasy adventures, magical worlds, and unforgettable journeys.",
  },
  {
    href: "/blog/best-animes-online-for-beginners",
    icon: "🎓",
    title: "I'm New To Anime",
    description:
      "Beginner-friendly recommendations and perfect starting points for new fans.",
  },
];

export const browseTopicsConfig = [
  {
    href: "/blog/category/anime-recommendations",
    icon: "⭐",
    title: "Anime Recommendations",
    description: "Curated anime picks for every mood, genre, and experience level.",
  },
  {
    href: "/blog/category/hidden-gems",
    icon: "💎",
    title: "Hidden Gems",
    description: "Discover underrated anime that deserve far more attention.",
  },
  {
    href: "/blog/category/watch-guides",
    icon: "📺",
    title: "Watch Guides",
    description: "Learn which anime are worth watching and where to start.",
  },
  {
    href: "/blog/category/seasonal-anime",
    icon: "🚀",
    title: "Seasonal Anime",
    description: "Follow the latest anime releases and trending seasonal shows.",
  },
  {
    href: "/blog/category/genre-spotlights",
    icon: "⚔️",
    title: "Genre Spotlights",
    description: "Explore Action, Romance, Fantasy, Sci-Fi and more.",
  },
  {
    href: "/blog/category/anime-analysis",
    icon: "🧠",
    title: "Anime Analysis",
    description: "Character breakdowns, themes, storytelling and deeper insights.",
  },
];

export const faqConfig = [
  {
    question: "How does AniKawa choose anime for recommendation articles?",
    answer:
      "We don't focus only on the most popular shows. Recommendations are selected based on storytelling, characters, themes, entertainment value, and the specific experience an anime offers. That's why you'll often find lesser-known series alongside mainstream favorites.",
  },
  {
    question: "Are AniKawa articles spoiler-free?",
    answer:
      "Most recommendation and watch-guide articles are written to be spoiler-free whenever possible. If a topic requires discussing major story events, clear warnings should be provided before important spoilers are mentioned.",
  },
  {
    question: "Do you only recommend highly rated anime?",
    answer:
      "No. Ratings can be helpful, but they don't tell the whole story. Sometimes an underrated anime resonates deeply with a specific type of viewer, which is why we also highlight hidden gems and overlooked series.",
  },
  {
    question: "Can beginners use AniKawa to find their first anime?",
    answer:
      "Absolutely. Many of our guides are written specifically for newcomers, with beginner-friendly recommendations, genre introductions, and suggestions based on different interests and moods.",
  },
  {
    question: "Why do some recommendation lists include older anime?",
    answer:
      "Great anime doesn't stop being great because it's old. Alongside new releases and seasonal hits, we frequently feature classics and older series that continue to be worth watching today.",
  },
  {
    question: "Can I discover anime similar to my favorite series on AniKawa?",
    answer:
      "Yes. Many articles and anime pages include related recommendations, similar shows, genre-based suggestions, and curated collections to help you find anime with a comparable experience or atmosphere.",
  },
];