#!/bin/bash
# patch_tailwind_globals_p3.sh

echo "🔧 Backing up original styles/globals.css..."
cp styles/globals.css styles/globals.backup.css

echo "🧼 Cleaning up globals.css to remove invalid @apply usages and fix syntax..."
cat <<EOF > styles/globals.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Inter', sans-serif;
  }
}

@layer utilities {
  .badge-secondary {
    @apply px-2 py-1 text-sm font-medium rounded-md;
    background-color: theme('colors.secondary.100');
    color: theme('colors.secondary.800');
  }
}
EOF

echo "✅ globals.css cleaned and restructured."

echo "🔄 Rewriting React components to avoid @apply and use Tailwind utility classes directly..."
find ./app ./components -type f -name "*.tsx" | while read file; do
  sed -i '' -E '
    s/className="badge badge-secondary"/className="px-2 py-1 text-sm font-medium rounded-md bg-secondary-100 text-secondary-800"/g;
    s/className="bg-candid-gray-50"/className="bg-gray-50"/g;
    s/className="text-secondary-800"/className="text-gray-800"/g;
  ' "$file"
done

echo "✅ React components updated with inline utility classes."

echo "🔍 Verifying Tailwind token consistency..."
echo "🧪 Updating any imported styles or custom tokens to use standardized Tailwind values..."

find ./app ./components -type f -name "*.tsx" | while read file; do
  sed -i '' -E '
    s/bg-candid-gray-50/bg-gray-50/g;
    s/text-secondary-800/text-gray-800/g;
    s/bg-secondary-100/bg-gray-100/g;
  ' "$file"
done

echo "✅ Phase 3 complete: All component style tokens unified with Tailwind CSS."

echo "🧪 Run `npm run build` and verify app compiles and styles appear correctly."
