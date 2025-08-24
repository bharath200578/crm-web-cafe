@echo off
echo 🚀 Starting Netlify deployment process...
REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found. Creating from example...
    copy env.example .env
    echo 📝 Please update .env with your production values before deploying.
)
REM Install dependencies
echo 📦 Installing dependencies...
npm install
REM Build the application
echo 🏗️  Building the application...
npm run build
REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo 📁 Static files generated in 'out' directory
    echo.
    echo 🎯 Next steps:
    echo 1. Push your code to Git repository
    echo 2. Connect your repository to Netlify
    echo 3. Set build settings in Netlify:
    echo    - Build command: npm install && npm run build
    echo    - Publish directory: out
    echo    - Node version: 18
    echo.
    echo 📖 See README-NETLIFY.md for detailed deployment instructions
) else (
    echo ❌ Build failed. Please check the error messages above.
    pause
    exit /b 1
)
pause
