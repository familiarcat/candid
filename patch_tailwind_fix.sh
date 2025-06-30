#!/bin/bash
echo "🛠️ Tailwind + globals.css Refactor Patch Initiated..."

# Step 1: Fix tsconfig.json - remove invalid comment and confirm paths
echo "🔧 Patching tsconfig.json..."
TS_CONFIG="tsconfig.json"
if [ -f "$TS_CONFIG" ]; then
  sed -i.bak '/@\/\*/s|//.*||' "$TS_CONFIG"
  jq '.compilerOptions.paths = { "@/*": ["app/*"] }' "$TS_CONFIG" > tmp_tsconfig.json && mv tmp_tsconfig.json "$TS_CONFIG"
else
  echo "❌ tsconfig.json not found"
fi

# Step 2: Fix tailwind.config.ts
echo "🔧 Updating tailwind.config.ts..."
TAILWIND_CONFIG="tailwind.config.ts"
if [ -f "$TAILWIND_CONFIG" ]; then
  sed -i.bak 's|content: .*|content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./styles/**/*.css"],|' "$TAILWIND_CONFIG"
  awk '/theme: \{/{print; print "    extend: {
      colors: {
        "candid-gray-50": "#f9fafb",
        "candid-navy-800": "#1f2937"
      }
    }"; next}1' "$TAILWIND_CONFIG" > tmp_tailwind.ts && mv tmp_tailwind.ts "$TAILWIND_CONFIG"
else
  echo "❌ tailwind.config.ts not found"
fi

# Step 3: Patch globals.css with proper @layer
echo "🎨 Updating globals.css..."
GLOBAL_CSS="./styles/globals.css"
if [ -f "$GLOBAL_CSS" ]; then
cat <<EOF >> "$GLOBAL_CSS"

@layer utilities {
  .bg-candid-gray-50 {
    background-color: #f9fafb;
  }
  .text-candid-navy-800 {
    color: #1f2937;
  }
}
EOF
else
  echo "❌ globals.css not found"
fi

echo "✅ Patch applied. You may now retry: npm run build"
