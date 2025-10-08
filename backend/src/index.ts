import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import connectDB from './config/database';
import logger from './config/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - more permissive for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// CORS headers middleware - ensures CORS headers are set on ALL responses
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // CORS headers set
  
  next();
});

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  if (req.path !== '/health' && req.path !== '/ping') {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const origin = req.headers.origin || 'Unknown';
    const authHeader = req.headers.authorization ? 'Present' : 'Missing';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    logger.info(`📥 ${req.method} ${req.path}`, {
      ip,
      origin,
      userAgent: userAgent.substring(0, 100),
      authHeader,
      timestamp: new Date().toISOString(),
      body: req.method !== 'GET' ? JSON.stringify(req.body).substring(0, 200) : undefined
    });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Byte Club API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Test authentication endpoint
app.get('/test-auth', (req, res) => {
  console.log('🧪 Test authentication endpoint accessed');
  logger.info('🧪 Test authentication endpoint accessed');
  res.json({
    success: true,
    message: 'This endpoint is public - no authentication required',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get('/ping', (req, res) => {
  console.log('🏓 Ping endpoint hit');
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  console.log('🔌 CORS test endpoint hit');
  console.log('Origin:', req.headers.origin);
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint to check users in database
app.get('/debug/users', async (req, res) => {
  try {
    const { User } = await import('./models');
    const users = await User.find({}).select('username email createdAt');
    logger.info(`🔍 Debug: Found ${users.length} users in database`);
    res.json({
      success: true,
      message: `Found ${users.length} users`,
      users: users.map(user => ({
        id: user._id,
        username: (user as any).username,
        email: (user as any).email,
        createdAt: (user as any).createdAt
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Debug users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if migrations and seeds need to be run
    logger.info('🔍 Checking database state...');
    
    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Byte Club API server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api`);
      console.log('');
      console.log('💡 To run migrations: npm run migrate');
      console.log('💡 To seed database: npm run seed');
      console.log('💡 To run setup: npm run setup');
      
      logger.info(`🚀 Byte Club API server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api`);
      logger.info('');
      logger.info('💡 To run migrations: npm run migrate');
      logger.info('💡 To seed database: npm run seed');
      logger.info('💡 To run setup: npm run setup');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
