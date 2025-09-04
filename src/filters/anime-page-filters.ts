import animeArray from '../data/mergedList.json';
import stringSimilarity from 'string-similarity';

export function getOtherSeasons(title: string, toNotInclude: string) {
    const threshold = 0.5;
    const arr = animeArray.filter(obj => {
        const similarity = stringSimilarity.compareTwoStrings(obj.title, title);
        return similarity > threshold && obj.nanoid !== toNotInclude
    }).filter(Boolean);
    if (!arr || arr.length == 0) return null;
    return arr;
}