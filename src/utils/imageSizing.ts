export const getOptimizedImageUrl = (path: string | null, width: number): string => {
    if (!path) return "/anime-image-alt.png"; // guard clause
    if (width <= 185) return path.replace('original', 'w185');
    if (width <= 342) return path.replace('original', 'w342');
    if (width <= 500) return path.replace('original', 'w500');
    return path;
};