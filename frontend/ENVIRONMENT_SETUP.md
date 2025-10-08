# 🔧 Environment Configuration Guide

## 📁 **Environment Files**

### **Development** (`env.example`)
```bash
# Copy for development
cp env.example .env
```

### **Production** (`env.production.example`)
```bash
# Copy for production
cp env.production.example .env
```

## 🌍 **Environment Variables**

### **Required Variables**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api  # Development
VITE_API_BASE_URL=https://your-api.com/api   # Production
```

### **Optional Variables**
```bash
# App Configuration
VITE_APP_NAME=Byte Club
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development  # or production

# Feature Flags
VITE_ENABLE_DEBUG_LOGS=true     # Development
VITE_ENABLE_DEBUG_LOGS=false    # Production
VITE_ENABLE_API_LOGGING=true    # Development
VITE_ENABLE_API_LOGGING=false   # Production
```

## 🚀 **Setup Instructions**

### **1. Development Setup**
```bash
# Copy environment file
cp env.example .env

# Edit .env file
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_API_LOGGING=true
```

### **2. Production Setup**
```bash
# Copy production environment file
cp env.production.example .env

# Edit .env file
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_API_LOGGING=false
```

## 🔍 **Configuration Features**

### **Automatic Environment Detection**
- ✅ **Development**: Automatically detects `localhost`
- ✅ **Production**: Uses production API URL
- ✅ **Fallbacks**: Default values if env vars missing

### **Feature Flags**
- ✅ **Debug Logs**: Control console logging
- ✅ **API Logging**: Control API request/response logging
- ✅ **Environment**: Development vs Production behavior

### **Centralized Configuration**
- ✅ **Single Source**: All config in `src/config/env.ts`
- ✅ **Type Safety**: TypeScript interfaces
- ✅ **Validation**: Environment variable validation

## 📊 **Usage Examples**

### **In API Service**
```typescript
import { config } from '@/config/env';

// Uses environment variable
const url = config.apiBaseUrl;  // http://localhost:3001/api

// Conditional logging
if (config.shouldLogApi) {
  console.log('API Request:', url);
}
```

### **In Components**
```typescript
import { config } from '@/config/env';

// Check environment
if (config.isDevelopment) {
  console.log('Development mode');
}

// Use feature flags
if (config.enableDebugLogs) {
  console.log('Debug info');
}
```

## 🔧 **Environment-Specific Configurations**

### **Development**
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_API_LOGGING=true
```

### **Staging**
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
VITE_APP_ENVIRONMENT=staging
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_API_LOGGING=true
```

### **Production**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_API_LOGGING=false
```

## 🚨 **Important Notes**

### **Security**
- ✅ **Never commit** `.env` files to git
- ✅ **Use** `.env.example` for templates
- ✅ **Validate** environment variables on startup

### **Build Process**
- ✅ **Vite** automatically loads `.env` files
- ✅ **Variables** must start with `VITE_` to be accessible
- ✅ **Build-time** variables are embedded in the bundle

### **Deployment**
- ✅ **Set** environment variables in your hosting platform
- ✅ **Use** production environment file as template
- ✅ **Test** configuration before deployment

## 🎯 **Quick Start**

1. **Copy environment file**:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your settings:
   ```bash
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Check configuration** in browser console:
   ```javascript
   // Should show your configuration
   console.log('Environment Configuration:', config);
   ```

The configuration is now completely environment-driven! 🎉
