/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        "neu-lg": "18px 18px 36px #dee1e5, -18px -18px 36px #ffffff",
        "neu-sm": "5px 5px 5px #e3e6ea, -5px -5px 5px #ffffff",
        "neu-pressed-sm": "inset 5px 5px 5px #e7ebef, inset -5px -5px 5px #fbffff",
      },
    },
  },
  plugins: [],
}
