import { Server, Socket } from 'socket.io';
import { CodeHeistGameEngine } from '../controllers/codeHeistController';
import { CodeHeistDB, Player, IGameRoom } from '../models/CodeHeist';
import { verifyToken } from '../utils/jwt';

interface SocketUser {
  userId: string;
  username: string;
  avatar?: string;
}

// Store active socket connections
const activeSockets = new Map<string, SocketUser>();
const roomSockets = new Map<string, Set<string>>();

export function initializeCodeHeistSocket(io: Server) {
  const codeHeistNamespace = io.of('/code-heist');

  codeHeistNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      socket.data.user = {
        userId: decoded.userId,
        username: decoded.username || 'Hacker',
        avatar: decoded.avatar
      };

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  codeHeistNamespace.on('connection', (socket: Socket) => {
    const user: SocketUser = socket.data.user;
    console.log(`[Code Heist] ${user.username} connected`);
    activeSockets.set(socket.id, user);

    // Create a new room
    socket.on('createRoom', async (data: { roomName: string, maxPlayers: number }, callback) => {
      try {
        const roomCode = CodeHeistGameEngine.generateRoomCode();
        const room = await CodeHeistDB.createRoom({
          roomCode,
          roomName: data.roomName,
          hostId: user.userId,
          maxPlayers: data.maxPlayers || 6,
          players: [{
            userId: user.userId,
            username: user.username,
            avatar: user.avatar,
            hand: [],
            lives: 0,
            isReady: false,
            isActive: false,
            points: 0
          }],
          currentPlayerIndex: 0,
          deck: [],
          discardPile: [],
          gameState: 'waiting',
          turnNumber: 0
        });

        socket.join(roomCode);
        if (!roomSockets.has(roomCode)) {
          roomSockets.set(roomCode, new Set());
        }
        roomSockets.get(roomCode)!.add(socket.id);

        callback({ success: true, room });
      } catch (error: any) {
        console.error('[Code Heist] Create room error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Join an existing room
    socket.on('joinRoom', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        if (room.gameState === 'playing') {
          return callback({ success: false, error: 'Game already in progress' });
        }

        if (room.players.length >= room.maxPlayers) {
          return callback({ success: false, error: 'Room is full' });
        }

        // Check if player already in room
        const existingPlayer = room.players.find(p => p.userId === user.userId);
        if (existingPlayer) {
          socket.join(data.roomCode);
          if (!roomSockets.has(data.roomCode)) {
            roomSockets.set(data.roomCode, new Set());
          }
          roomSockets.get(data.roomCode)!.add(socket.id);
          return callback({ success: true, room });
        }

        // Add new player
        const newPlayer: Player = {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar,
          hand: [],
          lives: 0,
          isReady: false,
          isActive: false,
          points: 0
        };

        room.players.push(newPlayer);
        const updatedRoom = await CodeHeistDB.updateRoom(room._id, { players: room.players });

        socket.join(data.roomCode);
        if (!roomSockets.has(data.roomCode)) {
          roomSockets.set(data.roomCode, new Set());
        }
        roomSockets.get(data.roomCode)!.add(socket.id);

        // Notify others
        socket.to(data.roomCode).emit('playerJoined', { player: newPlayer, room: updatedRoom });
        callback({ success: true, room: updatedRoom });
      } catch (error: any) {
        console.error('[Code Heist] Join room error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Player ready toggle
    socket.on('toggleReady', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const playerIndex = room.players.findIndex(p => p.userId === user.userId);
        if (playerIndex === -1) {
          return callback({ success: false, error: 'Player not in room' });
        }

        room.players[playerIndex].isReady = !room.players[playerIndex].isReady;
        const updatedRoom = await CodeHeistDB.updateRoom(room._id, { players: room.players });

        codeHeistNamespace.to(data.roomCode).emit('roomUpdate', updatedRoom);
        callback({ success: true, room: updatedRoom });
      } catch (error: any) {
        console.error('[Code Heist] Toggle ready error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Start game
    socket.on('startGame', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        if (room.hostId !== user.userId) {
          return callback({ success: false, error: 'Only host can start game' });
        }

        if (room.players.length < 3) {
          return callback({ success: false, error: 'Need at least 3 players' });
        }

        const allReady = room.players.every(p => p.isReady || p.userId === room.hostId);
        if (!allReady) {
          return callback({ success: false, error: 'All players must be ready' });
        }

        const startedRoom = await CodeHeistGameEngine.startGame(room._id);
        codeHeistNamespace.to(data.roomCode).emit('gameStarted', startedRoom);
        callback({ success: true, room: startedRoom });
      } catch (error: any) {
        console.error('[Code Heist] Start game error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Draw card
    socket.on('drawCard', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const currentPlayer = room.players[room.currentPlayerIndex];
        if (currentPlayer.userId !== user.userId) {
          return callback({ success: false, error: 'Not your turn' });
        }

        if (currentPlayer.hand.length >= 2) {
          return callback({ success: false, error: 'Hand limit reached' });
        }

        const { card, deck, discardPile } = CodeHeistGameEngine.drawCard(room.deck, room.discardPile);
        currentPlayer.hand.push(card);

        const updatedRoom = await CodeHeistDB.updateRoom(room._id, {
          players: room.players,
          deck,
          discardPile
        });

        // Send full update to current player
        socket.emit('cardDrawn', { room: updatedRoom, card });
        
        // Send sanitized update to others (no hand details)
        socket.to(data.roomCode).emit('playerDrewCard', {
          playerId: user.userId,
          deckCount: deck.length
        });

        callback({ success: true, card, room: updatedRoom });
      } catch (error: any) {
        console.error('[Code Heist] Draw card error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Play card
    socket.on('playCard', async (data: { roomCode: string, cardName: string, targetPlayerId?: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const currentPlayer = room.players[room.currentPlayerIndex];
        if (currentPlayer.userId !== user.userId) {
          return callback({ success: false, error: 'Not your turn' });
        }

        const result = CodeHeistGameEngine.playCard(room, user.userId, data.cardName, data.targetPlayerId);
        
        if (result.requiresInput) {
          return callback({ success: true, requiresInput: true, inputType: result.inputType });
        }

        const updatedRoom = await CodeHeistDB.updateRoom(room._id, result.room);

        // Broadcast card play with log
        codeHeistNamespace.to(data.roomCode).emit('cardPlayed', {
          room: updatedRoom,
          log: result.log,
          playerId: user.userId,
          cardName: data.cardName
        });

        callback({ success: true, room: updatedRoom, log: result.log });
      } catch (error: any) {
        console.error('[Code Heist] Play card error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // End turn
    socket.on('endTurn', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const currentPlayer = room.players[room.currentPlayerIndex];
        if (currentPlayer.userId !== user.userId) {
          return callback({ success: false, error: 'Not your turn' });
        }

        const updatedRoom = await CodeHeistGameEngine.endTurn(room._id);

        if (updatedRoom.gameState === 'ended') {
          // Game over
          codeHeistNamespace.to(data.roomCode).emit('gameEnded', {
            room: updatedRoom,
            winner: updatedRoom.winner
          });

          // Update stats
          for (const player of updatedRoom.players) {
            const isWinner = player.username === updatedRoom.winner;
            await CodeHeistDB.updateStats(player.userId, {
              totalGames: 1,
              wins: isWinner ? 1 : 0,
              losses: isWinner ? 0 : 1,
              totalPoints: player.points
            });
          }
        } else {
          codeHeistNamespace.to(data.roomCode).emit('turnEnded', {
            room: updatedRoom,
            nextPlayer: updatedRoom.players[updatedRoom.currentPlayerIndex].username
          });
        }

        callback({ success: true, room: updatedRoom });
      } catch (error: any) {
        console.error('[Code Heist] End turn error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Chat message
    socket.on('chatMessage', (data: { roomCode: string, message: string }) => {
      codeHeistNamespace.to(data.roomCode).emit('chatMessage', {
        userId: user.userId,
        username: user.username,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Leave room
    socket.on('leaveRoom', async (data: { roomCode: string }, callback) => {
      try {
        const room = await CodeHeistDB.getRoomByCode(data.roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const playerIndex = room.players.findIndex(p => p.userId === user.userId);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);

          if (room.players.length === 0) {
            // Delete empty room
            await CodeHeistDB.deleteRoom(room._id);
          } else {
            // Update host if needed
            if (room.hostId === user.userId && room.players.length > 0) {
              room.hostId = room.players[0].userId;
            }
            await CodeHeistDB.updateRoom(room._id, { 
              players: room.players,
              hostId: room.hostId
            });
          }

          socket.leave(data.roomCode);
          roomSockets.get(data.roomCode)?.delete(socket.id);
          
          socket.to(data.roomCode).emit('playerLeft', {
            userId: user.userId,
            username: user.username,
            room: room.players.length > 0 ? room : null
          });
        }

        callback({ success: true });
      } catch (error: any) {
        console.error('[Code Heist] Leave room error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Get active rooms
    socket.on('getActiveRooms', async (callback) => {
      try {
        const rooms = await CodeHeistDB.getActiveRooms();
        callback({ success: true, rooms });
      } catch (error: any) {
        console.error('[Code Heist] Get active rooms error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Get leaderboard
    socket.on('getLeaderboard', async (data: { limit?: number }, callback) => {
      try {
        const leaderboard = await CodeHeistDB.getLeaderboard(data.limit || 10);
        callback({ success: true, leaderboard });
      } catch (error: any) {
        console.error('[Code Heist] Get leaderboard error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Code Heist] ${user.username} disconnected`);
      activeSockets.delete(socket.id);

      // Clean up room associations
      roomSockets.forEach((sockets, roomCode) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(roomCode).emit('playerDisconnected', {
            userId: user.userId,
            username: user.username
          });
        }
      });
    });
  });

  console.log('[Code Heist] Socket.IO namespace initialized');
}

