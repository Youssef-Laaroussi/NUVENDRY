/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F7F2',
        charcoal: '#1C2925',
        forest: '#205C49',
        sage: '#6D9B83',
        mint: '#E8F0E8',
        warmgray: '#E8E9E2',
        gold: '#D7AC58',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}

