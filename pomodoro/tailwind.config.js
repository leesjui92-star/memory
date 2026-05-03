/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Gowun Dodum"', 'sans-serif'], // Cute rounded korean font as default
      },
      colors: {
        focus: '#ff8a80', // soft coral red
        break: '#a7ffeb', // soft mint green
        darkBg: '#1e1e24',
        darkPanel: '#2b2b36'
      }
    },
  },
  plugins: [],
}
