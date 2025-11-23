/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uni-blue': '#004a8f',   // Azul oscuro tipo UANL
        'uni-gold': '#fbb034',   // Amarillo/Dorado botón
        'uni-gold-dark': '#e69b00', // Hover del botón
        'gray-bg': '#f3f4f6'     // Fondo gris suave
      }
    },
  },
  plugins: [],
}