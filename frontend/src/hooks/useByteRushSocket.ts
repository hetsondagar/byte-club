import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/config/env';

// BYTECLUB: Leaderboard entry interface
interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  distance: number;
  commits: number;
  runDurationMs: number;
  powerupsUsed: string[];
  createdAt: Date;
}

// BYTECLUB: Game statistics interface
interface GameStats {
  totalScores: number;
  totalPlayers: number;
  registeredPlayers: number;
  anonymousPlayers: number;
  averageScore: number;
  averageDistance: number;
  powerupUsage: Array<{
    powerup: string;
    count: number;
    percentage: number;
  }>;
  lastUpdated: string;
}

// BYTECLUB: Socket event types
interface SocketEvents {
  leaderboardUpdate: (data: { leaderboard: LeaderboardEntry[]; timestamp: string }) => void;
  gameStats: (data: GameStats) => void;
  scoreSubmitted: (data: { success: boolean; scoreId: string; rank: number | string; message: string }) => void;
  scoreSubmissionError: (data: { message: string; error?: string }) => void;
  leaderboardError: (data: { message: string }) => void;
  gameStatsError: (data: { message: string }) => void;
  joinedGame: (data: { message: string; userId?: string; username?: string }) => void;
  leftGame: (data: { message: string }) => void;
  powerupActivated: (data: { powerup: string; position: { x: number; y: number; z: number }; activatedBy: string; timestamp: string }) => void;
  playerPositionUpdate: (data: { userId: string; username: string; position: { x: number; y: number; z: number; speed: number }; timestamp: string }) => void;
}

// BYTECLUB: Hook for Byte Rush Socket.IO connection
export function useByteRushSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // BYTECLUB: Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('byteclub_token');
    
    // BYTECLUB: Create socket connection
    const socket = io(`${config.backendUrl}/byte-rush`, {
      auth: {
        token: token || undefined
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // BYTECLUB: Connection events
    socket.on('connect', () => {
      console.log('🎮 Byte Rush: Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('🎮 Byte Rush: Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🎮 Byte Rush: Connection error:', error);
      setError('Failed to connect to game server');
    });

    // BYTECLUB: Game events
    socket.on('leaderboardUpdate', (data) => {
      console.log('🎮 Byte Rush: Leaderboard updated', data);
      setLeaderboard(data.leaderboard);
    });

    socket.on('gameStats', (data) => {
      console.log('🎮 Byte Rush: Game stats received', data);
      setGameStats(data);
    });

    socket.on('scoreSubmitted', (data) => {
      console.log('🎮 Byte Rush: Score submitted', data);
      // Handle score submission success
    });

    socket.on('scoreSubmissionError', (data) => {
      console.error('🎮 Byte Rush: Score submission error', data);
      setError(data.message);
    });

    socket.on('leaderboardError', (data) => {
      console.error('🎮 Byte Rush: Leaderboard error', data);
      setError(data.message);
    });

    socket.on('gameStatsError', (data) => {
      console.error('🎮 Byte Rush: Game stats error', data);
      setError(data.message);
    });

    socket.on('joinedGame', (data) => {
      console.log('🎮 Byte Rush: Joined game', data);
    });

    socket.on('leftGame', (data) => {
      console.log('🎮 Byte Rush: Left game', data);
    });

    socket.on('powerupActivated', (data) => {
      console.log('🎮 Byte Rush: Powerup activated', data);
      // Handle powerup activation from other players
    });

    socket.on('playerPositionUpdate', (data) => {
      console.log('🎮 Byte Rush: Player position update', data);
      // Handle other players' position updates
    });

    // BYTECLUB: Join game room
    socket.emit('joinGame');

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // BYTECLUB: Submit score via socket
  const submitScore = (scoreData: {
    userId?: string;
    displayName?: string;
    score: number;
    distance: number;
    commits: number;
    runDurationMs: number;
    powerupsUsed: string[];
    clientGameVersion?: string;
  }) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to game server');
      return;
    }

    socketRef.current.emit('submitScore', scoreData);
  };

  // BYTECLUB: Refresh leaderboard
  const refreshLeaderboard = () => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to game server');
      return;
    }

    socketRef.current.emit('refreshLeaderboard');
  };

  // BYTECLUB: Get game statistics
  const getGameStats = () => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to game server');
      return;
    }

    socketRef.current.emit('getGameStats');
  };

  // BYTECLUB: Activate powerup (broadcast to other players)
  const activatePowerup = (powerup: string, position: { x: number; y: number; z: number }) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('powerupActivated', { powerup, position });
  };

  // BYTECLUB: Update player position (broadcast to other players)
  const updatePlayerPosition = (position: { x: number; y: number; z: number; speed: number }) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('playerPosition', position);
  };

  // BYTECLUB: Join game room
  const joinGame = () => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to game server');
      return;
    }

    socketRef.current.emit('joinGame');
  };

  // BYTECLUB: Leave game room
  const leaveGame = () => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('leaveGame');
  };

  return {
    isConnected,
    connectedUsers,
    leaderboard,
    gameStats,
    error,
    submitScore,
    refreshLeaderboard,
    getGameStats,
    activatePowerup,
    updatePlayerPosition,
    joinGame,
    leaveGame,
    socket: socketRef.current
  };
}
