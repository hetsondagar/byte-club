# 🚀 Byte Club Deployment Guide

This guide will help you deploy the Byte Club application to Vercel (frontend), Render (backend), and MongoDB Atlas (database).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)
- RapidAPI account (for Judge0 API)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new project called "Byte Club"
4. Create a new cluster (choose the free M0 tier)
5. Choose a region close to your users

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with username and password (save these credentials!)
4. Set privileges to "Read and write to any database"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Add Current IP Address"
4. For production: Click "Allow Access from Anywhere" (0.0.0.0/0)

### 1.4 Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your actual password
5. Add database name: `mongodb+srv://username:password@cluster.mongodb.net/byte_club`

## 🔧 Step 2: Render Backend Deployment

### 2.1 Prepare Backend for Deployment
1. Push your code to GitHub (if not already done)
2. Make sure your backend is in the `backend/` folder

### 2.2 Deploy to Render
1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `byte-club-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: `Free`

### 2.3 Set Environment Variables in Render
Add these environment variables in the Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/byte_club
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
LOG_LEVEL=info
RAPIDAPI_JUDGE0_KEY=your-rapidapi-key
RAPIDAPI_JUDGE0_HOST=judge0-ce.p.rapidapi.com
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 2.4 Get Your Backend URL
After deployment, Render will provide you with a URL like: `https://byte-club-backend.onrender.com`

## 🌐 Step 3: Vercel Frontend Deployment

### 3.1 Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (Vercel automatically runs `npm install` first)
   - **Output Directory**: `dist`

**Important Note**: Vercel automatically runs `npm install` during deployment, so you don't need to include it in the build command. Vercel will:
1. Automatically detect your `package.json` in the frontend directory
2. Run `npm install` to install dependencies
3. Then run your specified build command (`npm run build`)

**Why this matters**: Including `npm install` in your build command can cause conflicts and deployment failures because Vercel already handles dependency installation automatically.

### 3.2 Set Environment Variables in Vercel
Add these environment variables in the Vercel dashboard:

```env
VITE_API_BASE_URL=https://byte-club-backend.onrender.com/api
VITE_APP_NAME=Byte Club
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_API_LOGGING=false
```

### 3.3 Get Your Frontend URL
After deployment, Vercel will provide you with a URL like: `https://byte-club-frontend.vercel.app`

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
1. Go back to your Render backend service
2. Update the `CORS_ORIGIN` environment variable with your Vercel frontend URL
3. Redeploy the backend service

### 4.2 Test the Connection
1. Visit your Vercel frontend URL
2. Try to sign up or login
3. Check the browser console and Render logs for any errors

## 🔑 Step 5: RapidAPI Judge0 Setup (Optional)

### 5.1 Get RapidAPI Key
1. Go to [RapidAPI](https://rapidapi.com)
2. Sign up for a free account
3. Search for "Judge0" API
4. Subscribe to the free plan
5. Copy your API key

### 5.2 Update Environment Variables
Add your RapidAPI key to both Render and Vercel environment variables.

## 🚀 Step 6: Production Optimizations

### 6.1 Database Seeding
After deployment, you may want to seed your production database:
1. Go to your Render backend logs
2. Run the seeding command if needed
3. Or create a one-time script to populate initial data

### 6.2 Monitoring
- Set up monitoring for your Render service
- Monitor your MongoDB Atlas cluster usage
- Set up alerts for any issues

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure your `CORS_ORIGIN` in Render matches your Vercel URL exactly
   - Check that the frontend is calling the correct backend URL

2. **Database Connection Issues**
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted in MongoDB Atlas
   - Ensure your database user has the correct permissions

3. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Make sure there are no typos in variable names
   - Verify that sensitive data is not exposed in logs

4. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify that the build commands are correct
   - Look at the build logs for specific errors

### Getting Help:
- Check the Render logs for backend issues
- Check the Vercel deployment logs for frontend issues
- Check the browser console for client-side errors
- Review the MongoDB Atlas logs for database issues

## 📝 Environment Variables Summary

### Backend (Render):
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/byte_club
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
LOG_LEVEL=info
RAPIDAPI_JUDGE0_KEY=your-rapidapi-key
RAPIDAPI_JUDGE0_HOST=judge0-ce.p.rapidapi.com
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Frontend (Vercel):
```env
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
VITE_APP_NAME=Byte Club
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_API_LOGGING=false
```

## 🎉 Congratulations!

Your Byte Club application should now be live and accessible to users worldwide! 

### Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`
- **Database**: MongoDB Atlas (managed)

Remember to:
- Monitor your usage on all platforms
- Set up proper error tracking
- Keep your dependencies updated
- Regularly backup your database
- Monitor performance and optimize as needed

Happy coding! 🚀✨
