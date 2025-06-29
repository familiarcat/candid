#!/bin/bash
set -e

PATCH_DIR="./candid_booster_patch"
echo "🚀 Applying Booster Patch from $PATCH_DIR..."

# 1. Replace DashboardCards.js with DashboardCards.tsx
if [ -f "./components/DashboardCards.js" ]; then
  echo "🧼 Removing old DashboardCards.js..."
  rm ./components/DashboardCards.js
fi
echo "📦 Installing DashboardCards.tsx..."
cp "$PATCH_DIR/components__DashboardCards.tsx" ./components/DashboardCards.tsx

# 2. Create services folder and copy graphService
mkdir -p ./services
echo "📡 Adding graphService.ts..."
cp "$PATCH_DIR/services__graphService.ts" ./services/graphService.ts

# 3. Add environment files
echo "🔐 Adding .env files..."
cp "$PATCH_DIR/.env.example" ./.env.example
cp "$PATCH_DIR/.env.local" ./.env.local

# 4. Overwrite tailwind.config.js
echo "🎨 Updating Tailwind config..."
cp "$PATCH_DIR/tailwind.config.js" ./tailwind.config.js

# 5. Add linting/formatting configs
echo "🧹 Installing ESLint and Prettier configs..."
cp "$PATCH_DIR/.eslintrc.js" ./.eslintrc.js
cp "$PATCH_DIR/.eslintignore" ./.eslintignore
cp "$PATCH_DIR/.prettierrc" ./.prettierrc
cp "$PATCH_DIR/.prettierignore" ./.prettierignore

echo "✅ Booster Patch Applied Successfully!"
echo "Next: Run 'npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react'"
