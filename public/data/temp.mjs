/*import fs from 'fs';
import { museIndiaPlaylistDataWithCleanTitle2 } from './museIndiaPlaylistDataWithCleanTitle2.mjs';

let isProcessing = false;

function getScoreOutOf10(rawScore) {
  return (rawScore / 10).toFixed(1) || "N/A";
}

async function searchAnime(title) {
  try {
    const query = `query($search: String){
      Media(search: $search, type: ANIME){
        id
        title{
          english
          romaji
          native
        }
        averageScore
        episodes
        description
        genres
        coverImage{
          extraLarge
        }
      }
    }`;
    console.log("Processing... :", title);

    const response = await fetch("https://graphql.anilist.co", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables: { search: title }
      })
    });
    if (!response.ok) throw new Error("Response Error");

    const data = await response.json();
    const animeDetails = data.data?.Media;
    if (!animeDetails) throw new Error("Data is empty");

    return {
      id: animeDetails.id,
      title: animeDetails.title.english || animeDetails.title.romaji || animeDetails.title.native,
      language: animeDetails.title.english ? "Sub | Dub" : "Eng Sub",
      image: animeDetails.coverImage.extraLarge,
      description: animeDetails.description,
      episodes: animeDetails.episodes,
      score: getScoreOutOf10(animeDetails.averageScore),
      genres: animeDetails.genres
    }
  } catch (error) {
    console.error(`Failed to Fetch : ${title} | Error : ${error.message}`);
  }
}

const final = [];
let index = 0;

async function finalFunction() {
  /* for (const playlist of museIndiaPlaylistDataWithCleanTitle2) {
      const result = await searchAnime(playlist.cleanTitle);
      final.push({
        ...playlist,
        anilist: result
      });
    }

  while (index < museIndiaPlaylistDataWithCleanTitle2.length) {
    const playlist = museIndiaPlaylistDataWithCleanTitle2[index];
    const title = playlist.cleanTitle;
    const result = await searchAnime(title);
    final.push({ ...playlist, anilist: result });

    index++;
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  const exportedData = `export const museIndiaPlaylistDataWithCleanTitle3 = ${JSON.stringify(final, null, 2)};\n`;

  fs.writeFileSync("museIndiaPlaylistDataWithCleanTitle3.mjs", exportedData);
  console.log("Success ! ✅");
}*/

/*finalFunction();*/

/*
(async () => {
  if (isProcessing) return;
  isProcessing = true;
  async function startProcess() {
    if (index >= museIndiaPlaylistDataWithCleanTitle2.length) {
      clearInterval(intervalID);

      const exportedData = `export const museIndiaPlaylistDataWithCleanTitle3 = ${JSON.stringify(final, null, 2)};\n`;

      fs.writeFileSync("museIndiaPlaylistDataWithCleanTitle3.mjs", exportedData);
      console.log("Success ! ✅");
      return;
    }
    const playlist = museIndiaPlaylistDataWithCleanTitle2[index]
    const title = playlist.cleanTitle;
    const res = await searchAnime(title);
    final.push({ ...playlist, anilist: res });
    index++;
    isProcessing = false;
  }

  const intervalID = setInterval(startProcess, 2500);
})();*/

/*const corrected = [
  "I Got a Cheat Skill in Another World and Became Unrivaled in The Real World, Too",
  "SPY×FAMILY",
  "Classroom Of the Elite Season 3",
  "Re:ZERO -Starting Life in Another World- Director's Cut",
  " One Punch Man",
  "Burn the Witch",
  "A Certain Scientific Accelerator",
  "School Babysitters",
  "Kuma Kuma Kuma Bear- PUNCH! Season 2",
  "I Got a Cheat Skill in Another World and Became Unrivaled in The Real World, Too",
  "Spy x Family Episode",
  "Campfire Cooking in Another World with My Absurd Skill",
  "My Next Life as a Villainess: All Routes Lead to Doom!",
  "My Next Life as a Villainess: All Routes Lead to Doom!",
  "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense Season 2",
  "Reborn to Master the Blade: From Hero-King to Extraordinary Squire",
  "In/Spectre Season 2",
  "Ningen Fushin: Adventurers Who Don't Believe in Humanity Will Save the World",
  "In/Spectre Season 1",
  "Teasing Master Takagi-San Season 3",
  "Sword Art Online",
  "PUI PUI MOLCAR DRIVING SCHOOL Season 2",
  " Muv-Luv Alternative Season 2",
  "Mob Psycho 100 Season 3",
  "JoJo's Bizarre Adventure Golden Wind",
  " JoJo's Bizarre Adventure Diamond is Unbreakable",
  "JoJo's Bizarre Adventure Stardust Crusaders",
  "JoJo's Bizarre Adventure Season 1",
  "The Ones Within",
];

const correctedFinal = [];
let i = 0;

async function aloo() {
  while (i < corrected.length) {
    const r = await searchAnime(corrected[i]);
    correctedFinal.push(r);

    i++;
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  const exportedData = `export const correctedData = ${JSON.stringify(correctedFinal, null, 2)};\n`;

  fs.writeFileSync("correctedData.mjs", exportedData);
  console.log("Success ! ✅");
}

aloo();*/
import fs from 'fs';

const query = `query{
  Page(perPage: 400){
    characters(sort: FAVOURITES){
      name{
        first
        full
        native
        alternative
        userPreferred
      }
      image{
        large
      }
    }
  }
}`;

function fetchCharacters() {
  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query: query })
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.data || !data.data.Page) throw new Error("Data not valid");
      const characters = data?.data?.Page?.characters;

      const finalData = characters.map(character => ({
        name: character.name,
        image: character.image.large
      }));

      if (!finalData || finalData.length == 0) throw new Error("Unable to map recieved data.");

      const exportedData = `export const characterAvatars3 = ${JSON.stringify(finalData, null, 2)};`;
      fs.writeFileSync('./data/characterAvatars3.mjs', exportedData);
      console.log("✅ Done !");
    })
    .catch(e => {
      console.error(e.message);
    });
}

fetchCharacters();