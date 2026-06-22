export type BcObject = {
    id: string,
    data: BlogData,
    body: string,
    filePath: string,
    digest: string,
    deferredRender: boolean,
    collection: string,
}

export type BlogData = {
    title: string,
    subTitle: string,
    author: string,
    date: string,
    img: string,
    imgLarge?: string;
    categoryList: string[],
    slug: string,
    readMinutes?: number,
    toc?: TOC[],
} 

type TOC = {
    text: string,
    link: string,
}