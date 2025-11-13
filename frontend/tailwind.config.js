/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        quicksand: ["Quicksand_400Regular"],
        quicksandMedium: ["Quicksand_500Medium"],
        quicksandSemibold: ["Quicksand_600SemiBold"],
        quicksandBold: ["Quicksand_700Bold"],
      },
    },
  },
  plugins: [],
};
