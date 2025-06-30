#!/bin/bash
set -e

echo "🔧 [Patch] Converting tailwind.config.js to ES module (tailwind.config.ts)..."

# Move and rewrite the Tailwind config
if [ -f tailwind.config.js ]; then
  mv tailwind.config.js tailwind.config.ts
fi

cat <<'EOF' > tailwind.config.ts
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
EOF

echo "✅ Tailwind config updated to TypeScript ES module format."

# Optional: Patch tsconfig.json to support config TS files
if [ -f tsconfig.json ]; then
  echo "🧠 Patching tsconfig.json to support config TS files..."
  npx tsconfig-add-paths
  echo "✅ tsconfig.json patch complete (if applicable)."
fi
