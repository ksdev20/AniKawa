export interface Anime {
    plId:            string;
    plThumbnail?:    string;
    id:              number;
    season:          number;
    nanoid:          string;
    slug:            string;
    title:           string;
    score:           number;
    ratedBy:         number;
    startDate:       Date;
    poster:          string;
    backdrop:        null | string;
    description:     string;
    tagline:         string;
    popularity:      number;
    episodes:        Episode[];
    seasons:         number;
    runtime:         string;
    endDate:         Date;
    genres:          string[];
    status:          string;
    keywords:        string;
    extra_backdrops: string[];
    logos_en:        string[];
    logos_hi:        string[];
    season_poster:   null | string;
}

export interface Episode {
    url:          string;
    ytThumbnail:  string;
    audio:        string;
    nanoid:       string;
    slug:         string;
    air_date:     Date;
    epNum:        number;
    title:        string;
    description:  string;
    img:          null | string;
    vote_average: number;
    vote_count:   number;
}