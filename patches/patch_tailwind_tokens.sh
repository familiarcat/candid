#!/bin/bash
set -e

echo "🚀 [Patch] Starting Tailwind stabilization patch..."

# Navigate to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
TAILWIND_CONFIG="$PROJECT_ROOT/tailwind.config.ts"
GLOBAL_CSS="$PROJECT_ROOT/styles/globals.css"

# 1. Inject color token into tailwind.config.ts if not present
echo "🔧 Patching tailwind.config.ts..."

if grep -q "candid-gray-50" "$TAILWIND_CONFIG"; then
  echo "✅ tailwind.config.ts already includes candid-gray-50"
else
  sed -i '' '/extend: {/a\
    colors: {\
      "candid-gray-50": "#f9fafb",\
    },
  ' "$TAILWIND_CONFIG"
  echo "✅ Injected candid-gray-50 token into tailwind.config.ts"
fi

# 2. Inject @layer block in globals.css for bg-candid-gray-50 if missing
echo "🔧 Patching styles/globals.css..."

if grep -q ".bg-candid-gray-50" "$GLOBAL_CSS"; then
  echo "✅ globals.css already includes .bg-candid-gray-50 class"
else
  cat <<EOF >> "$GLOBAL_CSS"

@layer utilities {
  .bg-candid-gray-50 {
    background-color: #f9fafb;
  }
}
EOF
  echo "✅ Appended .bg-candid-gray-50 class to globals.css"
fi

echo "✅ Patch complete. Run 'npm run build' to verify."
