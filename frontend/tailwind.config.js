/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1B2A4A",
        teal: "#2ABFBF",
        gold: "#D4A843",
      },
    },
  },
  plugins: [],
}
