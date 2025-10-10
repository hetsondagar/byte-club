import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameRoom, Player, ChatMessage, GameLog, Card } from '@/types/codeHeist';
import { API_URL } from '@/config/env';
import { toast } from 'sonner';

interface CodeHeistContextType {
  socket: Socket | null;
  connected: boolean;
  currentRoom: GameRoom | null;
  gameLog: GameLog[];
  chatMessages: ChatMessage[];
  
  // Room actions
  createRoom: (roomName: string, maxPlayers: number) => Promise<void>;
  joinRoom: (roomCode: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  
  // Game actions
  drawCard: () => Promise<void>;
  playCard: (cardName: string, targetPlayerId?: string) => Promise<void>;
  endTurn: () => Promise<void>;
  
  // Chat
  sendChatMessage: (message: string) => void;
  
  // Queries
  getActiveRooms: () => Promise<GameRoom[]>;
  getLeaderboard: (limit?: number) => Promise<any[]>;
}

const CodeHeistContext = createContext<CodeHeistContextType | undefined>(undefined);

export function CodeHeistProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameLog, setGameLog] = useState<GameLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    const socketUrl = API_URL.replace('/api', '');
    const newSocket = io(`${socketUrl}/code-heist`, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Code Heist] Connected to socket');
      setConnected(true);
      toast.success('Connected to Code Heist server');
    });

    newSocket.on('disconnect', () => {
      console.log('[Code Heist] Disconnected from socket');
      setConnected(false);
      toast.error('Disconnected from Code Heist server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Code Heist] Connection error:', error);
      toast.error('Failed to connect to game server');
    });

    // Room events
    newSocket.on('roomUpdate', (room: GameRoom) => {
      setCurrentRoom(room);
    });

    newSocket.on('playerJoined', (data: { player: Player, room: GameRoom }) => {
      setCurrentRoom(data.room);
      addGameLog(`${data.player.username} joined the room`, 'system');
      toast.info(`${data.player.username} joined the room`);
    });

    newSocket.on('playerLeft', (data: { userId: string, username: string, room: GameRoom | null }) => {
      setCurrentRoom(data.room);
      addGameLog(`${data.username} left the room`, 'system');
      toast.info(`${data.username} left the room`);
    });

    newSocket.on('playerDisconnected', (data: { userId: string, username: string }) => {
      addGameLog(`${data.username} disconnected`, 'system');
      toast.warning(`${data.username} disconnected`);
    });

    // Game events
    newSocket.on('gameStarted', (room: GameRoom) => {
      setCurrentRoom(room);
      setGameLog([]);
      addGameLog('Game started! May the best hacker win!', 'system');
      toast.success('Game started!');
    });

    newSocket.on('cardDrawn', (data: { room: GameRoom, card: Card }) => {
      setCurrentRoom(data.room);
      addGameLog(`You drew a card: ${data.card.name}`, 'action');
    });

    newSocket.on('playerDrewCard', (data: { playerId: string, deckCount: number }) => {
      addGameLog(`A player drew a card (${data.deckCount} remaining)`, 'action');
    });

    newSocket.on('cardPlayed', (data: { room: GameRoom, log: string, playerId: string, cardName: string }) => {
      setCurrentRoom(data.room);
      addGameLog(data.log, data.cardName.includes('Attack') ? 'attack' : 'action');
    });

    newSocket.on('turnEnded', (data: { room: GameRoom, nextPlayer: string }) => {
      setCurrentRoom(data.room);
      addGameLog(`${data.nextPlayer}'s turn`, 'system');
    });

    newSocket.on('gameEnded', (data: { room: GameRoom, winner?: string }) => {
      setCurrentRoom(data.room);
      if (data.winner) {
        addGameLog(`🏆 ${data.winner} wins the game!`, 'system');
        toast.success(`${data.winner} wins!`);
      } else {
        addGameLog('Game ended', 'system');
      }
    });

    // Chat events
    newSocket.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addGameLog = useCallback((message: string, type: GameLog['type'] = 'action') => {
    setGameLog(prev => [...prev, { message, timestamp: new Date(), type }]);
  }, []);

  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    if (!socket) throw new Error('Not connected');
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('createRoom', { roomName, maxPlayers }, (response: any) => {
        if (response.success) {
          setCurrentRoom(response.room);
          toast.success('Room created successfully!');
          resolve();
        } else {
          toast.error(response.error || 'Failed to create room');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  const joinRoom = useCallback(async (roomCode: string) => {
    if (!socket) throw new Error('Not connected');
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('joinRoom', { roomCode }, (response: any) => {
        if (response.success) {
          setCurrentRoom(response.room);
          setChatMessages([]);
          setGameLog([]);
          toast.success('Joined room successfully!');
          resolve();
        } else {
          toast.error(response.error || 'Failed to join room');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  const leaveRoom = useCallback(async () => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('leaveRoom', { roomCode: currentRoom.roomCode }, (response: any) => {
        if (response.success) {
          setCurrentRoom(null);
          setChatMessages([]);
          setGameLog([]);
          toast.success('Left room');
          resolve();
        } else {
          toast.error(response.error || 'Failed to leave room');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const toggleReady = useCallback(async () => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('toggleReady', { roomCode: currentRoom.roomCode }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          toast.error(response.error || 'Failed to toggle ready');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const startGame = useCallback(async () => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('startGame', { roomCode: currentRoom.roomCode }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          toast.error(response.error || 'Failed to start game');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const drawCard = useCallback(async () => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('drawCard', { roomCode: currentRoom.roomCode }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          toast.error(response.error || 'Failed to draw card');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const playCard = useCallback(async (cardName: string, targetPlayerId?: string) => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('playCard', { 
        roomCode: currentRoom.roomCode, 
        cardName, 
        targetPlayerId 
      }, (response: any) => {
        if (response.success) {
          if (response.requiresInput) {
            toast.info(`Select a ${response.inputType === 'selectPlayer' ? 'player' : 'card'}`);
          }
          resolve();
        } else {
          toast.error(response.error || 'Failed to play card');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const endTurn = useCallback(async () => {
    if (!socket || !currentRoom) return;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('endTurn', { roomCode: currentRoom.roomCode }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          toast.error(response.error || 'Failed to end turn');
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, currentRoom]);

  const sendChatMessage = useCallback((message: string) => {
    if (!socket || !currentRoom) return;
    socket.emit('chatMessage', { roomCode: currentRoom.roomCode, message });
  }, [socket, currentRoom]);

  const getActiveRooms = useCallback(async (): Promise<GameRoom[]> => {
    if (!socket) throw new Error('Not connected');
    
    return new Promise((resolve, reject) => {
      socket.emit('getActiveRooms', (response: any) => {
        if (response.success) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  const getLeaderboard = useCallback(async (limit: number = 10): Promise<any[]> => {
    if (!socket) throw new Error('Not connected');
    
    return new Promise((resolve, reject) => {
      socket.emit('getLeaderboard', { limit }, (response: any) => {
        if (response.success) {
          resolve(response.leaderboard);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  const value: CodeHeistContextType = {
    socket,
    connected,
    currentRoom,
    gameLog,
    chatMessages,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    drawCard,
    playCard,
    endTurn,
    sendChatMessage,
    getActiveRooms,
    getLeaderboard
  };

  return (
    <CodeHeistContext.Provider value={value}>
      {children}
    </CodeHeistContext.Provider>
  );
}

export function useCodeHeist() {
  const context = useContext(CodeHeistContext);
  if (!context) {
    throw new Error('useCodeHeist must be used within CodeHeistProvider');
  }
  return context;
}

