// tailwind.config.js
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './components/**/*.{astro,html,js,jsx,ts,tsx,css}',
  ],
  theme: {
    extend: {
      fontFamily : {
        winky: ['Winky Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}