#!/bin/bash

set -e

# Always run from this script's directory (project root)
SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧹 Cleaning build cache and node_modules..."

# Remove build artifacts
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/

echo "✅ Cache cleared!"

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building application..."
npm run build

echo "✅ Build completed!"
