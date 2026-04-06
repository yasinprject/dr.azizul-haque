/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Hind Siliguri', 'sans-serif'] },
      colors: {
        primary: '#0369a1',
        secondary: '#0ea5e9',
        accent: '#059669',
      }
    },
  },
  plugins:[],
}
