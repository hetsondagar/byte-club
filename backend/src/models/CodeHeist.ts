import mongoose, { Document, Schema } from 'mongoose';

// Card interface and schema
export interface ICard {
  id: string;
  name: "Firewall" | "Debugger" | "Botnet" | "VPN Cloak" | "System Override" | "Encryption Key" | "Master Algorithm" | "Exploit Script";
  type: "attack" | "defense" | "recon" | "swap" | "mandatory" | "ultimate";
  requiresKey?: boolean;
}

const CardSchema = new Schema<ICard>({
  id: { type: String, required: true },
  name: { 
    type: String, 
    required: true,
    enum: ["Firewall", "Debugger", "Botnet", "VPN Cloak", "System Override", "Encryption Key", "Master Algorithm", "Exploit Script"]
  },
  type: { 
    type: String, 
    required: true,
    enum: ["attack", "defense", "recon", "swap", "mandatory", "ultimate"]
  },
  requiresKey: { type: Boolean, default: false }
}, { _id: false });

// Player interface and schema
export interface IPlayer {
  userId: string;
  username: string;
  lifeTokens: number;
  hand: ICard[];
  ready: boolean;
  isEliminated: boolean;
  hasFirewall: boolean;
  hasVPNCloak: boolean;
  canChallenge: boolean; // Can challenge the last played card
  lastPlayedCard?: ICard; // Last card played by this player
}

const PlayerSchema = new Schema<IPlayer>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  lifeTokens: { type: Number, required: true, default: 1 },
  hand: [CardSchema],
  ready: { type: Boolean, default: false },
  isEliminated: { type: Boolean, default: false },
  hasFirewall: { type: Boolean, default: false },
  hasVPNCloak: { type: Boolean, default: false },
  canChallenge: { type: Boolean, default: false },
  lastPlayedCard: CardSchema
}, { _id: false });

// Game Room interface and schema
export interface IGameRoom extends Document {
  roomCode: string;
  roomName: string;
  hostId: string;
  maxPlayers: number;
  players: IPlayer[];
  deck: ICard[];
  discardPile: ICard[];
  gameState: "waiting" | "playing" | "ended";
  currentPlayerIndex: number;
  turnNumber: number;
  winner?: string;
  // Challenge system fields
  pendingChallenge?: {
    challengerId: string;
    challengedPlayerId: string;
    playedCard: ICard;
    targetUserId?: string;
  };
  challengePhase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameRoomSchema = new Schema<IGameRoom>({
  roomCode: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  hostId: { type: String, required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 6 },
  players: [PlayerSchema],
  deck: [CardSchema],
  discardPile: [CardSchema],
  gameState: { 
    type: String, 
    enum: ["waiting", "playing", "ended"], 
    default: "waiting" 
  },
  currentPlayerIndex: { type: Number, default: 0 },
  turnNumber: { type: Number, default: 1 },
  winner: { type: String },
  // Challenge system fields
  pendingChallenge: {
    challengerId: { type: String },
    challengedPlayerId: { type: String },
    playedCard: CardSchema,
    targetUserId: { type: String }
  },
  challengePhase: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for faster room lookups
// Note: roomCode index is automatically created by unique: true property
GameRoomSchema.index({ gameState: 1 });

export const GameRoom = mongoose.model<IGameRoom>('GameRoom', GameRoomSchema);

// Card definitions for deck creation
export const CARD_DEFINITIONS: ICard[] = [
  // Firewall: 4 cards
  { id: 'firewall-1', name: 'Firewall', type: 'defense' },
  { id: 'firewall-2', name: 'Firewall', type: 'defense' },
  { id: 'firewall-3', name: 'Firewall', type: 'defense' },
  { id: 'firewall-4', name: 'Firewall', type: 'defense' },
  
  // Debugger: 3 cards
  { id: 'debugger-1', name: 'Debugger', type: 'recon' },
  { id: 'debugger-2', name: 'Debugger', type: 'recon' },
  { id: 'debugger-3', name: 'Debugger', type: 'recon' },
  
  // Botnet: 3 cards
  { id: 'botnet-1', name: 'Botnet', type: 'attack', requiresKey: true },
  { id: 'botnet-2', name: 'Botnet', type: 'attack', requiresKey: true },
  { id: 'botnet-3', name: 'Botnet', type: 'attack', requiresKey: true },
  
  // VPN Cloak: 3 cards
  { id: 'vpn-cloak-1', name: 'VPN Cloak', type: 'defense' },
  { id: 'vpn-cloak-2', name: 'VPN Cloak', type: 'defense' },
  { id: 'vpn-cloak-3', name: 'VPN Cloak', type: 'defense' },
  
  // System Override: 2 cards
  { id: 'system-override-1', name: 'System Override', type: 'swap', requiresKey: true },
  { id: 'system-override-2', name: 'System Override', type: 'swap', requiresKey: true },
  
  // Encryption Key: 3 cards
  { id: 'encryption-key-1', name: 'Encryption Key', type: 'mandatory' },
  { id: 'encryption-key-2', name: 'Encryption Key', type: 'mandatory' },
  { id: 'encryption-key-3', name: 'Encryption Key', type: 'mandatory' },
  
  // Master Algorithm: 1 card
  { id: 'master-algorithm-1', name: 'Master Algorithm', type: 'ultimate' },
  
  // Exploit Script: 3 cards
  { id: 'exploit-script-1', name: 'Exploit Script', type: 'attack', requiresKey: true },
  { id: 'exploit-script-2', name: 'Exploit Script', type: 'attack', requiresKey: true },
  { id: 'exploit-script-3', name: 'Exploit Script', type: 'attack', requiresKey: true }
];

// Utility functions
export const createShuffledDeck = (): ICard[] => {
  const deck = [...CARD_DEFINITIONS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};