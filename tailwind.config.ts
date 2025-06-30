import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'lcars-black': '#000000',
        'lcars-peach': '#FFB870',
        'lcars-blue': '#2F9ED4',
        'lcars-orange': '#D67E2C',
        'lcars-lightgray': '#CCCCCC',
        'lcars-purple': '#9C27B0',
        'lcars-yellow': '#FFEB3B',
        'lcars-red': '#F44336',
        'lcars-bg': '#E5DADA',
        'lcars-panel': '#282C34',
        'lcars-accent': '#FAA916',
      },
      fontFamily: {
        lcars: ['"LCARS"', 'sans-serif'],
      },
      borderRadius: {
        'lg': '1rem',
        '2xl': '2rem',
        'lcars-br': '30px',
      },
    },
  },
  plugins: [],
}
export default config
