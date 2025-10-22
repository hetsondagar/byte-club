import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import connectDB from './config/database';
import logger from './config/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeCodeHeistSocket } from './socket/codeHeistSocket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Security middleware
app.use(helmet());

// CORS configuration - environment-aware
const allowedOrigins = config.nodeEnv === 'production' 
  ? [
      'https://byte-club.vercel.app',
      'https://www.byte-club.vercel.app',
      'https://byte-club-frontend.vercel.app',
      'https://byte-club-git-main.vercel.app',
      'https://byte-club-git-main-hetsondagar.vercel.app',
      'https://byteclub-forgeyourlogic.vercel.app',
      // Allow any Vercel domain for this project
      /^https:\/\/.*\.vercel\.app$/
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins (including regex patterns)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    // In development, allow any localhost origin
    if (config.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    console.log(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
  optionsSuccessStatus: 200
}));

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
    
    // Log CORS-related headers for debugging
    if (req.method === 'OPTIONS' || origin !== 'Unknown') {
      console.log(`🔌 CORS Debug - Origin: ${origin}, Method: ${req.method}, Path: ${req.path}`);
    }
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
  console.log('Headers:', req.headers);
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString() 
  });
});

// API CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  console.log('🔌 API CORS test endpoint hit');
  console.log('Origin:', req.headers.origin);
  res.json({ 
    success: true,
    message: 'API CORS test successful', 
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

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`🔍 Request: ${req.method} ${req.path} from ${req.headers.origin || 'Unknown'}`);
  next();
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
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
    
    // Initialize Socket.IO for Code Heist
    initializeCodeHeistSocket(io);
    logger.info('🎮 Code Heist Socket.IO initialized');
    
    // Start server
    httpServer.listen(config.port, () => {
      console.log(`🚀 Byte Club API server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api`);
      console.log(`🎮 Code Heist WebSocket: ws://localhost:${config.port}/code-heist`);
      console.log('');
      console.log('💡 To run migrations: npm run migrate');
      console.log('💡 To seed database: npm run seed');
      console.log('💡 To run setup: npm run setup');
      
      logger.info(`🚀 Byte Club API server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api`);
      logger.info(`🎮 Code Heist WebSocket: ws://localhost:${config.port}/code-heist`);
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
