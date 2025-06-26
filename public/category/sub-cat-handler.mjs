import { createAndAppendAnimeCard, fetchWatchlist } from "../majorJs/anime-card.mjs";
import { createAnimeCardNewPop } from "../cardTemplates/createAnimeCardNewPop.mjs";

function main() {
    const selectedCategoryJson = JSON.parse(localStorage.getItem('view-all-category'));
    const mainCat = selectedCategoryJson?.mainCategory;
    const subCat = selectedCategoryJson?.category;
    document.getElementById("main-cat-name").innerHTML = mainCat;
    document.getElementById("sub-cat-name").innerHTML = subCat;
    document.getElementById("sub-cat-page-title").innerHTML = `${subCat} ${mainCat} Anime`;

    const subCatData = JSON.parse(localStorage.getItem(`${subCat}Data`));
    const SubCatAnimeList = document.getElementById("sub-cat-anime-list");

    if (!subCatData == {}) return;
    subCatData.finalData.forEach(anime => {
        createAndAppendAnimeCard(anime, SubCatAnimeList, createAnimeCardNewPop);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWatchlist(true).then(() => {
        document.querySelector(".new-pop-anime-list.skeletons").classList.add("hidden");
        main();
    });
});