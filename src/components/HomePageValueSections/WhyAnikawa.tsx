const features = [
  {
    icon: "🎬",
    title: "HD Streaming",
    description:
      "Enjoy crystal-clear anime episodes in high quality.",
  },
  {
    icon: "⚡",
    title: "Fast Updates",
    description:
      "New episodes are added quickly after release.",
  },
  {
    icon: "🌏",
    title: "Sub & Dub",
    description:
      "Watch anime your way with multiple language options.",
  },
  {
    icon: "💜",
    title: "Curated Picks",
    description:
      "Discover trending, popular, and hidden-gem anime.",
  },
  {
    icon: "🚀",
    title: "No Signup",
    description:
      "Start exploring anime instantly without creating an account.",
  },
];

export default function WhyAniKawa() {
  return (
    <section className="relative overflow-hidden px-20 py-16 md:py-24">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-[#8c52ff]/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#8c52ff]/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#8c52ff]/30 bg-[#8c52ff]/10 px-4 py-2 text-sm font-medium text-[#8c52ff]">
            ✨ Trusted by Anime Fans
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Why Anime Fans Choose{" "}
            <span className="text-[#8c52ff]">AniKawa</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-300 sm:text-lg">
            Built for anime lovers who want a smoother, faster, and more
            enjoyable streaming experience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur transition-all duration-300 hover:border-[#8c52ff]/50 hover:bg-[#8c52ff]/10 hover:-translate-y-1"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>

              <h3 className="font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* SEO Content */}
        <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-10">
          <p className="text-base leading-8 text-gray-300">
            AniKawa is built for anime fans who want a simple and enjoyable way
            to discover new series, explore popular titles, and keep up with the
            latest episode releases. Whether you're looking for action-packed
            shounen, emotional slice-of-life stories, fantasy adventures, or
            classic anime favorites, AniKawa helps you find something worth
            watching without endless searching.
          </p>

          <p className="mt-5 text-base leading-8 text-gray-300">
            Our platform focuses on fast updates, organized anime collections,
            curated recommendations, and a clean viewing experience designed for
            mobile, tablet, and desktop users alike. From seasonal releases to
            timeless masterpieces, AniKawa makes it easier to stay connected
            with the anime community and discover your next favorite series.
            Whether you're a long-time otaku or just beginning your anime
            journey, AniKawa provides a convenient destination to explore anime
            content anytime, anywhere.
          </p>
        </div>
      </div>
    </section>
  );
}