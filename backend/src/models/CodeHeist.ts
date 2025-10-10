import mongoose, { Schema, Document } from 'mongoose';

export interface Card {
  name: string;
  type: 'Defense' | 'Recon' | 'Attack' | 'Swap' | 'Mandatory' | 'Ultimate';
  effect: string;
  flavorText: string;
}

export interface Player {
  userId: string;
  username: string;
  avatar?: string;
  hand: Card[];
  lives: number;
  isReady: boolean;
  isActive: boolean;
  points: number;
}

export interface IGameRoom extends Document {
  roomCode: string;
  roomName: string;
  hostId: string;
  maxPlayers: number;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  gameState: 'waiting' | 'playing' | 'ended';
  turnNumber: number;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameStats extends Document {
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  masterAlgorithmCaptures: number;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// Card definitions
export const CARD_DECK: Card[] = [
  {
    name: 'Firewall',
    type: 'Defense',
    effect: 'Blocks one attack until next turn.',
    flavorText: 'Activate Firewall — no one can breach your module.'
  },
  {
    name: 'Debugger',
    type: 'Recon',
    effect: 'Peek at one player\'s hand or discard pile.',
    flavorText: 'Trace their code to see what\'s coming.'
  },
  {
    name: 'Botnet',
    type: 'Attack',
    effect: 'Compare your hand with another player; lower loses a life.',
    flavorText: 'Deploy Botnet — crush weaker code.'
  },
  {
    name: 'VPN Cloak',
    type: 'Defense',
    effect: 'Avoid being targeted for one turn.',
    flavorText: 'Go off the grid — invisible to trackers.'
  },
  {
    name: 'System Override',
    type: 'Swap',
    effect: 'Swap your card with another player\'s hand.',
    flavorText: 'Hijack their module for your advantage.'
  },
  {
    name: 'Encryption Key',
    type: 'Mandatory',
    effect: 'Must be held if holding System Override or Botnet.',
    flavorText: 'Keep it safe — losing it is catastrophic.'
  },
  {
    name: 'Master Algorithm',
    type: 'Ultimate',
    effect: 'If discarded or eliminated while holding, you lose immediately.',
    flavorText: 'The ultimate code — protect at all costs.'
  },
  {
    name: 'Exploit Script',
    type: 'Attack',
    effect: 'Force a player to discard a card of their choice.',
    flavorText: 'Inject Exploit — disrupt their flow.'
  }
];

// Mongoose Schemas
const CardSchema = new Schema<Card>({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Defense', 'Recon', 'Attack', 'Swap', 'Mandatory', 'Ultimate'] },
  effect: { type: String, required: true },
  flavorText: { type: String, required: true }
}, { _id: false });

const PlayerSchema = new Schema<Player>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: String,
  hand: [CardSchema],
  lives: { type: Number, default: 0 },
  isReady: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  points: { type: Number, default: 0 }
}, { _id: false });

const GameRoomSchema = new Schema<IGameRoom>({
  roomCode: { type: String, required: true, unique: true, index: true },
  roomName: { type: String, required: true },
  hostId: { type: String, required: true },
  maxPlayers: { type: Number, default: 6 },
  players: [PlayerSchema],
  currentPlayerIndex: { type: Number, default: 0 },
  deck: [CardSchema],
  discardPile: [CardSchema],
  gameState: { type: String, enum: ['waiting', 'playing', 'ended'], default: 'waiting', index: true },
  turnNumber: { type: Number, default: 0 },
  winner: String
}, {
  timestamps: true
});

const GameStatsSchema = new Schema<IGameStats>({
  userId: { type: String, required: true, unique: true, index: true },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  masterAlgorithmCaptures: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0, index: true }
}, {
  timestamps: true
});

// Models
export const GameRoom = mongoose.model<IGameRoom>('CodeHeistRoom', GameRoomSchema);
export const GameStats = mongoose.model<IGameStats>('CodeHeistStats', GameStatsSchema);

// Database helper class
export class CodeHeistDB {
  // Create a new game room
  static async createRoom(roomData: Partial<IGameRoom>): Promise<IGameRoom> {
    const room = new GameRoom(roomData);
    return await room.save();
  }

  // Get room by code
  static async getRoomByCode(roomCode: string): Promise<IGameRoom | null> {
    return await GameRoom.findOne({ roomCode });
  }

  // Get room by ID
  static async getRoomById(roomId: string): Promise<IGameRoom | null> {
    return await GameRoom.findById(roomId);
  }

  // Update room
  static async updateRoom(roomId: string, updates: Partial<IGameRoom>): Promise<IGameRoom | null> {
    return await GameRoom.findByIdAndUpdate(roomId, updates, { new: true });
  }

  // Delete room
  static async deleteRoom(roomId: string): Promise<void> {
    await GameRoom.findByIdAndDelete(roomId);
  }

  // Get all active rooms
  static async getActiveRooms(): Promise<IGameRoom[]> {
    return await GameRoom.find({
      gameState: { $in: ['waiting', 'playing'] }
    }).sort({ createdAt: -1 });
  }

  // Game stats methods
  static async getOrCreateStats(userId: string): Promise<IGameStats> {
    let stats = await GameStats.findOne({ userId });
    
    if (!stats) {
      stats = new GameStats({ userId });
      await stats.save();
    }
    
    return stats;
  }

  static async updateStats(userId: string, updates: Partial<IGameStats>): Promise<IGameStats | null> {
    const stats = await this.getOrCreateStats(userId);
    
    // Increment fields
    if (updates.totalGames !== undefined) stats.totalGames += updates.totalGames;
    if (updates.wins !== undefined) stats.wins += updates.wins;
    if (updates.losses !== undefined) stats.losses += updates.losses;
    if (updates.masterAlgorithmCaptures !== undefined) stats.masterAlgorithmCaptures += updates.masterAlgorithmCaptures;
    if (updates.totalPoints !== undefined) stats.totalPoints += updates.totalPoints;
    
    return await stats.save();
  }

  static async getLeaderboard(limit: number = 10): Promise<IGameStats[]> {
    return await GameStats.find()
      .sort({ totalPoints: -1, wins: -1 })
      .limit(limit);
  }
}
