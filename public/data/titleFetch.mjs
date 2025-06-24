import fs from 'fs';
import { aniOneAsiaData } from './aniOneAsiaData.mjs';

function scoreOutOf10(score) {
  return score ? (score / 10).toFixed(1) : "N/A";
}

function getCleanTitle(title) {
    if (title.includes('|')) {
        return title.split('|')[1].trim();
    }

    return title.replace(/[^\x00-\x7F]/g, ' ').trim();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getDate(rawDate) {
  return `${rawDate.day}/${rawDate.month}/${rawDate.year}`;
}

const query = `
  query($search:String){
  Media(search: $search, type:ANIME){
    id
    title{
      english
      romaji
    }
    description(asHtml:false)
    coverImage{
      extraLarge
    }
    bannerImage
    averageScore
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    type
    episodes
    status
    duration
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    season
    genres
  }
}
`;

async function fetcho(title) {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, variables: { search: title } })
    });

    if (!response.ok) throw new Error(`Network Error`);

    const data = await response.json();
    const anime = data.data?.Media;

    if (!anime) return null;

    return {
      streamingEpisodes: anime.streamingEpisodes,
      data: {
        id: anime.id,
        title: anime.title.english || anime.title.romaji || anime.title.native,
        romaji: anime.title.romaji || "N/A",
        language: anime.title.english ? "Sub | Dub" : "Subtitled",
        score: `${scoreOutOf10(anime.averageScore)} ★`,
        episodes: anime.episodes,
        description: anime.description,
        coverImage: anime.coverImage.extraLarge,
        bannerImage: anime.bannerImage,
        genres: anime.genres,
        type: anime.type,
        status: anime.status,
        duration: `${anime.duration} minutes`,
        season: anime.season,
        startDate: getDate(anime.startDate),
        endDate: getDate(anime.endDate),
      }
    };
  } catch (error) {
    console.error(`❌ ${title}: ${error.message}`);
    return null;
  }
}

const finalData = [];

for (const anime of aniOneAsiaData) {
  console.log("Now Fetching : ", anime.cleanTitle);
  const title = getCleanTitle(anime.cleanTitle) || anime.cleanTitle;
  const result = await fetcho(title);

  if (!result) {
    delay(2100);
    continue;
  }

  const data = result.data;

  const mergedVideos = anime.videos.map((v) => {
    const matchingEpisode = result.streamingEpisodes?.filter(ep => 
      ep.title.includes(` ${v.episodeNumber} `) ||
      ep.title.includes(`Episode ${v.episodeNumber} `) ||
      ep.title.includes(`Episode${v.episodeNumber} `) ||
      ep.title.includes(`Ep${v.episodeNumber} `)
    );

    return {
      ...v,
      episodeDetails: matchingEpisode || []
    };
  });

  finalData.push({
    id: anime.id,
    title: anime.title,
    videoCount: anime.videoCount,
    cleanTitle: anime.cleanTitle,
    language: anime.language,
    anilist: data,
    videos: mergedVideos
  });

  await delay(2200);
}


const output = `export const aniOneAsiaDataAnilist3 = ${JSON.stringify(finalData, null, 2)};\n`;
fs.writeFileSync("aniOneAsiaDataAnilist3.mjs", output);
console.log("✅ All done.");