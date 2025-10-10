import fs from 'fs';
import { aniOneAsiaDataAnilist } from "./data/aniOneAsiaDataAnilist.mjs";
import { aniOneAsiaData } from './data/aniOneAsiaData.mjs';

function getCleanTitle(title) {
    if (title.includes('|')) {
        return title.split('|')[1].trim();
    }

    return title.replace(/[^\x00-\x7F]/g, ' ').trim();
}

async function main() {
    for (const anime of aniOneAsiaData) {
        await delay(3000);
        const cleanTitle = anime?.cleanTitle ? getCleanTitle(anime.cleanTitle) : getCleanTitle(anime.title);

        if (cleanTitle) {
            anime.cleanTitle = cleanTitle;
            const result = await fetcho(cleanTitle);

            if (!result?.data && !result?.streamingEpisodes) continue;

            anime.anilist = result.data;

            if (!anime?.videos) continue;
            let idx = 0;

            for (const episode of anime.videos) {
                if (idx >= result.streamingEpisodes.length) {
                    break;
                }

                episode.episodeDetails = result.streamingEpisodes[idx];
                idx++;
            }
        }
    }

    const exportedData = `export const aniOneData2 = ${JSON.stringify(aniOneAsiaData, null, 2)}`;
    fs.writeFileSync("./data/aniOneAsiaData2.mjs", exportedData);
    console.log("✅Suksejful✅");
}

function scoreOutOf10(score) {
    return score ? (score / 10).toFixed(1) : "N/A";
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