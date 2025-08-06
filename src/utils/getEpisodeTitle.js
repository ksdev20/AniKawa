export default function getEpisodeTitle(title, epNum){
    return title ? `Ep ${epNum} - ${title}` : `Ep ${epNum}`;
}