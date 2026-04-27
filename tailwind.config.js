/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nm: {
          bg: '#181310',
          card: '#231C17',
          cardHi: '#2A2219',
          ink: '#F8EAD0',
          inkDim: '#C8A878',
          line: '#3B2E23',
          red: '#E84A2A',
          redDeep: '#B5311A',
          yellow: '#F4C13D',
          lime: '#B8D63D',
          cream: '#F8EAD0',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Bai Jamjuree"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Noto Serif Thai"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        thai: ['"Noto Sans Thai"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
