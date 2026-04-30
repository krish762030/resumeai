/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14121f",
        mist: "#eef2ff",
        poppy: "#f15b3e",
        brass: "#c79b41",
        pine: "#16423c",
        cloud: "#f7f4ee"
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"]
      },
      boxShadow: {
        panel: "0 22px 60px rgba(20, 18, 31, 0.12)"
      }
    }
  },
  plugins: []
};
