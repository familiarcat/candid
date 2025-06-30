#!/bin/bash

echo "🛠 Applying Tailwind Content Path Patch and Demo Component Injection..."

TAILWIND_CONFIG="./tailwind.config.ts"
DEMO_COMPONENT="./app/page.tsx"

# Step 1: Update tailwind.config.ts content array
if [[ -f "$TAILWIND_CONFIG" ]]; then
  echo "✅ Found tailwind.config.ts"
  # Replace content line with corrected globs
  sed -i.bak 's|content: .*|content: [\n    './app/**/*.{js,ts,jsx,tsx}',\n    './components/**/*.{js,ts,jsx,tsx}',\n    './styles/**/*.{css,scss}'\n  ],|' "$TAILWIND_CONFIG"
  echo "🔁 Updated content globs in tailwind.config.ts"
else
  echo "❌ tailwind.config.ts not found"
  exit 1
fi

# Step 2: Inject demo component using custom Tailwind tokens
mkdir -p "$(dirname "$DEMO_COMPONENT")"
cat <<EOF > "$DEMO_COMPONENT"
export default function Home() {
  return (
    <main className="bg-candid-gray-50 text-candid-navy-800 min-h-screen p-8">
      <h1 className="text-3xl font-bold">Welcome to Candid Connections</h1>
      <p className="text-candid-navy-600">Your dashboard is styled and ready.</p>
    </main>
  );
}
EOF

echo "✅ Injected demo component into $DEMO_COMPONENT"
echo "🎉 Patch complete. Run 'npm run build' to verify Tailwind now detects your styles."
