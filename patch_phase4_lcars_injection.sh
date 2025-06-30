#!/bin/bash
echo "🧬 Initiating Phase 4: Inject LCARS UI into Candid Connections..."

# Ensure working directory is the root of candid-connections
if [ ! -f "tailwind.config.ts" ] || [ ! -d "app" ]; then
  echo "❌ Error: Please run this script from the root of the candid-connections project."
  exit 1
fi

# Backup critical files
echo "📦 Backing up layout and styles..."
mkdir -p backup_phase4
cp app/layout.tsx backup_phase4/layout.tsx.bak
cp tailwind.config.ts backup_phase4/tailwind.config.ts.bak

# Inject LCARS layout and components
echo "🔧 Injecting LCARS layout and UI..."
mkdir -p app/components/lcars
cp -r lcars-observation-lounge-main/components/lcars/* app/components/lcars/

# Replace app/layout.tsx with LCARS shell layout
cp lcars-observation-lounge-main/app/layout.tsx app/layout.tsx

# Merge Tailwind theme tokens
echo "🎨 Merging Tailwind config with LCARS tokens..."
awk '/extend:/ {print; print "      colors: {\n        \"lcars-black\": \"#000000\",\n        \"lcars-peach\": \"#FFB870\",\n        \"lcars-blue\": \"#2F9ED4\",\n        \"lcars-orange\": \"#D67E2C\"\n      },"; next}1' tailwind.config.ts > temp_tailwind.ts && mv temp_tailwind.ts tailwind.config.ts

echo "✅ LCARS UI patch complete."
echo "📂 Please run 'npm run dev' or 'npm run build' to test integration."
