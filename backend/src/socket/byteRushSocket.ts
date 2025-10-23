import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ByteRushScore } from '../models/ByteRush';
import logger from '../config/logger';

// BYTECLUB: Interface for authenticated socket
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// BYTECLUB: Interface for leaderboard update
interface LeaderboardUpdate {
  rank: number;
  displayName: string;
  score: number;
  distance: number;
  commits: number;
  runDurationMs: number;
  powerupsUsed: string[];
  createdAt: Date;
}

// BYTECLUB: Interface for score submission via socket
interface SocketScoreSubmission {
  userId?: string;
  displayName?: string;
  score: number;
  distance: number;
  commits: number;
  runDurationMs: number;
  powerupsUsed: string[];
  clientGameVersion?: string;
}

export class ByteRushSocketHandler {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
  }

  public initialize(): void {
    const byteRushNamespace = this.io.of('/byte-rush');

    // BYTECLUB: Authentication middleware for Socket.IO
    byteRushNamespace.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        // Allow anonymous connections (no token required)
        if (!token) {
          socket.userId = undefined;
          socket.username = 'Anonymous';
          return next();
        }

        // Verify JWT token if provided
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.username = decoded.username || 'Anonymous';
        next();
      } catch (error) {
        // Allow connection even with invalid token (anonymous play)
        socket.userId = undefined;
        socket.username = 'Anonymous';
        next();
      }
    });

    byteRushNamespace.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`🎮 Byte Rush: User ${socket.username} (${socket.userId || 'Anonymous'}) connected`);

      // BYTECLUB: Track connected users
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // BYTECLUB: Send initial leaderboard data
      this.sendLeaderboardUpdate(socket);

      // BYTECLUB: Handle score submission via socket
      socket.on('submitScore', async (data: SocketScoreSubmission) => {
        try {
          // Validate score data
          if (!this.validateScoreData(data)) {
            socket.emit('scoreSubmissionError', {
              message: 'Invalid score data provided'
            });
            return;
          }

          // Create new score entry
          const newScore = new ByteRushScore({
            userId: socket.userId || data.userId,
            displayName: data.displayName || socket.username || 'Anonymous',
            score: data.score,
            distance: data.distance,
            commits: data.commits,
            runDurationMs: data.runDurationMs,
            powerupsUsed: data.powerupsUsed || [],
            clientGameVersion: data.clientGameVersion || '1.0.0'
          });

          await newScore.save();

          logger.info(`🎮 Byte Rush score submitted via socket`, {
            userId: socket.userId,
            username: socket.username,
            score: data.score,
            distance: data.distance,
            commits: data.commits
          });

          // BYTECLUB: Get updated leaderboard and broadcast to all clients
          const leaderboard = await ByteRushScore.getLeaderboard(50);
          const rankedLeaderboard: LeaderboardUpdate[] = leaderboard.map((entry, index) => ({
            rank: index + 1,
            displayName: entry.displayName,
            score: entry.score,
            distance: entry.distance,
            commits: entry.commits,
            runDurationMs: entry.runDurationMs,
            powerupsUsed: entry.powerupsUsed,
            createdAt: entry.createdAt
          }));

          // BYTECLUB: Find the rank of the newly submitted score
          const newScoreRank = rankedLeaderboard.findIndex(entry => 
            entry.displayName === newScore.displayName && 
            entry.score === newScore.score &&
            entry.distance === newScore.distance
          ) + 1;

          // BYTECLUB: Emit success response to the submitting client
          socket.emit('scoreSubmitted', {
            success: true,
            scoreId: newScore._id,
            rank: newScoreRank > 0 ? newScoreRank : 'Not in top 50',
            message: 'Score submitted successfully!'
          });

          // BYTECLUB: Broadcast leaderboard update to all connected clients
          byteRushNamespace.emit('leaderboardUpdate', {
            leaderboard: rankedLeaderboard,
            newScore: {
              rank: newScoreRank,
              displayName: newScore.displayName,
              score: newScore.score,
              distance: newScore.distance,
              commits: newScore.commits,
              runDurationMs: newScore.runDurationMs,
              powerupsUsed: newScore.powerupsUsed,
              createdAt: newScore.createdAt
            },
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          logger.error('❌ Error submitting score via socket:', error);
          socket.emit('scoreSubmissionError', {
            message: 'Failed to submit score',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      // BYTECLUB: Handle leaderboard refresh request
      socket.on('refreshLeaderboard', async () => {
        try {
          await this.sendLeaderboardUpdate(socket);
        } catch (error) {
          logger.error('❌ Error refreshing leaderboard:', error);
          socket.emit('leaderboardError', {
            message: 'Failed to refresh leaderboard'
          });
        }
      });

      // BYTECLUB: Handle game statistics request
      socket.on('getGameStats', async () => {
        try {
          const totalScores = await ByteRushScore.countDocuments();
          const totalPlayers = await ByteRushScore.distinct('userId').then(users => users.filter(Boolean).length);
          const totalAnonymousPlayers = await ByteRushScore.countDocuments({ userId: { $exists: false } });
          
          const averageScore = await ByteRushScore.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$score' } } }
          ]).then(result => result[0]?.avgScore || 0);

          socket.emit('gameStats', {
            totalScores,
            totalPlayers: totalPlayers + totalAnonymousPlayers,
            registeredPlayers: totalPlayers,
            anonymousPlayers: totalAnonymousPlayers,
            averageScore: Math.round(averageScore),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('❌ Error fetching game stats:', error);
          socket.emit('gameStatsError', {
            message: 'Failed to fetch game statistics'
          });
        }
      });

      // BYTECLUB: Handle user joining game room
      socket.on('joinGame', () => {
        socket.join('game');
        logger.info(`🎮 User ${socket.username} joined Byte Rush game room`);
        
        socket.emit('joinedGame', {
          message: 'Successfully joined Byte Rush game room',
          userId: socket.userId,
          username: socket.username
        });
      });

      // BYTECLUB: Handle user leaving game room
      socket.on('leaveGame', () => {
        socket.leave('game');
        logger.info(`🎮 User ${socket.username} left Byte Rush game room`);
        
        socket.emit('leftGame', {
          message: 'Successfully left Byte Rush game room'
        });
      });

      // BYTECLUB: Handle powerup activation broadcast
      socket.on('powerupActivated', (data: { powerup: string; position: { x: number; y: number; z: number } }) => {
        // Broadcast powerup activation to all players in the game room
        socket.to('game').emit('powerupActivated', {
          powerup: data.powerup,
          position: data.position,
          activatedBy: socket.username,
          timestamp: new Date().toISOString()
        });
      });

      // BYTECLUB: Handle player position updates
      socket.on('playerPosition', (data: { x: number; y: number; z: number; speed: number }) => {
        // Broadcast player position to other players in the game room
        socket.to('game').emit('playerPositionUpdate', {
          userId: socket.userId,
          username: socket.username,
          position: data,
          timestamp: new Date().toISOString()
        });
      });

      // BYTECLUB: Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`🎮 Byte Rush: User ${socket.username} (${socket.userId || 'Anonymous'}) disconnected`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  // BYTECLUB: Send leaderboard update to a specific socket
  private async sendLeaderboardUpdate(socket: AuthenticatedSocket): Promise<void> {
    try {
      const leaderboard = await ByteRushScore.getLeaderboard(50);
      const rankedLeaderboard: LeaderboardUpdate[] = leaderboard.map((entry, index) => ({
        rank: index + 1,
        displayName: entry.displayName,
        score: entry.score,
        distance: entry.distance,
        commits: entry.commits,
        runDurationMs: entry.runDurationMs,
        powerupsUsed: entry.powerupsUsed,
        createdAt: entry.createdAt
      }));

      socket.emit('leaderboardUpdate', {
        leaderboard: rankedLeaderboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error sending leaderboard update:', error);
      socket.emit('leaderboardError', {
        message: 'Failed to fetch leaderboard'
      });
    }
  }

  // BYTECLUB: Validate score data
  private validateScoreData(data: SocketScoreSubmission): boolean {
    if (typeof data.score !== 'number' || typeof data.distance !== 'number' || 
        typeof data.commits !== 'number' || typeof data.runDurationMs !== 'number') {
      return false;
    }

    if (data.score < 0 || data.score > 1000000) return false;
    if (data.distance < 0 || data.distance > 50000) return false;
    if (data.commits < 0 || data.commits > 1000) return false;
    if (data.runDurationMs < 1000 || data.runDurationMs > 600000) return false;

    return true;
  }

  // BYTECLUB: Broadcast leaderboard update to all connected clients
  public async broadcastLeaderboardUpdate(): Promise<void> {
    try {
      const leaderboard = await ByteRushScore.getLeaderboard(50);
      const rankedLeaderboard: LeaderboardUpdate[] = leaderboard.map((entry, index) => ({
        rank: index + 1,
        displayName: entry.displayName,
        score: entry.score,
        distance: entry.distance,
        commits: entry.commits,
        runDurationMs: entry.runDurationMs,
        powerupsUsed: entry.powerupsUsed,
        createdAt: entry.createdAt
      }));

      this.io.of('/byte-rush').emit('leaderboardUpdate', {
        leaderboard: rankedLeaderboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('❌ Error broadcasting leaderboard update:', error);
    }
  }

  // BYTECLUB: Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}

// BYTECLUB: Initialize Byte Rush Socket.IO handler
export const initializeByteRushSocket = (io: Server): ByteRushSocketHandler => {
  const handler = new ByteRushSocketHandler(io);
  handler.initialize();
  return handler;
};
