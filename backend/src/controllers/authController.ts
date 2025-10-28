import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, Session } from '../models';
import { generateTokens } from '../utils/jwt';
import { calculateLevel } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import logger from '../config/logger';

export const signup = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  const origin = req.headers.origin || 'Unknown';
  
  try {
    const { username, email, password } = req.body;
    
    logger.info(`🔐 Signup attempt for username: ${username}, email: ${email}`, {
      username,
      email,
      ip,
      origin,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']?.substring(0, 100) || 'Unknown'
    });

    // Check if user already exists
    logger.info('🔍 Checking for existing user...', {
      username,
      email,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const userEmail = (existingUser as any).email;
      const conflictType = userEmail === email ? 'email' : 'username';
      logger.warn(`❌ Signup failed - user already exists: ${conflictType} conflict`, {
        username,
        email,
        conflictType,
        existingUserEmail: userEmail,
        ip,
        origin,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    logger.info('✅ No existing user found, proceeding with registration');

    // Hash password
    logger.info('🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    logger.info('✅ Password hashed successfully');

    // Create user
    logger.info('👤 Creating new user record...');
    const user = new User({
      username,
      email,
      password: hashedPassword,
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      completedChallenges: [],
      badges: [],
      rewards: [],
      role: 'user'
    });

    await user.save();
    logger.info(`✅ User created successfully with ID: ${user._id}`);

    // Generate tokens
    logger.info('🎫 Generating JWT tokens...');
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    logger.info('✅ JWT tokens generated');

    // Store refresh token
    logger.info('💾 Storing refresh token session...');
    const tokenHash = await bcrypt.hash(refreshToken, saltRounds);
    const session = new Session({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await session.save();
    logger.info('✅ Refresh token session stored');

    const duration = Date.now() - startTime;
    logger.info(`🎉 User registration completed successfully in ${duration}ms`);
    logger.info(`👤 New user: ${username} (${email}) - Level 1, 0 XP`);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          _id: user._id,
          username: (user as any).username,
          email: (user as any).email,
          totalXP: (user as any).totalXP,
          currentLevel: calculateLevel((user as any).totalXP),
          currentStreak: (user as any).currentStreak,
          badges: (user as any).badges,
          rewards: (user as any).rewards,
          role: (user as any).role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Signup failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      username: req.body?.username,
      email: req.body?.email,
      duration: `${duration}ms`
    });
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  const origin = req.headers.origin || 'Unknown';
  
  try {
    const { email, password } = req.body;
    
    logger.info(`🔐 Login attempt for email: ${email}`, {
      email,
      ip,
      origin,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']?.substring(0, 100) || 'Unknown'
    });

    // Find user
    logger.info('🔍 Looking up user by email...', {
      email,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });
    
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`❌ Login failed - user not found: ${email}`, {
        email,
        ip,
        origin,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    logger.info(`✅ User found: ${(user as any).username} (ID: ${user._id})`, {
      userId: user._id,
      username: (user as any).username,
      email: (user as any).email,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });

    // Check password
    logger.info('🔒 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, (user as any).password);
    if (!isPasswordValid) {
      logger.warn(`❌ Login failed - invalid password for user: ${(user as any).username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    logger.info('✅ Password verified successfully');

    // Generate tokens
    logger.info('🎫 Generating JWT tokens...');
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    logger.info('✅ JWT tokens generated');

    // Store refresh token
    logger.info('💾 Storing refresh token session...');
    const saltRounds = 12;
    const tokenHash = await bcrypt.hash(refreshToken, saltRounds);
    const session = new Session({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await session.save();
    logger.info('✅ Refresh token session stored');

    const duration = Date.now() - startTime;
    logger.info(`🎉 User login completed successfully in ${duration}ms`);
    logger.info(`👤 User logged in: ${(user as any).username} - Level ${(user as any).currentLevel}, ${(user as any).totalXP} XP, Streak: ${(user as any).currentStreak}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          username: (user as any).username,
          email: (user as any).email,
          totalXP: (user as any).totalXP,
          currentLevel: calculateLevel((user as any).totalXP),
          currentStreak: (user as any).currentStreak,
          badges: (user as any).badges,
          rewards: (user as any).rewards,
          role: (user as any).role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Login failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body?.email,
      duration: `${duration}ms`
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    logger.info('🚪 Logout request received');

    if (token) {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success
      logger.info('🎫 Token found in logout request');
    } else {
      logger.info('ℹ️  No token found in logout request');
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Logout completed successfully in ${duration}ms`);

    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Logout failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const startTime = Date.now();
  
  try {
    const user = req.user;
    const { username, email, password, badges, totalXP, triggerBadgeCheck, currentStreak, lastChallengeDate } = req.body;
    
    logger.info(`🔄 Profile update for user: ${user.username}`, {
      userId: user._id,
      updatingFields: { username: !!username, email: !!email, password: !!password, badges: !!badges, totalXP: totalXP !== undefined, currentStreak: currentStreak !== undefined }
    });

    // Check if username or email already taken (by another user)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (badges) user.badges = badges;
    if (totalXP !== undefined) user.totalXP = totalXP;
    if (currentStreak !== undefined) (user as any).currentStreak = currentStreak;
    if (lastChallengeDate !== undefined) (user as any).lastChallengeDate = new Date(lastChallengeDate);

    await user.save();

    // Trigger badge checking if requested
    if (triggerBadgeCheck) {
      logger.info(`🏆 Triggering badge check for user: ${user.username}`);
      await checkAndUnlockBadges(user._id);
      
      // Reload user to get updated badges
      const updatedUser = await User.findById(user._id);
      logger.info(`✅ Badge check completed for ${user.username}`);
    }

    logger.info(`✅ Profile updated for ${user.username}`);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        totalXP: user.totalXP,
        currentLevel: calculateLevel(user.totalXP),
        currentStreak: user.currentStreak,
        badges: user.badges,
        rewards: user.rewards,
        role: user.role
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Profile update error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  const startTime = Date.now();
  
  try {
    const user = req.user;
    
    logger.info(`👤 ${(user as any).username} data retrieved`);

    // Validate streak based on lastChallengeDate (same logic as leaderboard)
    const validateStreak = (streak: number, lastChallengeDate: Date | undefined) => {
      if (!streak || streak === 0) return 0;
      if (!lastChallengeDate) return streak; // If no date, return as-is
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(lastChallengeDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If more than 2 days have passed, streak is broken
      if (daysDiff >= 2) {
        return 0; // Streak broken
      }
      
      return streak; // Streak is still valid
    };

    const lastChallengeDate = (user as any).lastChallengeDate;
    const rawStreak = (user as any).currentStreak || 0;
    const validatedStreak = validateStreak(rawStreak, lastChallengeDate);
    
    return res.json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        user: {
          _id: user._id,
          username: (user as any).username,
          email: (user as any).email,
          totalXP: (user as any).totalXP,
          currentLevel: calculateLevel((user as any).totalXP),
          currentStreak: validatedStreak, // Use validated streak (same as leaderboard)
          badges: (user as any).badges,
          rewards: (user as any).rewards,
          role: (user as any).role,
          completedChallenges: (user as any).completedChallenges,
          lastChallengeDate: lastChallengeDate // Include for frontend use
        }
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Get user data failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?._id,
      duration: `${duration}ms`
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
