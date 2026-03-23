/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      colors: {
        glow: "#4fd1c5"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.16)"
      }
    }
  },
  plugins: []
};
