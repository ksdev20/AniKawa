import{ getAnimeById, getEpisodebySlug }from './getAnimeById';

export function getWatchlistItems(titleList){
    const finalArray = [];

    titleList.forEach(id => {
        const anime = getAnimeById(id);
        if (!anime) return;
        finalArray.push(anime);
    });

    return finalArray;
}

export function getHistoryItems(dbList){
    const finalArray = [];

    dbList.forEach(obj => {
        const episode = getEpisodebySlug(obj.animeId, obj.slug);
        if (!episode) return;
        finalArray.push(episode);
    });

    return finalArray;
}