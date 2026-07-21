#!/bin/bash

# Force a completely fresh build and deploy

set -e
cd "$(dirname "$0")"

echo "🧹 Cleaning build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite

echo "🔨 Building fresh..."
npm run build

echo "📦 Checking build output..."
ls -lh dist/assets/

echo "🚀 Deploying to MuleSoft..."
cp -rf dist/* /Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/advanced-agent-1.1.4-mule-application/src/main/resources/webapp/

echo "✅ Complete! Files in webapp:"
ls -lh /Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/advanced-agent-1.1.4-mule-application/src/main/resources/webapp/assets/

echo ""
echo "🔄 Now restart MuleSoft and hard refresh your browser (Cmd+Shift+R)"

