#!/bin/bash

# Byte Club Deployment Script
# This script helps prepare the project for deployment

echo "🚀 Byte Club Deployment Preparation Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if .env files exist
echo ""
echo "📋 Checking environment files..."

if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  Frontend .env.production not found"
    echo "📝 Copying from example file..."
    cp frontend/env.production.example frontend/.env.production
    echo "✅ Created frontend/.env.production from example"
    echo "🔧 Please edit frontend/.env.production with your actual values"
else
    echo "✅ Frontend .env.production exists"
fi

if [ ! -f "backend/.env.production" ]; then
    echo "⚠️  Backend .env.production not found"
    echo "📝 Copying from example file..."
    cp backend/env.production.example backend/.env.production
    echo "✅ Created backend/.env.production from example"
    echo "🔧 Please edit backend/.env.production with your actual values"
else
    echo "✅ Backend .env.production exists"
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Build backend
echo ""
echo "🔨 Building backend..."
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# Build frontend
echo ""
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update environment variables in:"
echo "   - frontend/.env.production"
echo "   - backend/.env.production"
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for platform-specific instructions"
echo ""
echo "3. Deploy to:"
echo "   - Vercel (frontend)"
echo "   - Render (backend)"
echo "   - MongoDB Atlas (database)"
echo ""
echo "🚀 Happy deploying!"
