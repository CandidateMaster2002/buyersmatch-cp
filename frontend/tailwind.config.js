/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#2D3A2E",
        sage: "#52B788",
        gold: "#D4A843",
      },
    },
  },
  plugins: [],
}
