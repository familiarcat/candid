/* eslint-disable @typescript-eslint/no-require-imports */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lcars: {
          'candid-gray-50': '#f9fafb',
          peach: '#FFB870',
          blue: '#4FC3F7',
          violet: '#AB47BC',
          yellow: '#FFF176',
          black: '#1A1A1A',
          white: '#F5F5F5'
        }
      },
      fontFamily: {
        sans: ['Helvetica Neue', ...defaultTheme.fontFamily.sans]
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem'
      },
      borderRadius: {
        xl: '1rem'
      },
      screens: {
        '3xl': '1600px'
      }
    }
  },
  plugins: []
};
