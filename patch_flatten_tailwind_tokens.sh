#!/bin/bash
echo "🔧 Flattening Tailwind color tokens..."

TAILWIND_CONFIG="tailwind.config.ts"

if [[ ! -f "$TAILWIND_CONFIG" ]]; then
  echo "❌ Error: $TAILWIND_CONFIG not found in current directory."
  exit 1
fi

# Backup original
cp "$TAILWIND_CONFIG" "$TAILWIND_CONFIG.bak"

# Replace lcars-nested colors with flat candid tokens
# Note: This sed command assumes a relatively simple structure. Adjust manually if structure is complex.
sed -i '' '/colors:/,/fontFamily:/c\
      colors: {\
        "candid-gray-50": "#f9fafb",\
        "peach": "#FFB870",\
        "blue": "#4FC3F7",\
        "violet": "#AB47BC",\
        "yellow": "#FFF176",\
        "black": "#1A1A1A",\
        "white": "#F5F5F5"\
      },' "$TAILWIND_CONFIG"

echo "✅ Tailwind colors flattened. Backup saved to $TAILWIND_CONFIG.bak"
