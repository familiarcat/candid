/* eslint-disable @typescript-eslint/no-require-imports */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'candid-gray-50': '#f9fafb',
        'secondary-100': '#e0e7ff',
        'secondary-800': '#303f9f',
        'candid-navy-800': '#1f2937',
        'candid-navy-900': '#101624',
      },

      colors: {
        'candid-gray-50': '#f9fafb',
        'candid-gray-100': '#f3f4f6',
        'candid-gray-200': '#e5e7eb',
        'candid-gray-300': '#d1d5db',
        'candid-gray-400': '#9ca3af',
        'candid-gray-500': '#6b7280',
        'candid-gray-600': '#4b5563',
        'candid-gray-700': '#374151',
        'candid-gray-800': '#1f2937',
        'candid-gray-900': '#111827',
        'candid-navy-600': '#374151',
        'candid-navy-800': '#1f2937',
        'candid-navy-900': '#101624',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },

      colors: {
        'candid-gray-50': '#f9fafb',
        'candid-navy-800': '#1f2937','"candid-navy-900"': '#101624',

        'lcars-black': '#000000',
        'lcars-white': '#ffffff',
      },
      fontFamily: {
        'lcars': ['"LCARS"', 'sans-serif'],
      },
      colors: {
        'candid-gray-50': '#f9fafb',
        'candid-navy-800': '#1f2937','"candid-navy-900"': '#101624',

        candid: {
          'gray-50': '#f9fafb',
          'gray-100': '#f3f4f6',
          'gray-200': '#e5e7eb',
          'gray-300': '#d1d5db',
          'gray-400': '#9ca3af',
          'gray-500': '#6b7280',
          'gray-600': '#4b5563',
          'gray-700': '#374151',
          'gray-800': '#1f2937',
          'gray-900': '#111827',
          'navy-800': '#1a2332',
          'navy-900': '#101624'
        },
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0'
        },
        secondary: {
          100: '#e0e7ff',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f'
        },
        accent: {
          100: '#ffe0b2',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00'
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
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
