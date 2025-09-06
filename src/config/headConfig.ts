type str = string | null | undefined;

export function getCatHead(mainCategory: str) {
    const pageTitle = `${mainCategory} Anime`;
    const pageDescription = `Explore the best ${mainCategory} anime handpicked for fans. Discover trending series, hidden gems, and timeless classics across genres.`;
    const keywords = `${mainCategory} anime, ${mainCategory} anime list, ${mainCategory} anime recommendations, watch ${mainCategory} anime online, Anikawa`;
    const pageUrl = `https://anikawa.vercel.app/category/${mainCategory}`;
    const backdrop = `https://anikawa.vercel.app/anikawa-category-og-img-pc.png`;

    return { pageTitle, pageDescription, keywords, pageUrl, backdrop };
}

export function getSubCatHead(mainCategory: str, subCategory: str) {
    const pageTitle = `${mainCategory} / ${subCategory} Anime`;
    const pageDescription = `Browse the ultimate list of ${mainCategory} + ${subCategory} anime. From cult classics to new releases, Anikawa brings you a fan-curated experience with no ads.`;
    const keywords = `${mainCategory} ${subCategory} anime, ${mainCategory} anime, ${subCategory} anime, watch ${mainCategory} ${subCategory} anime online, Anikawa`;
    const pageUrl = `https://anikawa.vercel.app/category/${mainCategory}/${subCategory}`;
    const backdrop = `https://anikawa.vercel.app/anikawa-sub-category-og-img-pc.png`;

    return { pageTitle, pageDescription, keywords, pageUrl, backdrop };
}