import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

const CONCURRENCY = 15;

console.log("\n🔍 Anikawa Route Health Check\n");

console.log(`Target: ${BASE_URL}\n`);

// -----------------------------
// Load Data
// -----------------------------

function loadJSON(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const animeFile = path.resolve("src/data/mergedList.json");

const animeData = loadJSON(animeFile);

const animeList = Array.isArray(animeData)
  ? animeData
  : (animeData.anime ?? []);

// -----------------------------
// Static Routes
// -----------------------------

const staticRoutes = [
  "/",

  "/categories",

  "/list/new",

  "/list/popular",

  "/list/old",

  "/category/Action",

  "/blog",

  "/search",
];

// -----------------------------
// Anime Routes
// -----------------------------

const animeRoutes = animeList
  .map((anime: any) => {
    if (anime.id && anime.slug) {
      return `/show/${anime.nanoid}/${anime.slug}`;
    }

    return null;
  })
  .filter(Boolean);

// -----------------------------
// Episode Routes
// -----------------------------

const episodeRoutes = animeList
  .flatMap((anime: any) => {
    if (!anime.episodes) return [];

    return anime.episodes.map((episode: any) => {
      if (episode.id && episode.slug) {
        return `/episode/${anime.nanoid}/${episode.nanoid}/${episode.slug}`;
      }

      return null;
    });
  })
  .filter(Boolean);

// -----------------------------
// Blog Routes
// -----------------------------

// Update this if your blog JSON path differs

let blogRoutes: string[] = [];

const blogFile = path.resolve("src/data/blog.json");

if (fs.existsSync(blogFile)) {
  const blogs = loadJSON(blogFile);

  const posts = Array.isArray(blogs) ? blogs : (blogs.posts ?? []);

  blogRoutes = posts
    .map((post: any) => {
      if (post.slug) {
        return `/blog/${post.slug}`;
      }

      return null;
    })
    .filter(Boolean);
}

const allRoutes = [
  ...staticRoutes,

  ...animeRoutes,

  ...episodeRoutes,

  ...blogRoutes,
];

// Remove duplicates

const routes = [...new Set(allRoutes)];

console.log(`Total routes: ${routes.length}\n`);

// -----------------------------
// Checker
// -----------------------------

let passed = 0;
let failed = 0;

const failures: string[] = [];

async function checkRoute(route: string) {
  try {
    const response = await fetch(`${BASE_URL}${route}`);

    if (response.status === 200) {
      passed++;

      console.log(`✓ ${route}`);
    } else {
      failed++;

      console.log(`✗ ${route} (${response.status})`);

      failures.push(`${route} -> ${response.status}`);
    }
  } catch (error) {
    failed++;

    console.log(`✗ ${route} (ERROR)`);

    failures.push(`${route} -> ERROR`);
  }
}

// -----------------------------
// Concurrency Runner
// -----------------------------

async function runConcurrent(items: string[], limit: number) {
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];

      await checkRoute(current);
    }
  }

  const workers = Array.from(
    {
      length: Math.min(limit, items.length),
    },
    () => worker(),
  );

  await Promise.all(workers);
}

// Run

await runConcurrent(routes, CONCURRENCY);

// -----------------------------
// Summary
// -----------------------------

console.log("\n====================");

console.log(`Passed: ${passed}`);

console.log(`Failed: ${failed}`);

if (failures.length) {
  console.log("\n❌ Failed Routes:\n");

  failures.forEach((route) => console.log(route));
}

console.log("====================\n");

if (failed > 0) {
  process.exit(1);
}
