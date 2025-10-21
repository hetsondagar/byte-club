# 🎮 Code Heist Backend Implementation

## 📋 Overview

Complete backend implementation for the Code Heist multiplayer cyberpunk card game. Built with Node.js, TypeScript, Express, MongoDB, and Socket.IO for real-time gameplay.

## 🏗️ Architecture

### Core Components

1. **Models** (`backend/src/models/CodeHeist.ts`)
   - `IGameRoom`: Game room with players, deck, and state
   - `IPlayer`: Player data with hand, life tokens, and status
   - `ICard`: Card definitions with types and effects

2. **Controller** (`backend/src/controllers/codeHeistController.ts`)
   - Game logic and state management
   - Card effect resolution
   - Turn management and win conditions

3. **Socket Handler** (`backend/src/socket/codeHeistSocket.ts`)
   - Real-time communication via Socket.IO
   - JWT authentication
   - Event broadcasting and validation

4. **Routes** (`backend/src/routes/codeHeist.ts`)
   - REST API endpoints for room management
   - Public room listing
   - Admin cleanup functions

## 🎯 Game Rules Implementation

### Card Types & Effects

| Card | Type | Effect | Requires Key |
|------|------|--------|--------------|
| Firewall | Defense | Blocks one attack until next turn | No |
| Debugger | Recon | Peek at one player's hand or discard pile | No |
| Botnet | Attack | Compare hands with another player; lower loses a life | Yes |
| VPN Cloak | Defense | Avoid being targeted for one turn | No |
| System Override | Swap | Swap your hand with another player's hand | Yes |
| Encryption Key | Mandatory | Required if holding Botnet or System Override | No |
| Master Algorithm | Ultimate | If discarded or stolen, player instantly loses | No |
| Exploit Script | Attack | Force a target player to discard one chosen card | Yes |

### Deck Composition
- **Firewall**: 4 cards
- **Debugger**: 3 cards  
- **Botnet**: 3 cards
- **VPN Cloak**: 3 cards
- **System Override**: 2 cards
- **Encryption Key**: 3 cards
- **Master Algorithm**: 1 card
- **Exploit Script**: 3 cards
- **Total**: 22 cards

### Game Flow

1. **Setup Phase**
   - Shuffle deck
   - Deal 1 card to each player
   - Assign 1-2 life tokens randomly
   - Randomize turn order

2. **Turn Flow**
   - **Draw Phase**: Draw one card (max 2 in hand)
   - **Play Phase**: Play one card (optional)
   - **Resolution Phase**: Apply card effects
   - **End Turn**: Pass to next active player

3. **End Conditions**
   - Only one player remains → Winner declared
   - Master Algorithm discarded → Instant elimination

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `createRoom` | `{roomName, maxPlayers?}` | Create new game room |
| `joinRoom` | `{roomCode}` | Join existing room |
| `leaveRoom` | - | Leave current room |
| `toggleReady` | - | Toggle ready status |
| `startGame` | - | Start the game (host only) |
| `drawCard` | - | Draw a card from deck |
| `playCard` | `{cardId, targetUserId?, targetCardId?}` | Play a card |
| `endTurn` | - | End current turn |
| `chatMessage` | `{message}` | Send chat message |
| `getActiveRooms` | - | Get list of active rooms |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `roomUpdate` | `{roomData}` | Room state update |
| `privateData` | `{hand, isCurrentPlayer}` | Private player data |
| `playerJoined` | `{username}` | Player joined room |
| `playerLeft` | `{username}` | Player left room |
| `gameStarted` | `{currentPlayer, turnNumber}` | Game started |
| `cardDrawn` | `{username, handSize}` | Card drawn |
| `cardPlayed` | `{username, cardId, message}` | Card played |
| `turnEnded` | `{currentPlayer, turnNumber}` | Turn ended |
| `playerEliminated` | `{username, reason}` | Player eliminated |
| `gameEnded` | `{winner, turnNumber}` | Game ended |
| `chatMessage` | `{userId, username, message, timestamp}` | Chat message |
| `activeRooms` | `{rooms}` | List of active rooms |
| `error` | `{message}` | Error message |

## 🔐 Security & Validation

### Authentication
- JWT token required for all socket connections
- Token validated on connection and stored in socket
- User ID and username extracted from token

### Input Validation
- Card ID validation before playing
- Target player validation for targeted cards
- Message length limits (max 200 characters)
- Room capacity limits (2-6 players)

### Game State Protection
- Server-side game logic only
- Client cannot modify game state directly
- All card effects resolved server-side
- Hidden data (hands, Master Algorithm) protected

## 🗄️ Database Schema

### GameRoom Collection
```typescript
{
  roomCode: string,           // Unique 6-character code
  roomName: string,           // Display name
  hostId: string,             // Host user ID
  maxPlayers: number,         // 2-6 players
  players: IPlayer[],         // Array of players
  deck: ICard[],              // Current deck
  discardPile: ICard[],       // Discarded cards
  gameState: string,          // "waiting" | "playing" | "ended"
  currentPlayerIndex: number, // Current turn index
  turnNumber: number,         // Turn counter
  winner?: string,            // Winner username
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

### Player Object
```typescript
{
  userId: string,             // User ID
  username: string,           // Display name
  lifeTokens: number,         // 1-2 life tokens
  hand: ICard[],              // Player's cards
  ready: boolean,             // Ready status
  isEliminated: boolean,      // Elimination status
  hasFirewall: boolean,       // Temporary effect
  hasVPNCloak: boolean        // Temporary effect
}
```

## 🚀 API Endpoints

### REST Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/code-heist/rooms` | Get active rooms | No |
| GET | `/api/code-heist/room/:roomCode` | Get room details | Yes |
| POST | `/api/code-heist/cleanup` | Cleanup old games | Yes |

### Socket.IO Namespace
- **Namespace**: `/code-heist`
- **Authentication**: JWT token in handshake
- **CORS**: Enabled for development

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-connection-string
```

### Socket.IO Configuration
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

## 🧹 Maintenance

### Cleanup Job
- Automatically removes ended games older than 24 hours
- Can be triggered manually via `/api/code-heist/cleanup`
- Prevents database bloat on free tier

### Error Handling
- Comprehensive try-catch blocks
- Graceful error responses
- Client-side error notifications
- Server-side logging

## 🎮 Usage Example

### Frontend Connection
```typescript
import { io } from 'socket.io-client';

const socket = io('/code-heist', {
  auth: {
    token: userJWTToken
  }
});

// Create room
socket.emit('createRoom', { 
  roomName: 'My Game', 
  maxPlayers: 4 
});

// Listen for updates
socket.on('roomUpdate', (roomData) => {
  // Update UI with room state
});

socket.on('privateData', (privateData) => {
  // Update player's hand and turn status
});
```

## ✅ Features Implemented

- ✅ Real-time multiplayer (2-6 players)
- ✅ Complete card system with all 8 card types
- ✅ Turn-based gameplay with proper sequencing
- ✅ JWT authentication and security
- ✅ Room management (create, join, leave)
- ✅ Game state synchronization
- ✅ Card effect resolution
- ✅ Win condition detection
- ✅ Chat system
- ✅ Error handling and validation
- ✅ Database persistence
- ✅ Cleanup and maintenance
- ✅ REST API endpoints
- ✅ Socket.IO real-time communication

## 🎯 Ready for Production

The Code Heist backend is fully implemented and ready for integration with the existing Byte Club frontend. All game rules, security measures, and real-time features are in place for a complete multiplayer card game experience.
