/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e2a3a',
          900: '#152233',
          950: '#0e1828',
        }
      }
    },
  },
  plugins: [],
}
