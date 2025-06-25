import fs from 'fs';
import { aniOneAsiaDataAnilist3 } from './aniOneAsiaDataAnilist3.mjs';

function extractSeason(title) {
  const lowered = title.toLowerCase().split(/[\s\-:]/);

  for (let i = 0; i < lowered.length; i++) {
    const word = lowered[i];

    if (word == 'season' || word == 's') {
      const next = parseInt(lowered[i + 1]);
      if (!isNaN(next)) return next;
    }

    if (word.startsWith('s') || word.startsWith('season')) {
      const match = word.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 1;
    }

    if (!isNaN(parseInt(word)) && i > 0) {
      return parseInt(word);
    }

    if (word.match(/\d+$/)) {
      return parseInt(word.match(/\d+$/)[0], 10) || 1;
    }
  }

  return 1;
}


async function searchShow(title) {
  /*FIND TMDB_API_KEY*/
  const query = encodeURIComponent(title);
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Response Error !");

    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error("Data Error !");

    return data.results[0].id;
  } catch (e) {
    console.error(e);
  }
}

async function getEpisodeDescription(showId, season, episode) {
  /*FIND YOUTUBE_API_KEY*/
  const url = `https://api.themoviedb.org/3/tv/${showId}/season/${season}/episode/${episode}?api_key=${apiKey}&language=en-US`;

  const res = await fetch(url);
  const data = await res.json();

  return data.overview || "No description found.";
}

async function main() {
  await new Promise(resolve => setTimeout(resolve, 5000));
  for (let anime of aniOneAsiaDataAnilist3) {
    const showTitle = anime?.anilist?.title || anime?.cleanTitle;
    const season = extractSeason(showTitle);

    const showId = await searchShow(showTitle.replace(/\(Season \d+\)/i, '').trim());
    if (!showId) continue;

    for (let ep of anime?.videos || []) {
      const epNum = ep.episodeNumber;
      const description = await getEpisodeDescription(showId, season, epNum);
      if (description) {
        if (!ep.episodeDetails || !Array.isArray(ep.episodeDetails)){
          ep.episodeDetails = [{}];
        } else if (!ep.episodeDetails[0]){
          ep.episodeDetails[0] = {};
        }
        ep.episodeDetails[0].description = description;
        console.log(`✅ ${showTitle} - S${season}E${epNum}`);
      } else {
        console.log(`⏭️ No desc: ${showTitle} - S${season}E${epNum}`);
      }
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }

  fs.writeFileSync(
    './aniOneAsiaDataAnilist3.mjs',
    `export const aniOneAsiaDataAnilist3 = ${JSON.stringify(aniOneAsiaDataAnilist3, null, 2)};`
  );
  console.log("✅ File updated successfully.");
}

main();