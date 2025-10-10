import fs from 'fs';

const query = `{
    Page(perPage: 18) {
        media(type: ANIME,
        sort: POPULARITY_DESC,
        tag_in: ["Isekai"]){
      title{
                english
                romaji
            }
      coverImage{
                extraLarge
            }
            averageScore
            episodes
            genres
      stats{
        scoreDistribution{
                    score
                    amount
                }
            }
            description
      relations{
        edges{
                    relationType
          node{
            title{
                            romaji
                            english
                        }
            episodes
                    }
                }
            }
        }
    }
}`;

function scoreOutOf10(score) {
    return (score / 10).toFixed(1);
}

async function fetchAnimeData() {
    try {
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) throw new Error("Error: Network Error");

        const data = await response.json();

        const animeList = data.data.Page.media;

        const animeData = animeList.map(anime => ({
            title: anime.title.english || anime.title.romaji,
            language: anime.title.english ? "Sub | Dub" : "Subtitled",
            score: scoreOutOf10(anime.averageScore),
            episodes: anime.episodes,
            description: anime.description,
            image: anime.coverImage.extraLarge,
            genres: anime.genres
        }));

        if (animeData.length == 0) console.log("Error hai bhai");

        const exportContent = `export const isekaiAnimeData = ${JSON.stringify(animeData, null, 2)};`;

        fs.writeFileSync('isekaiAnimeData.mjs', exportContent);
        console.log("✅ heroData.js generated successfully.");
    } catch (error) {
        console.error(error);
    }
}

fetchAnimeData();

