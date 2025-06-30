#!/bin/bash
set -e

echo "🚀 [Patch] Starting Tailwind token injection..."

TAILWIND_CONFIG="../tailwind.config.js"

if [ ! -f "$TAILWIND_CONFIG" ]; then
  echo "❌ Error: tailwind.config.js not found at project root."
  exit 1
fi

echo "📦 Ensuring custom color tokens exist in tailwind.config.js..."

# Inject custom color tokens if not already present
if ! grep -q "candid-gray-50" "$TAILWIND_CONFIG"; then
  awk '/extend: {/ {
    print "    colors: {";
    print "      candid: {";
    print "        gray: {";
    print "          50: "#f9fafb",";
    print "          100: "#f3f4f6",";
    print "        },";
    print "        primary: "#2E86AB",";
    print "      },";
    print "    },";
    next
  } 1' "$TAILWIND_CONFIG" > tmp.config.js && mv tmp.config.js "$TAILWIND_CONFIG"
  echo "✅ Injected candid color palette into Tailwind config."
else
  echo "ℹ️ Custom color tokens already defined."
fi

echo "🔍 Scanning for Tailwind class usage..."
grep -rE 'class(Name)?=.*(bg-|text-|flex|grid|p-|m-|rounded|shadow|hover:)' ./app ./components ./pages ./src 2>/dev/null || echo "⚠️ No Tailwind classes found in source files."

echo "✅ Patch complete. You may now re-run 'npm run build' or 'npm run dev'."
