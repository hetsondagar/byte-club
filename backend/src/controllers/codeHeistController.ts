import { GameRoom, IGameRoom, IPlayer, ICard, createShuffledDeck, generateRoomCode } from '../models/CodeHeist';

// Card weight system for attack calculations
const CARD_WEIGHTS: { [key: string]: number } = {
  'Master Algorithm': 10,
  'System Override': 8,
  'Botnet': 6,
  'Exploit Script': 6,
  'Firewall': 4,
  'Debugger': 3,
  'VPN Cloak': 3,
  'Encryption Key': 2
};

export class CodeHeistController {
  // Calculate total weight of cards in a player's hand
  private static calculateHandWeight(hand: ICard[]): number {
    return hand.reduce((total, card) => total + (CARD_WEIGHTS[card.name] || 0), 0);
  }

  // Eliminate a player and move their cards to discard pile
  private static eliminatePlayer(room: IGameRoom, player: IPlayer): void {
    player.isEliminated = true;
    player.lifeTokens = 0;
    room.discardPile.push(...player.hand);
    player.hand = [];
  }

  // Check if game should end (only one player remaining)
  private static checkGameEnd(room: IGameRoom): boolean {
    const activePlayers = room.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 1) {
      room.gameState = 'ended';
      room.winner = activePlayers[0].username;
      return true;
    }
    return false;
  }

  // Create a new game room
  static async createRoom(hostId: string, roomName: string, maxPlayers: number = 6): Promise<IGameRoom> {
    const roomCode = generateRoomCode();
    
    // Ensure room code is unique
    let attempts = 0;
    let finalRoomCode = roomCode;
    while (attempts < 10) {
      const existingRoom = await GameRoom.findOne({ roomCode: finalRoomCode });
      if (!existingRoom) break;
      finalRoomCode = generateRoomCode();
      attempts++;
    }

    const room = new GameRoom({
      roomCode: finalRoomCode,
      roomName,
      hostId,
      maxPlayers,
      players: [],
      deck: [],
      discardPile: [],
      gameState: 'waiting',
      currentPlayerIndex: 0,
      turnNumber: 1,
      challengePhase: false
    });

    return await room.save();
  }

  // Join a room
  static async joinRoom(roomCode: string, userId: string, username: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'waiting' });
    if (!room) return null;

    // Check if player already in room
    const existingPlayer = room.players.find(p => p.userId === userId);
    if (existingPlayer) return room;

    // Check if room is full
    if (room.players.length >= room.maxPlayers) return null;

    const newPlayer: IPlayer = {
      userId,
      username,
      lifeTokens: 1,
      hand: [],
      ready: false,
      isEliminated: false,
      hasFirewall: false,
      hasVPNCloak: false,
      canChallenge: false
    };

    room.players.push(newPlayer);
    return await room.save();
  }

  // Leave a room
  static async leaveRoom(roomCode: string, userId: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode });
    if (!room) return null;

    room.players = room.players.filter(p => p.userId !== userId);
    
    // If host left and room not empty, assign new host
    if (room.hostId === userId && room.players.length > 0) {
      room.hostId = room.players[0].userId;
    }

    // If no players left, delete room
    if (room.players.length === 0) {
      await GameRoom.deleteOne({ _id: room._id });
      return null;
    }

    return await room.save();
  }

  // Toggle player ready status
  static async toggleReady(roomCode: string, userId: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'waiting' });
    if (!room) return null;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return null;

    player.ready = !player.ready;
    return await room.save();
  }

  // Start the game
  static async startGame(roomCode: string, hostId: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'waiting' });
    if (!room) return null;

    // Only host can start game
    if (room.hostId !== hostId) return null;

    // Need at least 2 players
    if (room.players.length < 2) return null;

    // All players must be ready
    const allReady = room.players.every(p => p.ready);
    if (!allReady) return null;

    // Initialize game
    room.gameState = 'playing';
    room.deck = createShuffledDeck();
    room.discardPile = [];
    room.currentPlayerIndex = 0;
    room.turnNumber = 1;
    room.challengePhase = false;

    // Deal initial cards and assign life tokens
    for (const player of room.players) {
      // Deal 1 card to each player
      if (room.deck.length > 0) {
        player.hand.push(room.deck.pop()!);
      }
      
      // Assign 1-2 life tokens randomly
      player.lifeTokens = Math.random() < 0.5 ? 1 : 2;
      player.ready = false;
      player.isEliminated = false;
      player.hasFirewall = false;
      player.hasVPNCloak = false;
      player.canChallenge = false;
    }

    // Shuffle player order
    for (let i = room.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [room.players[i], room.players[j]] = [room.players[j], room.players[i]];
    }

    return await room.save();
  }

  // Draw a card
  static async drawCard(roomCode: string, userId: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'playing' });
    if (!room) return null;

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId || currentPlayer.isEliminated) {
      return null;
    }

    // Can't draw during challenge phase
    if (room.challengePhase) return null;

    // Can't have more than 2 cards in hand
    if (currentPlayer.hand.length >= 2) return null;

    // Reshuffle discard pile if deck is empty
    if (room.deck.length === 0) {
      if (room.discardPile.length === 0) return null; // No cards left
      room.deck = [...room.discardPile];
      room.discardPile = [];
      // Shuffle the deck
      for (let i = room.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [room.deck[i], room.deck[j]] = [room.deck[j], room.deck[i]];
      }
    }

    // Draw card
    const drawnCard = room.deck.pop()!;
    currentPlayer.hand.push(drawnCard);

    return await room.save();
  }

  // Play a card
  static async playCard(
    roomCode: string, 
    userId: string, 
    cardId: string, 
    targetUserId?: string,
    targetCardId?: string
  ): Promise<{ room: IGameRoom | null; success: boolean; message: string; challengeable: boolean }> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'playing' });
    if (!room) return { room: null, success: false, message: 'Room not found', challengeable: false };

    // Can't play during challenge phase
    if (room.challengePhase) {
      return { room, success: false, message: 'Cannot play cards during challenge phase', challengeable: false };
    }

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId || currentPlayer.isEliminated) {
      return { room, success: false, message: 'Not your turn or player eliminated', challengeable: false };
    }

    // Find the card in player's hand
    const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { room, success: false, message: 'Card not found in hand', challengeable: false };
    }

    const card = currentPlayer.hand[cardIndex];

    // Check if card requires encryption key
    if (card.requiresKey) {
      const hasKey = currentPlayer.hand.some(c => c.name === 'Encryption Key');
      if (!hasKey) {
        return { room, success: false, message: 'Encryption Key required to play this card', challengeable: false };
      }
    }

    // Store the played card for potential challenge
    currentPlayer.lastPlayedCard = card;
    
    // Remove card from hand first
    currentPlayer.hand.splice(cardIndex, 1);
    
    // Apply card effects
    const result = await this.applyCardEffect(room, currentPlayer, card, targetUserId, targetCardId);
    
    // Add card to discard pile
    room.discardPile.push(card);

    // Remove encryption key if used
    if (card.requiresKey) {
      const keyIndex = currentPlayer.hand.findIndex(c => c.name === 'Encryption Key');
      if (keyIndex !== -1) {
        const key = currentPlayer.hand.splice(keyIndex, 1)[0];
        room.discardPile.push(key);
      }
    }

    // Enable challenge for other players (except for certain cards)
    const challengeableCards = ['System Override', 'Botnet', 'Exploit Script', 'Debugger'];
    const isChallengeable = challengeableCards.includes(card.name);
    
    if (isChallengeable) {
      // Enable challenge for all other players
      room.players.forEach(p => {
        if (p.userId !== userId) {
          p.canChallenge = true;
        }
      });
    }

    return { 
      room: await room.save(), 
      success: result.success, 
      message: result.message,
      challengeable: isChallengeable
    };
  }

  // Challenge a played card
  static async challengeCard(roomCode: string, challengerId: string): Promise<{ room: IGameRoom | null; success: boolean; message: string }> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'playing' });
    if (!room) return { room: null, success: false, message: 'Room not found' };

    const challenger = room.players.find(p => p.userId === challengerId);
    if (!challenger || !challenger.canChallenge || challenger.isEliminated) {
      return { room, success: false, message: 'Cannot challenge at this time' };
    }

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.lastPlayedCard) {
      return { room, success: false, message: 'No card to challenge' };
    }

    const playedCard = currentPlayer.lastPlayedCard;
    
    // Check if the challenge is valid (card was actually playable)
    const isValidPlay = this.validateCardPlay(room, currentPlayer, playedCard);
    
    // Disable challenge for all players
    room.players.forEach(p => p.canChallenge = false);
    room.challengePhase = false;

    if (isValidPlay) {
      // Challenge failed - challenger is eliminated
      this.eliminatePlayer(room, challenger);
      
      const message = `Challenge failed! ${challenger.username} was eliminated. ${playedCard.name} was a valid play.`;
      
      // Check for game end
      this.checkGameEnd(room);
      
      return { room: await room.save(), success: true, message };
    } else {
      // Challenge successful - current player is eliminated
      this.eliminatePlayer(room, currentPlayer);
      
      const message = `Challenge successful! ${currentPlayer.username} was eliminated for playing an invalid ${playedCard.name}.`;
      
      // Check for game end
      this.checkGameEnd(room);
      
      return { room: await room.save(), success: true, message };
    }
  }

  // Validate if a card play was legitimate
  private static validateCardPlay(room: IGameRoom, player: IPlayer, card: ICard): boolean {
    // Check if player had the required encryption key for cards that need it
    if (card.requiresKey) {
      // We need to check if the player had an encryption key when they played the card
      // Since we already removed it, we'll assume they had it if the card was played
      // In a real implementation, you might want to track this more carefully
      return true;
    }

    // Check for specific card validation rules
    switch (card.name) {
      case 'System Override':
        // System Override is always valid if played
        return true;
      case 'Botnet':
      case 'Exploit Script':
        // Attack cards are valid if played
        return true;
      case 'Debugger':
        // Debugger is valid if played
        return true;
      case 'Firewall':
      case 'VPN Cloak':
        // Defense cards are valid if played
        return true;
      case 'Encryption Key':
      case 'Master Algorithm':
        // These cannot be played directly
        return false;
      default:
        return true;
    }
  }

  // Apply card effects
  private static async applyCardEffect(
    room: IGameRoom, 
    player: IPlayer, 
    card: ICard, 
    targetUserId?: string, 
    targetCardId?: string
  ): Promise<{ success: boolean; message: string }> {
    switch (card.name) {
      case 'Firewall':
        player.hasFirewall = true;
        return { success: true, message: 'Firewall activated - blocks one attack' };

      case 'Debugger':
        if (!targetUserId) return { success: false, message: 'Target player required for Debugger' };
        const targetPlayer = room.players.find(p => p.userId === targetUserId);
        if (!targetPlayer) return { success: false, message: 'Target player not found' };
        return { success: true, message: `Debugger used on ${targetPlayer.username}` };

      case 'Botnet':
        if (!targetUserId) return { success: false, message: 'Target player required for Botnet' };
        const botnetTarget = room.players.find(p => p.userId === targetUserId);
        if (!botnetTarget || botnetTarget.isEliminated) {
          return { success: false, message: 'Target player not found or eliminated' };
        }
        
        // Check for protection (Firewall or VPN Cloak)
        if (botnetTarget.hasFirewall) {
          botnetTarget.hasFirewall = false;
          return { success: true, message: 'Botnet attack blocked by Firewall' };
        }
        if (botnetTarget.hasVPNCloak) {
          return { success: true, message: 'Botnet attack blocked by VPN Cloak' };
        }
        
        // Calculate hand weights for both players
        const botnetAttackerWeight = this.calculateHandWeight(player.hand);
        const botnetTargetWeight = this.calculateHandWeight(botnetTarget.hand);
        
        // Determine attack outcome based on hand weights
        if (botnetAttackerWeight > botnetTargetWeight) {
          // Attacker has heavier hand - target loses life
          botnetTarget.lifeTokens--;
          if (botnetTarget.lifeTokens <= 0) {
            this.eliminatePlayer(room, botnetTarget);
            return { 
              success: true, 
              message: `Botnet attack successful! ${botnetTarget.username} eliminated (Attacker weight: ${botnetAttackerWeight}, Target weight: ${botnetTargetWeight})` 
            };
          }
          return { 
            success: true, 
            message: `Botnet attack successful! ${botnetTarget.username} lost 1 life token (Attacker weight: ${botnetAttackerWeight}, Target weight: ${botnetTargetWeight})` 
          };
        } else {
          // Attacker has lighter or equal hand - attacker loses life
          player.lifeTokens--;
          if (player.lifeTokens <= 0) {
            this.eliminatePlayer(room, player);
            return { 
              success: true, 
              message: `Botnet attack backfired! ${player.username} eliminated (Attacker weight: ${botnetAttackerWeight}, Target weight: ${botnetTargetWeight})` 
            };
          }
          return { 
            success: true, 
            message: `Botnet attack backfired! ${player.username} lost 1 life token (Attacker weight: ${botnetAttackerWeight}, Target weight: ${botnetTargetWeight})` 
          };
        }

      case 'VPN Cloak':
        player.hasVPNCloak = true;
        return { success: true, message: 'VPN Cloak activated - untargetable for one turn' };

      case 'System Override':
        if (!targetUserId) return { success: false, message: 'Target player required for System Override' };
        const swapTarget = room.players.find(p => p.userId === targetUserId);
        if (!swapTarget || swapTarget.isEliminated) {
          return { success: false, message: 'Target player not found or eliminated' };
        }
        if (swapTarget.hasVPNCloak) {
          return { success: false, message: 'Target is protected by VPN Cloak' };
        }
        
        // System Override card itself is already discarded
        // Swap the remaining cards (excluding the System Override that was just played)
        const currentPlayerRemainingCards = [...player.hand];
        const targetPlayerCards = [...swapTarget.hand];
        
        // Swap only the remaining cards
        player.hand = targetPlayerCards;
        swapTarget.hand = currentPlayerRemainingCards;
        
        return { success: true, message: `System Override played - remaining cards swapped with ${swapTarget.username}` };

      case 'Exploit Script':
        if (!targetUserId) return { success: false, message: 'Target player required for Exploit Script' };
        const exploitTarget = room.players.find(p => p.userId === targetUserId);
        if (!exploitTarget || exploitTarget.isEliminated) {
          return { success: false, message: 'Target player not found or eliminated' };
        }
        
        // Check for protection (Firewall or VPN Cloak)
        if (exploitTarget.hasFirewall) {
          exploitTarget.hasFirewall = false;
          return { success: true, message: 'Exploit Script attack blocked by Firewall' };
        }
        if (exploitTarget.hasVPNCloak) {
          return { success: true, message: 'Exploit Script attack blocked by VPN Cloak' };
        }
        if (exploitTarget.hand.length === 0) {
          return { success: false, message: 'Target has no cards to discard' };
        }
        
        // Exploit Script always forces target to discard a card (no weight comparison needed)
        const randomIndex = Math.floor(Math.random() * exploitTarget.hand.length);
        const discardedCard = exploitTarget.hand.splice(randomIndex, 1)[0];
        room.discardPile.push(discardedCard);
        
        // Check if Master Algorithm was discarded
        if (discardedCard.name === 'Master Algorithm') {
          this.eliminatePlayer(room, exploitTarget);
          return { 
            success: true, 
            message: `Exploit Script successful! ${exploitTarget.username} eliminated - Master Algorithm discarded!` 
          };
        }
        return { 
          success: true, 
          message: `Exploit Script successful! ${exploitTarget.username} discarded ${discardedCard.name}` 
        };

      case 'Encryption Key':
        return { success: false, message: 'Encryption Key cannot be played directly' };

      case 'Master Algorithm':
        return { success: false, message: 'Master Algorithm cannot be played directly' };

      default:
        return { success: false, message: 'Unknown card' };
    }
  }

  // End turn and move to next player
  static async endTurn(roomCode: string, userId: string): Promise<IGameRoom | null> {
    const room = await GameRoom.findOne({ roomCode, gameState: 'playing' });
    if (!room) return null;

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId) return null;

    // Can't end turn during challenge phase
    if (room.challengePhase) return null;

    // Reset temporary effects
    currentPlayer.hasFirewall = false;
    currentPlayer.hasVPNCloak = false;
    currentPlayer.lastPlayedCard = undefined;

    // Disable challenge for all players
    room.players.forEach(p => p.canChallenge = false);

    // Move to next active player
    do {
      room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    } while (room.players[room.currentPlayerIndex].isEliminated);

    // Check if only one player remains
    if (!this.checkGameEnd(room)) {
      room.turnNumber++;
    }

    return await room.save();
  }

  // Get active rooms
  static async getActiveRooms(): Promise<IGameRoom[]> {
    return await GameRoom.find({ gameState: 'waiting' })
      .select('roomCode roomName hostId maxPlayers players.userId players.username')
      .sort({ createdAt: -1 })
      .limit(20);
  }

  // Get room by code
  static async getRoom(roomCode: string): Promise<IGameRoom | null> {
    return await GameRoom.findOne({ roomCode });
  }

  // Clean up old ended games
  static async cleanupOldGames(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await GameRoom.deleteMany({ 
      gameState: 'ended', 
      updatedAt: { $lt: oneDayAgo } 
    });
  }
}