# 🔐 Authentication Debugging Guide

## Issues Fixed

### 1. **Authentication Routes Protection**
- ✅ **Fixed**: `/logout` route now requires authentication
- ✅ **Fixed**: Added test endpoints to verify authentication
- ✅ **Fixed**: Enhanced logging for all authentication attempts

### 2. **Server Logging Issues**
- ✅ **Fixed**: Added console.log alongside logger for visibility
- ✅ **Fixed**: Enhanced request logging with request body
- ✅ **Fixed**: Added test endpoints for debugging

## 🧪 Testing Authentication

### **Step 1: Start the Server**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Byte Club API server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
📚 API Documentation: http://localhost:3001/api
```

### **Step 2: Test Logger**
```bash
node test-logger.js
```

Should show colored log output.

### **Step 3: Test Authentication**
```bash
node test-auth.js
```

This will test:
- ✅ Public endpoint access
- ❌ Protected endpoint without token (should fail)
- ✅ User signup
- ✅ Protected endpoint with token (should work)
- ✅ User data retrieval

## 🔍 Debugging Steps

### **1. Check Server Logs**
When you make requests, you should see logs like:
```
📥 POST /api/auth/signup
🔐 Signup attempt for username: testuser, email: test@example.com
🔍 Checking for existing user...
✅ No existing user found, proceeding with registration
🔒 Hashing password...
✅ Password hashed successfully
👤 Creating new user record...
✅ User created successfully with ID: 507f1f77bcf86cd799439011
🎫 Generating JWT tokens...
✅ JWT tokens generated
💾 Storing refresh token session...
✅ Refresh token session stored
🎉 User registration completed successfully in 1250ms
👤 New user: testuser (test@example.com) - Level 1, 0 XP
```

### **2. Test Protected Endpoints**
Try accessing these endpoints:

**Without Token (should fail):**
```bash
curl http://localhost:3001/api/auth/test-protected
```
Expected: `401 Unauthorized`

**With Token (should work):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/test-protected
```
Expected: `200 OK` with user data

### **3. Check Authentication Flow**
1. **Signup**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login`
3. **Get Token**: Extract `accessToken` from response
4. **Use Token**: Add `Authorization: Bearer TOKEN` header
5. **Access Protected**: `GET /api/auth/me`

## 🚨 Common Issues

### **Issue 1: No Server Logs**
**Solution**: Check if server is running on port 3001
```bash
curl http://localhost:3001/health
```

### **Issue 2: Authentication Not Working**
**Solution**: Check if JWT_SECRET is set in environment
```bash
echo $JWT_SECRET
```

### **Issue 3: Database Connection Issues**
**Solution**: Check MongoDB connection
```bash
npm run migrate
npm run seed
```

## 📊 Expected Log Output

### **Successful Authentication:**
```
📥 POST /api/auth/signup
🔐 Signup attempt for username: testuser, email: test@example.com
🔍 Checking for existing user...
✅ No existing user found, proceeding with registration
🔒 Hashing password...
✅ Password hashed successfully
👤 Creating new user record...
✅ User created successfully with ID: 507f1f77bcf86cd799439011
🎫 Generating JWT tokens...
✅ JWT tokens generated
💾 Storing refresh token session...
✅ Refresh token session stored
🎉 User registration completed successfully in 1250ms
👤 New user: testuser (test@example.com) - Level 1, 0 XP
```

### **Failed Authentication:**
```
📥 GET /api/auth/test-protected
🔐 Authentication attempt for GET /api/auth/test-protected
❌ Authentication failed - no token provided for GET /api/auth/test-protected
```

### **Successful Protected Access:**
```
📥 GET /api/auth/test-protected
🔐 Authentication attempt for GET /api/auth/test-protected
🎫 Token found, verifying JWT...
✅ JWT verified for user ID: 507f1f77bcf86cd799439011
🔍 Looking up user in database...
✅ User authenticated: testuser (ID: 507f1f77bcf86cd799439011)
🔒 Protected endpoint accessed by user: testuser
```

## 🎯 Test Endpoints

- **Public**: `GET /test-auth` (no auth required)
- **Protected**: `GET /api/auth/test-protected` (auth required)
- **Signup**: `POST /api/auth/signup`
- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout` (auth required)
- **User Data**: `GET /api/auth/me` (auth required)

## 🔧 Quick Fixes

1. **Restart Server**: `npm run dev`
2. **Check Environment**: Ensure `.env` file exists
3. **Test Database**: `npm run migrate && npm run seed`
4. **Check Logs**: Look for error messages in console
5. **Test Endpoints**: Use the test scripts provided

The authentication system is now properly secured and should show detailed logs for debugging! 🎉
