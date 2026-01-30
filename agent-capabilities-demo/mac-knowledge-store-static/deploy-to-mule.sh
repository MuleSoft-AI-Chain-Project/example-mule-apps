#!/bin/bash

# Deploy Static Site to MuleSoft Application
# This script builds the static site and copies it to the MuleSoft webapp directory

set -e  # Exit on error

MULE_PROJECT="/Users/jreizevoort/AnypointStudio/723/advanced-agent-v1/advanced-agent-1.1.5-mule-application"
WEBAPP_DIR="$MULE_PROJECT/src/main/resources/webapp"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building static site..."
npm run build

echo "🗑️  Cleaning old webapp directory..."
rm -rf "$WEBAPP_DIR"
mkdir -p "$WEBAPP_DIR"

echo "📦 Copying built files to MuleSoft webapp..."
cp -r dist/* "$WEBAPP_DIR/"

echo "✅ Deployment complete!"
echo ""
echo "📍 Files copied to: $WEBAPP_DIR"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart your MuleSoft application in Anypoint Studio"
echo "   2. Access your app at: http://localhost:8081/web/"
echo ""

