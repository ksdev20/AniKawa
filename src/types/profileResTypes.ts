export interface Name{
    first: string | null,
    full: string | null,
    native: string | null,
    alternative: string[] | null,
    userPreferred: string | null
}

export interface Character{
    name: Name | null,
    image: string | null
}

export interface Banner{
    title: string,
    banner: string
}