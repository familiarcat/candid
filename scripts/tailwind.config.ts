import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'candid-gray-50': '#f9fafb',
        'candid-primary': '#4f46e5',
        'candid-accent': '#ec4899',
      },
    },
  },
  plugins: [],
}

export default config
