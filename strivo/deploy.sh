#!/bin/bash
# Netlify Deployment Script - Static Export Version
echo "🚀 Starting Netlify deployment process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please update .env with your production values before deploying."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Static files generated in 'out' directory"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Push your code to Git repository"
    echo "2. Connect your repository to Netlify"
    echo "3. Set build settings in Netlify:"
    echo "   - Build command: npm install && npm run build"
    echo "   - Publish directory: out"
    echo "   - Node version: 18"
    echo ""
    echo "📖 See README-NETLIFY.md for detailed deployment instructions"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
