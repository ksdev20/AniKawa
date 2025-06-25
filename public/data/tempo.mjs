/*import fs from 'fs';
import { museIndiaPlaylistDataWithCleanTitle3 } from './museIndiaPlaylistDataWithCleanTitle3.mjs';

FIND YOUTUBE_API_KEY
async function getVideos(playlistID){
  let nextPageToken = '';
  const allVideos = [];
  let episodeNumber = 1;

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok){
      console.error(`Failed to fetch playlist : ${playlistID}`, data.error);
      return {};
    }

    const videos = data.items.map((item, index) => ({
      [`episode${episodeNumber}`]: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }))

    nextPageToken = data.nextPageToken;
    episodeNumber++;
    return videos;
  } while (nextPageToken);
}

async function enrichWithVideos() {
  const enrichedData = [];

  for (const playlist of museIndiaPlaylistDataWithCleanTitle3){
    console.log("Fetching videos for :", playlist.title);

    const res = await getVideos(playlist.id);
    enrichedData.push({
      ...playlist,
      videos: res
    });
  }

  const exported = `export const museIndiaFinalData = ${JSON.stringify(enrichedData, null, 2)};\n`;
  fs.writeFileSync("museIndiaFinalData.mjs", exported);
  console.log("✅ Video links added and file saved!");
}

enrichWithVideos();*/

import fs from 'fs';
import { museIndiaPlaylistDataWithCleanTitle3 } from './museIndiaPlaylistDataWithCleanTitle3.mjs';


async function getVideos(playlistID) {
  let nextPageToken = '';
  const allVideos = [];

  /*YOUTUBE_API_KEY*/
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error(`Failed to fetch playlist: ${playlistID}`, data.error);
      return {};
    }

    const videos = data.items.map((item, index) => ({
      [`episode${allVideos.length + index + 1}`]: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));

    allVideos.push(...videos);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return Object.assign({}, ...allVideos);
}

async function updateAllWithVideos() {
  const updatedList = [];

  for (const anime of museIndiaPlaylistDataWithCleanTitle3) {
    console.log(`Fetching videos for: ${anime.title}`);
    const videos = await getVideos(anime.id);
    updatedList.push({ ...anime, videos });
  }

  const exportString = `export const museIndiaFinalData = ${JSON.stringify(updatedList, null, 2)};\n`;
  fs.writeFileSync('museIndiaFinalData.mjs', exportString);
  console.log("✅ All videos attached successfully!");
}

updateAllWithVideos();
