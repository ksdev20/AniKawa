import aniOneAsia from '../data/aniOneData2.json';
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";

const format = 'D/M/YYYY';
dayjs.extend(customParseFormat);

const filters = {
    sameMonthAnimeGen,
    beginnerAnime,
    isPopular,
    actionPopular,
    adventurePopular,
    topRatedLast5,
    matchCategories: {
        fn: matchCategories,
        mode: 'genreCompare',
    },
    romancePopular
};

function sortByDate(arr) {
    arr.sort((a, b) => {
        const dateA = dayjs(a?.anilist?.startDate || '1/1/2000', format);
        const dateB = dayjs(b?.anilist?.startDate || '1/1/2000', format);
        return dateB - dateA;
    });
}

function sortByScore(arr) {
    arr.sort((a, b) => {
        const scoreA = parseFloat(a?.anilist?.score) || 0;
        const scoreB = parseFloat(b?.anilist?.score) || 0;
        return scoreB - scoreA;
    });
}

export function getFilteredAnime(filterName, options = {}) {
    const { genresA = [], categoryA = '', categoryB = '', forSubCatPage = false, usedTitlesGlobal } = options;

    const fnRaw = filters[filterName];
    const { fn, mode } = typeof fnRaw == 'function' ? { fn: fnRaw, mode: 'singe' } : fnRaw;

    const result = [];
    const usedTitles = [];
    const diffGenre = ['New', 'Popular'];

    for (const anime of aniOneAsia) {
        const title = anime?.anilist?.title || anime?.cleanTitle || anime?.title || anime?.id;
        if (usedTitles.length >= 25 && !forSubCatPage) break;
        if (usedTitles.includes(title) || !anime) continue;
        if (usedTitlesGlobal && usedTitlesGlobal.length > 0 && usedTitlesGlobal.filter(i => i == 'a').length > 2) continue;

        const genresB = anime?.anilist?.genres || [];
        let toSend = false;

        if (mode == 'genreCompare') {
            const arrA = genresA.length > 0 ? genresA : [categoryA, categoryB];
            if (diffGenre.includes(categoryB)) { 
                const score = getScore(anime) ?? 0;
                const startDate = getYear(anime) ?? '2000';
                toSend = NewPopChecker({ score, startDate, categoryB, categoryA, genresB });
            } else {
                toSend = fn(arrA, genresB);
            }
        } else {
            toSend = fn(anime);
        }

        if (toSend) {
            result.push(anime);
            usedTitles.push(title);
            if (usedTitlesGlobal) usedTitlesGlobal.push(title);
        }
    }
    const sortThese = ['sameMonthAnimeGen', 'matchCategories'];
    const skipSort = sortThese.includes(filterName);

    if (!skipSort){
        sortByScore(result);
    }

    if (skipSort && diffGenre.includes(categoryB)){
        categoryB == 'New' ? sortByDate(result) : sortByScore(result);
    }

    return result;
}

/*
export function getFilteredAnime(filterName, animePageCalling = false, genresA = [], categoryCalling = false, categoryA = '', categoryB = '') {
    const fn = filters[filterName];
    const result = [];
    const usedTitles = [];
    for (const anime of aniOneAsia) {
        const title = anime?.anilist?.title || anime?.cleanTitle || anime?.title || anime?.id;
        if (usedTitles.length >= 20) break;
        if (usedTitles.includes(title) || !anime) continue;

        const genresB =  anime?.anilist?.genres;

        if (animePageCalling) {
            if (fn(genresA, genresB)){
                result.push(anime);
                usedTitles.push(title);
            }
        } else if (categoryCalling){
            const categoriesToMatch = [ categoryA, categoryB];
            if (fn(categoriesToMatch, genresB)){
                result.push(anime);
                usedTitles.push(title);
            }
        }
        else{
            if (fn(anime)) {
                result.push(anime);
                usedTitles.push(title);
            }
        }
    }
    if (filterName == 'sameMonthAnimeGen' || filterName == 'matchCategories') {
        return result;
    } else {
        return result.sort((a, b) => {
            const scoreA = parseFloat(a?.anilist?.score) || 5;
            const scoreB = parseFloat(b?.anilist?.score) || 4;
            return scoreB - scoreA;
        });
    }
}
*/

/*for category page*/

export function NewPopChecker(options = {}) {
    const { genresB, categoryA, categoryB, score, startDate } = options;
    if (categoryB == 'Popular') {
        return (score >= 7 && genresB.includes(categoryA));
    } else {
        return (parseInt(startDate) >= 2025 && genresB.includes(categoryA));
    }
}

export function thisYearTopByCategory(category, usedTitlesAC2) {
    return aniOneAsia.find(anime => {
        const title = anime?.title;
        const score = anime?.score;
        if (usedTitlesAC2.includes(title)) return false;
        if (!score) return false;
        const startYear = getYear(anime);
        if (!startYear) return false;
        const cn = startYear >= getCurrentDate()?.[2] - 1 && genreCheck(anime, category) && score >= 7;
        if (cn) usedTitlesAC2.push(title);
        return (
            cn
        );
    });
}

function sameMonthAnimeGen(anime) {
    const currentDate = getCurrentDate();
    const startDate = anime?.anilist?.startDate.split('/');

    if ((currentDate[2] >= startDate[2]) && (currentDate[1] <= startDate[1])) {
        return true;
    }

    return false;
}

function beginnerAnime(anime) {
    const startDate = getYear(anime);
    const score = getScore(anime);

    if (startDate < getCurrentDate()?.[2] - 3 && startDate > getCurrentDate()?.[2] - 10 && score >= 7) {
        return true;
    } else {
        return false;
    }
}

function isPopular(anime) {
    const score = getScore(anime);
    if (score >= 8) {
        return true;
    } else {
        return false;
    }
}

function actionPopular(anime) {
    const score = getScore(anime);
    const isAction = genreCheck(anime, "Action");

    if (isAction && score >= 8) {
        return true;
    } else {
        return false;
    }
}

function adventurePopular(anime) {
    const score = getScore(anime);
    const isAdventure = genreCheck(anime, "Adventure");

    if (isAdventure && score >= 7) {
        return true;
    } else {
        return false;
    }
}

function romancePopular(anime){
    const score = getScore(anime);
    const isRomance = genreCheck(anime, "Romance");
    return (isRomance && score >=7);
}

function topRatedLast5(anime) {
    const score = getScore(anime);
    const startDate = getYear(anime);

    if (startDate < getCurrentDate()[2] - 3 && startDate >= getCurrentDate()[2] - 10 && score >= 7.5) {
        return true;
    } else {
        return false;
    }
}

function getScore(anime) {
    return parseFloat(anime?.anilist?.score);
}

function getYear(anime) {
    return anime?.anilist?.startDate.split('/')[2];
}

function genreCheck(anime, genre) {
    return anime?.anilist?.genres.includes(genre);
}

function getCurrentDate() {
    const now = new Date();
    const date = String(now.getDate());
    const month = String(now.getMonth());
    const year = String(now.getFullYear());

    const formattedData = [date, month, year];
    return formattedData;
}

/*for anime page*/

function matchCategories(genresA, genresB) {
    if (!genresB) return false;
    if (genresB.length <= 1) return false;

    let count = 0;
    return genresA.some(x => {
        if (genresB.includes(x)) count++;
        return count == 2;
    });
}