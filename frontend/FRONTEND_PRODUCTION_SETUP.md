# Frontend Production Environment Setup

## 🔧 **Current Environment Issues**

Your current `.env` file has development settings:
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_DEBUG_LOGS=true
```

## 🚀 **Production Environment Changes Needed**

### **1. Update Your `.env` File**

Replace your current `.env` file content with:

```bash
# Byte Club Frontend - Production Environment Variables

# API Configuration - UPDATE THIS WITH YOUR ACTUAL BACKEND URL
VITE_API_BASE_URL=https://your-backend-domain.com/api

# Production Settings
VITE_APP_NAME=Byte Club
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Feature Flags (disabled for production)
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_API_LOGGING=false

# Security Settings
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_SOURCE_MAPS=false
```

### **2. Important Changes to Make:**

#### **API URL (CRITICAL)**
- **Current:** `http://localhost:3001/api`
- **Change to:** `https://your-actual-backend-domain.com/api`
- **Example:** `https://byte-club-backend.vercel.app/api`

#### **Environment**
- **Current:** `development`
- **Change to:** `production`

#### **Debug Logs**
- **Current:** `true`
- **Change to:** `false`

### **3. Backend CORS Configuration**

Make sure your backend CORS is configured for your frontend domain. In `backend/src/index.ts`, update the allowed origins:

```typescript
const allowedOrigins = config.nodeEnv === 'production' 
  ? [
      'https://your-frontend-domain.com',  // Add your frontend URL here
      'https://byte-club.vercel.app',
      'https://www.byte-club.vercel.app'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173'
    ];
```

### **4. Deployment Checklist**

#### **Before Deploying Frontend:**
- [ ] Update `.env` with production API URL
- [ ] Set `VITE_APP_ENVIRONMENT=production`
- [ ] Disable debug logs (`VITE_ENABLE_DEBUG_LOGS=false`)
- [ ] Update backend CORS with your frontend domain
- [ ] Test API connection from production frontend

#### **After Deploying:**
- [ ] Verify API calls work from production frontend
- [ ] Check browser console for any errors
- [ ] Test authentication flow
- [ ] Verify all features work correctly

### **5. Common Deployment URLs**

#### **Vercel:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.vercel.app`

#### **Netlify:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://your-backend.netlify.app`

#### **Railway:**
- Frontend: `https://your-app.railway.app`
- Backend: `https://your-backend.railway.app`

### **6. Testing Production Setup**

After updating your environment:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Test locally with production build:**
   ```bash
   npm run preview
   ```

3. **Check browser console** for any errors

4. **Test API connection** by trying to login/signup

### **7. Environment Variable Priority**

Vite loads environment variables in this order:
1. `.env.production.local` (highest priority)
2. `.env.local`
3. `.env.production`
4. `.env` (lowest priority)

### **8. Security Notes**

- Never commit `.env` files with production secrets
- Use environment variables in your deployment platform
- Ensure HTTPS is used in production
- Verify CORS is properly configured

## ⚠️ **Critical Action Required**

**You MUST update the `VITE_API_BASE_URL` in your `.env` file to point to your actual backend production URL before deploying the frontend.**

The current localhost URL will not work in production!
