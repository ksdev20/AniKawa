import fs from 'fs';

async function jikanFetch(){
    try{
        const response = await fetch("https://api.jikan.moe/v4/seasons/now?limit=18");
        if (!response.ok) throw new Error("Error fetching data");

        const data = await response.json();

        const animeList = data.data;

        const jikanPopularAnime = animeList.map(anime => ({
            title: anime.title_english || anime.title_romaji,
            language: anime.title_english ? "Sub | Dub" : "Eng Subs",
            image: anime.images?.jpg?.large_image_url,
            score: `${anime.score?.toFixed(1)} ★` || "N/A",
            episodes: anime.episodes || "N/A",
            description: anime.synopsis,
            genres: anime.genres.map(g => g.name)
        }));

        const exportedData = `export const jikanPopularAnime = ${JSON.stringify(jikanPopularAnime, null, 2)}`;

        fs.writeFileSync('jikanPopularAnime.mjs', exportedData);
        console.log("Success !")
    } catch (error){
        console.error(error.message);
    }
}

jikanFetch();