/*import fs from 'fs';
import { museIndiaFinalData } from './museIndiaFinalData.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFolder = path.join(__dirname, 'genreBasedData');
const categories = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Music", "Romance", "Sci-Fi", "Seinen", "Shojo", "Shonen", "Slice Of Life", "Sports", "Supernatural", "Thriller"];
function saveForGenre(genre){
    const g = genre
    const saveTo = ''
    if (g == 'Action') saveTo = 'actionData.mjs';
    if (g == 'Adventure') saveTo = 'actionData.mjs';
    if (g == 'Comedy') saveTo = 'actionData.mjs';
    if (g == 'Drama') saveTo = 'actionData.mjs';
    if (g == 'Fantasy') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
    if (g == 'action') saveTo = 'actionData.mjs';
}
for (const anime of museIndiaFinalData) {
    categories.forEach(c => {
        const genres = anime.anilist?.genres?.includes(c);
        saveForGenre(genres);
    })
}
console.log(museIndiaFinalData[0].anilist?.genres?.includes(''));*/
import { museIndiaFinalData } from './museIndiaFinalData.mjs';
import fs from 'fs';

function actionFilter() {
    const actionList = [];
    for (const playlist of museIndiaFinalData) {
        if (i>=18){
            break;
        }
        const s = playlist.anilist?.score;
        const g = playlist.anilist?.genres;
        if (s >= 7 && g.includes("Action") && g.includes("Adventure")) {
            actionList.push({ ...playlist });
        }
    }

    const exportedData = `export const actionAbove8 = ${JSON.stringify(actionList, null, 2)}`;
    fs.writeFileSync("C:/Users/Ashu/VSCodeProjects/crunchyroll-clone/homepageData/action.mjs", exportedData);
    console.log("Success ✅");
}

/*actionFilter();*/

function topFilter() {
    const i = 0;
    const animeList = [];
    for (const playlist of museIndiaFinalData) {
        const score = playlist.anilist?.score;
        const genres = playlist.anilist?.genres;
        if (score > 8 || genres.includes("Action")) {
            animeList.push({ ...playlist });
        }
    }
}

function beginnerFilter() {
    const beginnerList = [];
    for (const playlist of museIndiaFinalData) {
        const score = playlist.anilist?.score;
        const genres = playlist.anilist?.genres;
        if (score > 8 || genres.includes("Action")) {
            beginnerList.push({ ...playlist });
        }
    }
}