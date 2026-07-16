import { frontendUrl } from "@/global_assets/globalPaths";

export const metadata = {
  name: "AniKawa",
  // Homepage Title
  title: "AniKawa | Watch Anime & Join the World",
  description: "No annoying ads ever ! Watch anime free in HD — sub & dub episodes updated daily. AniKawa is ad‑light: banners only, no popunder ads. Post, comment, and connect with fans.",
  keywords: "anime girl, watch anime, anime watch, free anime, anime free, anime sama, anime world, manga, anime online",
  author: { name: "Anikawa Team", url: frontendUrl },
  metadataBase: frontendUrl,

  // Open Graph (Facebook, Discord, etc.)
  openGraph: {
    title: "AniKawa — Free Anime Streaming, No Popunders",
    description: "Stream anime online in HD. Subbed & dubbed episodes updated daily. AniKawa is ad‑light and community‑powered.",
    siteName: "AniKawa",
    images: [
      {
        url: frontendUrl + "/anikawa-og-img-pc.webp",
        width: 1200,
        height: 630,
        alt: "AniKawa - Watch Anime Free in HD",
      },
    ],
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AniKawa | Anime Hub & Community",
    description: "Stream anime in HD — subbed & dubbed episodes, no popunder ads. Connect with fans worldwide.",
    creator: "@AnikawaTeam",
    images: [frontendUrl + "/anikawa-og-img-pc.webp"],
  },

  // JSON-LD Schema
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AniKawa",
    "url": frontendUrl,
    "image": frontendUrl + "/anikawa-og-img-pc.png",
    "description": "AniKawa is the fastest, cleanest way to stream anime online — banners only, no popunder ads. Plus, join communities, post, comment, and connect with friends.",
    "alternateName": "Anikawa Anime hub",
    "publisher": {
      "name": "AniKawa",
      "url": frontendUrl
    }
  }
}
