import fs from 'fs';
/*YOUTUBE_API_KEY*/
const CHANNEL_ID = "UC0wNSTMWIL3qaorLx0jie6A"
const MAX_RESULTS = 50;
const MIN_DURATION_MINUTES = 10;


function parseTitleAndLanguage(rawTitle) {
    const matches = [...rawTitle.matchAll(/《(.*?)》/g)];

    // Find first match that includes English letters (a-z or A-Z)
    const englishTitleMatch = matches.find((m) => /[a-zA-Z]/.test(m[1]));

    const cleanTitle = englishTitleMatch ? englishTitleMatch[1].trim() : rawTitle;

    const lowerTitle = rawTitle.toLowerCase();
    const hasEngSub = lowerTitle.includes('eng sub');
    const hasJpDub = lowerTitle.includes('jp dub');
    const language = hasEngSub && hasJpDub ? 'subtitled' : 'Sub | Dub';

    return { cleanTitle, language };
}

function parseDuration(iso) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match?.[1] || "0", 10);
    const minutes = parseInt(match?.[2] || "0", 10);
    const seconds = parseInt(match?.[3] || "0", 10);
    return hours * 60 + minutes + seconds / 60;
}

async function fetchAllPlaylist(pageToken = "", collected = []) {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${CHANNEL_ID}&maxResults=${MAX_RESULTS}&pageToken=${pageToken}&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network Error");

        const data = await response.json();

        const filteredData = data.items.filter((pl) => {
            const title = pl?.snippet.title.toLowerCase();
            return (
                pl.snippet &&
                pl.contentDetails &&
                !title.includes("trailer") &&
                !title.includes("promo") &&
                !title.includes("shorts") &&
                pl.status?.privacyStatus !== "private"
            );
        });

        const playlistData = filteredData.map((pl) => {
            const { cleanTitle, language } = parseTitleAndLanguage(pl.snippet.title);
            return {
                id: pl.id,
                title: pl.snippet.title,
                videoCount: pl.contentDetails?.itemCount || 0,
                cleanTitle: cleanTitle,
                language: language
            }
        });


        const all = collected.concat(playlistData);

        if (data.nextPageToken) {
            return fetchAllPlaylist(data.nextPageToken, all);
        } else {
            return all;
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchPlaylistVideoIds(playlistID, pageToken = "", all = []) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistID}&maxResults=${MAX_RESULTS}&pageToken=${pageToken}&key=${API_KEY}`;

        const resposne = await fetch(url);
        if (!resposne.ok) throw new Error("Response Error");

        const data = await resposne.json();

        const videoIds = data.items.map((item) => item.contentDetails.videoId);
        all.push(...videoIds);

        if (data.nextPageToken) {
            return fetchPlaylistVideoIds(playlistID, data.nextPageToken, all);
        } else {
            return all;
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchVideoDetails(videoIds) {
    const batches = [];
    for (let i = 0; i < videoIds.length; i += 50) {
        batches.push(videoIds.slice(i, i + 50));
    }

    const details = [];
    for (const batch of batches) {
        const ids = batch.join(",");
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${ids}&key=${API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();

        for (const vid of json.items) {
            const durationMin = parseDuration(vid.contentDetails.duration);
            const isPublic = vid.status.privacyStatus == "public";
            const isEmbeddable = vid.status.embeddable != false;
            const title = vid.snippet?.title;
            const videoId = vid.id;

            if (isPublic && isEmbeddable && durationMin >= MIN_DURATION_MINUTES) {
                details.push({
                    title,
                    videoId,
                    duration: durationMin
                });
            }
        }
    }
    return details;
}

async function finalFetch() {
    try {
        console.log("Starting the process....🚀");

        const playlists = await fetchAllPlaylist();

        const finalData = [];

        for (const pl of playlists) {
            console.log(`Processing : ${pl.title}`);
            const videoIds = await fetchPlaylistVideoIds(pl.id);

            if (videoIds.length == 0) continue;

            const videoDetails = await fetchVideoDetails(videoIds);

            if (videoDetails.length == 0) continue;

            finalData.push({
                ...pl,
                videos: videoDetails.map((v, idx) => ({
                    episodeNumber: 1 + idx,
                    title: v.title,
                    url: `https://www.youtube.com/embed/${v.videoId}`
                }))
            });
        }

        const exportedData = `export const aniOneAsiaData = ${JSON.stringify(finalData, null, 2)};\n`;

        fs.writeFileSync('aniOneAsiaData.mjs', exportedData);
        console.log("Successful bhidu ✅");
    } catch (error) {
        console.error("Something broke :", error);
    }
}

/*finalFetch();*/