#!/bin/bash
set -e
echo "🔧 Syncing Tailwind config, global styles, and import paths..."

# Ensure script is run from project root
if [ ! -f "tailwind.config.ts" ]; then
  echo "❌ Error: tailwind.config.ts not found at project root."
  exit 1
fi

# 1. Ensure correct tsconfig.json paths
echo "🔁 Updating tsconfig.json paths..."
npx json -I -f tsconfig.json -e 'this.compilerOptions.paths = {
  "@/*": ["./app/*"],
  "@components/*": ["./components/*"]
}'

# 2. Move all globals.css-related styles into Tailwind-aware layers
echo "🎨 Validating globals.css..."
GLOBAL_CSS="./styles/globals.css"
if ! grep -q "@tailwind base;" "$GLOBAL_CSS"; then
  echo "⚠️ Warning: @tailwind base not found in $GLOBAL_CSS"
fi

# 3. Force rebuild Tailwind JIT cache
echo "🧹 Clearing Tailwind JIT cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Patch complete. Run 'npm run dev' or 'npm run build' to verify."
