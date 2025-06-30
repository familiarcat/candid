#!/bin/bash
set -e

echo "🖖 Launching LCARS Observation Lounge..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
  echo "⚠️  .env.local not found. Copying from .env.example..."
  cp .env.example .env.local
fi

# Launch dev server
echo "🚀 Starting development server..."
npm run dev
