#!/bin/bash

# Netlify Deployment Script
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

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Push your code to Git repository"
    echo "2. Connect your repository to Netlify"
    echo "3. Set environment variables in Netlify dashboard:"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL (your Netlify domain)"
    echo "   - JWT_SECRET"
    echo "   - DATABASE_URL (if using cloud database)"
    echo ""
    echo "📖 See README-NETLIFY.md for detailed deployment instructions"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
