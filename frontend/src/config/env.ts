// Environment configuration for Byte Club Frontend
// This file centralizes all environment variable access

// Get environment variables with fallbacks
const getEnvVar = (key: string, defaultValue: string = '') => {
  return import.meta.env[key] || defaultValue;
};

export const config = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  
  // App Configuration
  appName: getEnvVar('VITE_APP_NAME', 'Byte Club'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  environment: getEnvVar('VITE_APP_ENVIRONMENT', 'development'),
  
  // Feature Flags
  enableDebugLogs: getEnvVar('VITE_ENABLE_DEBUG_LOGS', 'true') === 'true',
  enableApiLogging: getEnvVar('VITE_ENABLE_API_LOGGING', 'true') === 'true',
  
  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API endpoints (derived from base URL)
  get apiEndpoints() {
    const baseUrl = this.apiBaseUrl;
    return {
      auth: {
        signup: `${baseUrl}/auth/signup`,
        login: `${baseUrl}/auth/login`,
        logout: `${baseUrl}/auth/logout`,
        me: `${baseUrl}/auth/me`,
      },
      challenges: {
        list: `${baseUrl}/challenges`,
        get: (slug: string) => `${baseUrl}/challenges/${slug}`,
        submit: (slug: string) => `${baseUrl}/challenges/${slug}/submit`,
      },
      users: {
        get: (id: string) => `${baseUrl}/users/${id}`,
        update: (id: string) => `${baseUrl}/users/${id}`,
        leaderboard: `${baseUrl}/users/leaderboard`,
      },
      meta: {
        get: (type: string) => `${baseUrl}/meta/${type}`,
      },
      rewards: {
        purchase: (key: string) => `${baseUrl}/rewards/purchase/${key}`,
      },
      daily: {
        get: `${baseUrl}/daily`,
      },
    };
  },
  
  // Logging configuration
  get shouldLog() {
    return this.enableDebugLogs || this.isDevelopment;
  },
  
  get shouldLogApi() {
    return this.enableApiLogging || this.isDevelopment;
  },
};

// Validate required environment variables
export const validateEnv = () => {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    console.warn('Using default values. Check your .env file.');
    console.warn('Default API URL: http://localhost:3001/api');
  }
  
  return missing.length === 0;
};

// Initialize environment validation
if (config.shouldLog) {
  validateEnv();
}
