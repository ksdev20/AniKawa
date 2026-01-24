import { frontendUrl } from "../global_assets/globalPaths"

export const metadata = {
    name: "Anikawa",
    title: "Watch Anime Online Free | HD Sub & Dub Streaming — AniKawa",
    description: 'Stream the latest anime episodes online for free in HD. Watch subbed & dubbed anime series legally on AniKawa — No ads, no limits.Anikawa is non-commercial "for fans, by fans"',
    keywords: "watch anime online, anime streaming, free anime, HD anime, subbed anime, dubbed anime, new anime episodes, online anime player",
    author: { name: 'Anikawa Team', url: frontendUrl },
    metadataBase: frontendUrl,
    openGraph: {
        title: 'AniKawa — HD Anime Streaming',
        description: 'Binge top anime series online in high definition — updated daily with the latest sub and dub episodes. No ads. 100% free.',
        siteName: 'Anikawa',
        images: [
            {
                url: frontendUrl + '/anikawa-og-img-pc.webp',
                width: 1200,
                height: 630,
                alt: 'AniKawa - Watch Anime Free in HD',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AniKawa',
        description: 'Stream anime in HD — powered by Anikawa',
        creator: '@AnikawaTeam',
        images: ['/anikawa-og-image-pc.webp'],
    },
    jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Anikawa",
        "url": frontendUrl,
        "image": frontendUrl + "/anikawa-og-img-pc.png",
        "description": "AniKawa is the fastest, cleanest way to stream anime online — no ads, no popups, no BS. Just subbed and dubbed episodes.",
        "alternateName": "Anikawa Anime hub",
        "publisher": {
            "name": "Anikawa",
            "url": frontendUrl
        }
    }
}