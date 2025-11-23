/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uni-primary': '#1e40af', 
        'uni-secondary': '#db2777', 
      }
    },
  },
  plugins: [],
}