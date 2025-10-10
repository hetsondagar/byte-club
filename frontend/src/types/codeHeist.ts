export type CardType = 'Defense' | 'Recon' | 'Attack' | 'Swap' | 'Mandatory' | 'Ultimate';

export interface Card {
  name: string;
  type: CardType;
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

export interface GameRoom {
  _id: string;
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

export interface GameStats {
  _id: string;
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  masterAlgorithmCaptures: number;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface GameLog {
  message: string;
  timestamp: Date;
  type: 'action' | 'system' | 'attack' | 'defense';
}

// Card definitions matching backend
export const CARD_DEFINITIONS: Card[] = [
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

// Card type colors for UI
export const CARD_TYPE_COLORS: Record<CardType, string> = {
  'Defense': 'from-cyan-500 to-blue-500',
  'Recon': 'from-purple-500 to-violet-500',
  'Attack': 'from-red-500 to-orange-500',
  'Swap': 'from-yellow-500 to-amber-500',
  'Mandatory': 'from-gray-500 to-slate-500',
  'Ultimate': 'from-pink-500 to-fuchsia-500'
};

// Card type icons
export const CARD_TYPE_ICONS: Record<CardType, string> = {
  'Defense': '🛡️',
  'Recon': '🔍',
  'Attack': '⚔️',
  'Swap': '🔄',
  'Mandatory': '🔐',
  'Ultimate': '👑'
};

// Get card definition by name
export function getCardDefinition(cardName: string): Card | undefined {
  return CARD_DEFINITIONS.find(card => card.name === cardName);
}

// Get card color class by card name
export function getCardColor(card: Card): string {
  return CARD_TYPE_COLORS[card.type] || 'from-gray-500 to-slate-500';
}

// Get card icon by card
export function getCardIcon(card: Card): string {
  return CARD_TYPE_ICONS[card.type] || '🃏';
}

