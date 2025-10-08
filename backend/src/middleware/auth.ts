import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models';
import logger from '../config/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const origin = req.headers.origin || 'Unknown';

    logger.info(`🔐 Auth attempt: ${req.method} ${req.path}`, {
      ip,
      origin,
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });

    if (!token) {
      logger.warn(`❌ No token for ${req.method} ${req.path}`, {
        ip,
        origin,
        authHeader: authHeader ? 'Present but malformed' : 'Missing',
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    logger.info(`🔍 Token decoded for user: ${decoded.userId}`, {
      userId: decoded.userId,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      logger.warn(`❌ User not found: ${decoded.userId}`, {
        userId: decoded.userId,
        ip,
        origin,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`✅ User authenticated: ${user.username} (${user.email})`, {
      userId: user._id,
      username: user.username,
      email: user.email,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });

    req.user = user;
    next();
  } catch (error) {
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const origin = req.headers.origin || 'Unknown';
    
    logger.error(`❌ Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  logger.info(`🔒 Admin access check for user: ${(req.user as any)?.username} (role: ${(req.user as any)?.role})`);
  
  if ((req.user as any)?.role !== 'admin') {
    logger.warn(`❌ Admin access denied for user: ${(req.user as any)?.username} (role: ${(req.user as any)?.role})`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  logger.info(`✅ Admin access granted for user: ${(req.user as any).username}`);
  next();
};
