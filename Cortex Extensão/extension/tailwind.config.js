/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          light: '#37352F',
          dark: '#D4D4D4',
          bgLight: '#FFFFFF',
          bgDark: '#191919',
        }
      }
    },
  },
  plugins: [],
}
