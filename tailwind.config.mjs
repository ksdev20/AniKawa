// tailwind.config.js
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './components/**/*.{astro,html,js,jsx,ts,tsx,css}',
    './src/styles/**/*.{css}', 
  ],
  theme: {
    extend: {
      fontFamily : {
        winky: ['Winky Sans', 'sans-serif'],
      },
      colors: {
        primary: '#8c52ff',
        secondary: '#141519',
        sort: '#242424',
        gray:{
          DEFAULT: '#888',
        },
      },
      screens: {
        'xs': {'max': '600px'},
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}