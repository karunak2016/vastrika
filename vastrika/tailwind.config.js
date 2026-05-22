/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d8',
          300: '#f5a8b8',
          400: '#ee6f8a',
          500: '#e24060',
          600: '#cf2247',
          700: '#ad1638',
          800: '#8b1538',
          900: '#7a1535',
          950: '#440718',
        },
        gold: {
          300: '#e8cb6a',
          400: '#ddb945',
          500: '#d4af37',
          600: '#b8961e',
          700: '#9a7a18',
        },
        cream: {
          50:  '#fdfaf5',
          100: '#faf3e8',
          200: '#f5e6d0',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
