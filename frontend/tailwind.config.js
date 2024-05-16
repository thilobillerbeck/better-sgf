/** @type {import('tailwindcss').Config} */
import colors, { transparent } from 'tailwindcss/colors'

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      "yellow": {
        DEFAULT: "#FFCC00",
        50: "#FFFAE5",
        100: "#FFF5CC",
        200: "#FFEB99",
        300: "#FFE066",
        400: "#FFD633",
        500: "#FFCC00",
        600: "#CCA300",
        700: "#997A00",
        800: "#665200",
        900: "#332900",
        950: "#191400"
      },
      gray: colors.neutral,
      white: colors.white,
      black: colors.black,
      transparent: transparent,
    },
  },
  plugins: [],
}

