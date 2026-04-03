/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          800: "#1E2329",
          900: "#0B0E11",
        },
        primary: "#F0B90B",
        success: "#0ECB81",
        danger: "#F6465D",
      }
    },
  },
  plugins: [],
}
