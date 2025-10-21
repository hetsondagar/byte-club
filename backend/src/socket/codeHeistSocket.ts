import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { CodeHeistController } from '../controllers/codeHeistController';
import { IGameRoom, IPlayer } from '../models/CodeHeist';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export class CodeHeistSocketHandler {
  private io: Server;
  private userRooms: Map<string, string> = new Map(); // userId -> roomCode

  constructor(io: Server) {
    this.io = io;
  }

  public initialize(): void {
    const codeHeistNamespace = this.io.of('/code-heist');

    // Authentication middleware
    codeHeistNamespace.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    codeHeistNamespace.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`Code Heist: User ${socket.username} connected`);

      // Create room
      socket.on('createRoom', async (data: { roomName: string; maxPlayers?: number }) => {
        try {
          if (!socket.userId || !socket.username) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const room = await CodeHeistController.createRoom(
            socket.userId,
            data.roomName,
            data.maxPlayers || 6
          );

          socket.join(room.roomCode);
          this.userRooms.set(socket.userId, room.roomCode);

          socket.emit('roomCreated', {
            roomCode: room.roomCode,
            roomName: room.roomName,
            hostId: room.hostId
          });

          this.broadcastRoomUpdate(room);
        } catch (error) {
          socket.emit('error', { message: 'Failed to create room' });
        }
      });

      // Join room
      socket.on('joinRoom', async (data: { roomCode: string }) => {
        try {
          if (!socket.userId || !socket.username) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const room = await CodeHeistController.joinRoom(
            data.roomCode,
            socket.userId,
            socket.username
          );

          if (!room) {
            socket.emit('error', { message: 'Room not found or full' });
            return;
          }

          socket.join(room.roomCode);
          this.userRooms.set(socket.userId, room.roomCode);

          socket.emit('roomJoined', { roomCode: room.roomCode });
          this.broadcastRoomUpdate(room);
          this.broadcastPlayerJoined(room, socket.username!);
        } catch (error) {
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Leave room
      socket.on('leaveRoom', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const room = await CodeHeistController.leaveRoom(roomCode, socket.userId);
          
          socket.leave(roomCode);
          this.userRooms.delete(socket.userId);

          if (room) {
            this.broadcastRoomUpdate(room);
            this.broadcastPlayerLeft(room, socket.username!);
          } else {
            // Room was deleted
            codeHeistNamespace.to(roomCode).emit('roomDeleted');
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to leave room' });
        }
      });

      // Toggle ready
      socket.on('toggleReady', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const room = await CodeHeistController.toggleReady(roomCode, socket.userId);
          if (room) {
            this.broadcastRoomUpdate(room);
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to toggle ready status' });
        }
      });

      // Start game
      socket.on('startGame', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const room = await CodeHeistController.startGame(roomCode, socket.userId);
          if (room) {
            this.broadcastGameStarted(room);
            this.broadcastRoomUpdate(room);
          } else {
            socket.emit('error', { message: 'Failed to start game' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to start game' });
        }
      });

      // Draw card
      socket.on('drawCard', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const room = await CodeHeistController.drawCard(roomCode, socket.userId);
          if (room) {
            this.broadcastCardDrawn(room, socket.userId);
            this.broadcastRoomUpdate(room);
          } else {
            socket.emit('error', { message: 'Failed to draw card' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to draw card' });
        }
      });

      // Play card
      socket.on('playCard', async (data: { 
        cardId: string; 
        targetUserId?: string; 
        targetCardId?: string 
      }) => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          // Validate input
          if (!data.cardId) {
            socket.emit('error', { message: 'Card ID is required' });
            return;
          }

          const result = await CodeHeistController.playCard(
            roomCode,
            socket.userId,
            data.cardId,
            data.targetUserId,
            data.targetCardId
          );

          if (result.success && result.room) {
            this.broadcastCardPlayed(result.room, socket.userId, data.cardId, result.message);
            this.broadcastRoomUpdate(result.room);

            // If card is challengeable, notify other players
            if (result.challengeable) {
              this.broadcastChallengeAvailable(result.room, socket.userId, data.cardId);
            }

            // Check for eliminations
            const eliminatedPlayers = result.room.players.filter(p => p.isEliminated);
            for (const player of eliminatedPlayers) {
              this.broadcastPlayerEliminated(result.room, player);
            }

            // Check for game end
            if (result.room.gameState === 'ended') {
              this.broadcastGameEnded(result.room);
            }
          } else {
            socket.emit('error', { message: result.message });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to play card' });
        }
      });

      // Challenge a played card
      socket.on('challengeCard', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const result = await CodeHeistController.challengeCard(roomCode, socket.userId);

          if (result.success && result.room) {
            this.broadcastChallengeResult(result.room, result.message);
            this.broadcastRoomUpdate(result.room);

            // Check for eliminations
            const eliminatedPlayers = result.room.players.filter(p => p.isEliminated);
            for (const player of eliminatedPlayers) {
              this.broadcastPlayerEliminated(result.room, player);
            }

            // Check for game end
            if (result.room.gameState === 'ended') {
              this.broadcastGameEnded(result.room);
            }
          } else {
            socket.emit('error', { message: result.message });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to challenge card' });
        }
      });

      // End turn
      socket.on('endTurn', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          const room = await CodeHeistController.endTurn(roomCode, socket.userId);
          if (room) {
            this.broadcastTurnEnded(room);
            this.broadcastRoomUpdate(room);

            if (room.gameState === 'ended') {
              this.broadcastGameEnded(room);
            }
          } else {
            socket.emit('error', { message: 'Failed to end turn' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to end turn' });
        }
      });

      // Chat message
      socket.on('chatMessage', async (data: { message: string }) => {
        try {
          if (!socket.userId || !socket.username) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (!roomCode) return;

          // Validate message
          if (!data.message || data.message.trim().length === 0) {
            socket.emit('error', { message: 'Message cannot be empty' });
            return;
          }

          if (data.message.length > 200) {
            socket.emit('error', { message: 'Message too long (max 200 characters)' });
            return;
          }

          codeHeistNamespace.to(roomCode).emit('chatMessage', {
            userId: socket.userId,
            username: socket.username,
            message: data.message.trim(),
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Get active rooms
      socket.on('getActiveRooms', async () => {
        try {
          const rooms = await CodeHeistController.getActiveRooms();
          socket.emit('activeRooms', rooms);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get active rooms' });
        }
      });

      // Disconnect
      socket.on('disconnect', async () => {
        try {
          if (!socket.userId) return;

          const roomCode = this.userRooms.get(socket.userId);
          if (roomCode) {
            const room = await CodeHeistController.leaveRoom(roomCode, socket.userId);
            
            if (room) {
              this.broadcastRoomUpdate(room);
              this.broadcastPlayerLeft(room, socket.username || 'Unknown');
            } else {
              codeHeistNamespace.to(roomCode).emit('roomDeleted');
            }
          }

          this.userRooms.delete(socket.userId);
          console.log(`Code Heist: User ${socket.username} disconnected`);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    });
  }

  // Broadcast methods
  private broadcastRoomUpdate(room: IGameRoom): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    
    // Send public room data to all players
    const publicRoomData = {
      roomCode: room.roomCode,
      roomName: room.roomName,
      hostId: room.hostId,
      maxPlayers: room.maxPlayers,
      players: room.players.map(p => ({
        userId: p.userId,
        username: p.username,
        lifeTokens: p.lifeTokens,
        handSize: p.hand.length,
        ready: p.ready,
        isEliminated: p.isEliminated,
        hasFirewall: p.hasFirewall,
        hasVPNCloak: p.hasVPNCloak,
        canChallenge: p.canChallenge
      })),
      gameState: room.gameState,
      currentPlayerIndex: room.currentPlayerIndex,
      turnNumber: room.turnNumber,
      winner: room.winner,
      deckSize: room.deck.length,
      discardPileSize: room.discardPile.length
    };

    codeHeistNamespace.to(room.roomCode).emit('roomUpdate', publicRoomData);

    // Send private hand data to each player
    room.players.forEach(player => {
      const privateData = {
        hand: player.hand,
        isCurrentPlayer: room.players[room.currentPlayerIndex]?.userId === player.userId
      };
      codeHeistNamespace.to(room.roomCode).emit('privateData', privateData);
    });
  }

  private broadcastPlayerJoined(room: IGameRoom, username: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('playerJoined', { username });
  }

  private broadcastPlayerLeft(room: IGameRoom, username: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('playerLeft', { username });
  }

  private broadcastGameStarted(room: IGameRoom): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('gameStarted', {
      currentPlayer: room.players[room.currentPlayerIndex]?.username,
      turnNumber: room.turnNumber
    });
  }

  private broadcastCardDrawn(room: IGameRoom, userId: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      codeHeistNamespace.to(room.roomCode).emit('cardDrawn', {
        username: player.username,
        handSize: player.hand.length
      });
    }
  }

  private broadcastCardPlayed(room: IGameRoom, userId: string, cardId: string, message: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      codeHeistNamespace.to(room.roomCode).emit('cardPlayed', {
        username: player.username,
        cardId,
        message
      });
    }
  }

  private broadcastTurnEnded(room: IGameRoom): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer) {
      codeHeistNamespace.to(room.roomCode).emit('turnEnded', {
        currentPlayer: currentPlayer.username,
        turnNumber: room.turnNumber
      });
    }
  }

  private broadcastPlayerEliminated(room: IGameRoom, player: IPlayer): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('playerEliminated', {
      username: player.username,
      reason: 'eliminated'
    });
  }

  private broadcastGameEnded(room: IGameRoom): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('gameEnded', {
      winner: room.winner,
      turnNumber: room.turnNumber
    });
  }

  private broadcastChallengeAvailable(room: IGameRoom, playerId: string, cardId: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    const player = room.players.find(p => p.userId === playerId);
    if (player) {
      codeHeistNamespace.to(room.roomCode).emit('challengeAvailable', {
        playedBy: player.username,
        cardId,
        message: `${player.username} played a card that can be challenged!`
      });
    }
  }

  private broadcastChallengeResult(room: IGameRoom, message: string): void {
    const codeHeistNamespace = this.io.of('/code-heist');
    codeHeistNamespace.to(room.roomCode).emit('challengeResult', {
      message
    });
  }
}

// Export function for server initialization
export function initializeCodeHeistSocket(io: Server): void {
  const handler = new CodeHeistSocketHandler(io);
  handler.initialize();
}