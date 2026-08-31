// tailwind.config.js
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    "./components/**/*.{astro,html,js,jsx,ts,tsx,css}",
    "./src/styles/**/*.{css}",
  ],

  theme: {
    extend: {
      fontFamily: {
        winky: ["Winky Sans", "sans-serif"],
      },

      colors: {
        /* ============================================================
           BRAND
           ============================================================ */

        primary: "#8c52ff",
        accent: "#b28cff",

        /* ============================================================
           PAGE BACKGROUNDS
           ============================================================ */

        secondary: "#141519",
        secondaryDeep: "#101116",
        secondarySoft: "#181a20",

        /* ============================================================
           SURFACES
           ============================================================ */

        surface: "#1a1c22",
        surfaceLight: "#242730",
        surfaceElevated: "#20232b",

        /* ============================================================
           UI
           ============================================================ */

        sort: "#242424",

        border: "#2b2d35",

        gray: {
          DEFAULT: "#888",
        },
      },

      screens: {
        xs: { max: "600px" },
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};
