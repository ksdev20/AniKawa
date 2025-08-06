import aniOneAsia from '../data/mergedList.json';
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";

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
        const dateA = dayjs(a?.startDate || '2000/1/1');
        const dateB = dayjs(b?.startDate || '2000/1/1');
        return dateB - dateA;
    });
}

function sortByScore(arr) {
    arr.sort((a, b) => {
        const scoreA = parseFloat(a?.score) || 0;
        const scoreB = parseFloat(b?.score) || 0;
        return scoreB - scoreA;
    });
}

export function getFilteredAnime(filterName, options = {}) {
    const { genresA = [], categoryA = '', categoryB = '', forSubCatPage = false, usedTitlesGlobal } = options;

    const fnRaw = filters[filterName];
    const { fn, mode } = typeof fnRaw == 'function' ? { fn: fnRaw, mode: 'single' } : fnRaw;

    const result = [];
    const usedTitles = [];
    const diffGenre = ['New', 'Popular'];

    for (const anime of aniOneAsia) {
        const title = anime?.title || anime?.id;
        if (usedTitles.length >= 25 && !forSubCatPage) break;
        if (usedTitles.includes(title) || !anime) continue;
        if (usedTitlesGlobal && usedTitlesGlobal.length > 0 && usedTitlesGlobal.filter(i => i == title).length > 2) continue;

        const genresB = anime?.genres || [];
        let toSend = false;

        if (mode == 'genreCompare') {
            const arrA = genresA.length > 0 ? genresA : [categoryA, categoryB];
            if (diffGenre.includes(categoryB)) { 
                const score = anime?.score ?? 0;
                const startYear = getYear(anime) ?? '2000';
                toSend = NewPopChecker({ score, startYear, categoryB, categoryA, genresB });
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
        const title = anime?.title || anime?.cleanTitle || anime?.title || anime?.id;
        if (usedTitles.length >= 20) break;
        if (usedTitles.includes(title) || !anime) continue;

        const genresB =  anime?.genres;

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
            const scoreA = parseFloat(a?.score) || 5;
            const scoreB = parseFloat(b?.score) || 4;
            return scoreB - scoreA;
        });
    }
}
*/

/*for category page*/

export function NewPopChecker(options = {}) {
    const { genresB, categoryA, categoryB, score, startYear } = options;
    if (categoryB == 'Popular') {
        return (score >= 7 && genresB.includes(categoryA));
    } else {
        return (parseInt(startYear) >= 2025 && genresB.includes(categoryA));
    }
}

export function thisYearTopByCategory(category, usedTitlesAC2) {
    return aniOneAsia.find(anime => {
        const title = anime?.title
        const score = anime?.score;
        const startYear = getYear(anime);
        if (usedTitlesAC2.includes(title) || !score || !startYear) return false;
        
        const cn = startYear >= getCurrentDate()?.[0] - 1 && genreCheck(anime, category) && score >= 7;
        if (cn) usedTitlesAC2.push(title);

        return (
            cn
        );
    });
}

function sameMonthAnimeGen(anime) {
    const currentDate = getCurrentDate();
    const startDate = anime?.startDate.split('-');
    return ((currentDate[0] >= startDate[0]) && (currentDate[1] <= startDate[1]))
}

function beginnerAnime(anime) {
    const startDate = getYear(anime);
    return (startDate < getCurrentDate()?.[0] - 3 && startDate > getCurrentDate()?.[0] - 10 && anime?.score >= 7)
}

function isPopular(anime) {
    return (anime?.score >= 8);
}

function actionPopular(anime) {
    const isAction = genreCheck(anime, "Action");
    return (isAction && anime?.score >= 8);
}

function adventurePopular(anime) {
    const isAdventure = genreCheck(anime, "Adventure");
    return (isAdventure && anime?.score >= 7);
}

function romancePopular(anime){
    const isRomance = genreCheck(anime, "Romance");
    return (isRomance && anime?.score >=7);
}

function topRatedLast5(anime) {
    const startDate = getYear(anime);
    return (startDate < getCurrentDate()[0] - 3 && startDate >= getCurrentDate()[0] - 10 && anime?.score >= 7.5);
}

function getScore(anime) {
    return parseFloat(anime?.score);
}

function getYear(anime) {
    return anime?.startDate.split('-')[0];
}

function genreCheck(anime, genre) {
    return anime?.genres.includes(genre);
}

function getCurrentDate() {
    const now = new Date();
    const date = String(now.getDate());
    const month = String(now.getMonth());
    const year = String(now.getFullYear());

    const formattedData = [year, month, date];
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