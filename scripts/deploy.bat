@echo off
REM Byte Club Deployment Script for Windows
REM This script helps prepare the project for deployment

echo 🚀 Byte Club Deployment Preparation Script
echo ==========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: Frontend directory not found
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: Backend directory not found
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Check if .env files exist
echo.
echo 📋 Checking environment files...

if not exist "frontend\.env.production" (
    echo ⚠️  Frontend .env.production not found
    echo 📝 Copying from example file...
    copy "frontend\env.production.example" "frontend\.env.production"
    echo ✅ Created frontend\.env.production from example
    echo 🔧 Please edit frontend\.env.production with your actual values
) else (
    echo ✅ Frontend .env.production exists
)

if not exist "backend\.env.production" (
    echo ⚠️  Backend .env.production not found
    echo 📝 Copying from example file...
    copy "backend\env.production.example" "backend\.env.production"
    echo ✅ Created backend\.env.production from example
    echo 🔧 Please edit backend\.env.production with your actual values
) else (
    echo ✅ Backend .env.production exists
)

REM Check dependencies
echo.
echo 📦 Checking dependencies...

if not exist "frontend\node_modules" (
    echo 📥 Installing frontend dependencies...
    cd frontend
    npm install
    if errorlevel 1 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

if not exist "backend\node_modules" (
    echo 📥 Installing backend dependencies...
    cd backend
    npm install
    if errorlevel 1 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Build backend
echo.
echo 🔨 Building backend...
cd backend
npm run build
if errorlevel 1 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)
echo ✅ Backend build successful
cd ..

REM Build frontend
echo.
echo 🔨 Building frontend...
cd frontend
npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build successful
cd ..

echo.
echo 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Review and update environment variables in:
echo    - frontend\.env.production
echo    - backend\.env.production
echo.
echo 2. Follow the DEPLOYMENT_GUIDE.md for platform-specific instructions
echo.
echo 3. Deploy to:
echo    - Vercel (frontend)
echo    - Render (backend)
echo    - MongoDB Atlas (database)
echo.
echo 🚀 Happy deploying!
pause
