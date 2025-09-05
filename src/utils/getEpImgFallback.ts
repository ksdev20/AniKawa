export function getEpImg(ep: any) {
    return ep.img ?? ep?.ytThumbnail ?? "/episode-thumbnail-alt-2.png";
}