#!/bin/bash

echo "🧼 Converting project to Next.js 15 App Router structure..."

# Step 1: Remove legacy pages directory
if [ -d "pages" ]; then
  echo "🔥 Removing /pages directory..."
  rm -rf pages
fi

# Step 2: Remove duplicate or outdated Tailwind config
if [ -f "tailwind.config.js" ]; then
  echo "🧽 Removing tailwind.config.js..."
  rm tailwind.config.js
fi

# Step 3: Remove duplicate LCARS or patched artifacts
rm -f scripts__launch.sh
rm -f components__lcars__LcarsShell.tsx

# Step 4: Move patched tailwind config to tailwind.config.ts if exists
if [ -f "patches/candid_booster_patch/tailwind.config.js" ]; then
  echo "📦 Moving patched Tailwind config..."
  mv patches/candid_booster_patch/tailwind.config.js tailwind.config.ts
fi

# Step 5: Optional cleanup of duplicated styles or scripts
echo "✅ Cleaning up completed. Project is now App Router compliant."

echo "🖖 Live long and compile."
