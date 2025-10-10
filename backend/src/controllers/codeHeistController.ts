import { Card, Player, IGameRoom, CARD_DECK, CodeHeistDB } from '../models/CodeHeist';

export class CodeHeistGameEngine {
  // Generate a unique room code
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Initialize a full deck with multiple copies of each card
  static initializeDeck(): Card[] {
    const deck: Card[] = [];
    
    // Add multiple copies based on game balance
    const cardCopies: { [key: string]: number } = {
      'Firewall': 4,
      'Debugger': 3,
      'Botnet': 3,
      'VPN Cloak': 3,
      'System Override': 2,
      'Encryption Key': 3,
      'Master Algorithm': 1,
      'Exploit Script': 3
    };

    CARD_DECK.forEach(card => {
      const copies = cardCopies[card.name] || 1;
      for (let i = 0; i < copies; i++) {
        deck.push({ ...card });
      }
    });

    return this.shuffleDeck(deck);
  }

  // Shuffle deck using Fisher-Yates algorithm
  static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Deal initial cards to players
  static dealInitialCards(players: Player[], deck: Card[]): { players: Player[], deck: Card[] } {
    const newDeck = [...deck];
    const newPlayers = players.map(player => ({
      ...player,
      hand: [newDeck.pop()!],
      lives: players.length <= 4 ? 2 : 1,
      isActive: true
    }));

    return { players: newPlayers, deck: newDeck };
  }

  // Draw a card from deck
  static drawCard(deck: Card[], discardPile: Card[]): { card: Card, deck: Card[], discardPile: Card[] } {
    let newDeck = [...deck];
    let newDiscard = [...discardPile];

    if (newDeck.length === 0) {
      // Reshuffle discard pile into deck
      newDeck = this.shuffleDeck(newDiscard);
      newDiscard = [];
    }

    const card = newDeck.pop();
    if (!card) {
      throw new Error('No cards available to draw');
    }

    return { card, deck: newDeck, discardPile: newDiscard };
  }

  // Play a card and resolve its effect
  static playCard(
    room: IGameRoom,
    playerId: string,
    cardName: string,
    targetPlayerId?: string
  ): { 
    room: IGameRoom, 
    log: string,
    requiresInput?: boolean,
    inputType?: 'selectPlayer' | 'selectCard' | 'challenge'
  } {
    const playerIndex = room.players.findIndex(p => p.userId === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const player = room.players[playerIndex];
    const cardIndex = player.hand.findIndex(c => c.name === cardName);
    if (cardIndex === -1) {
      throw new Error('Card not in hand');
    }

    const card = player.hand[cardIndex];
    const newRoom = { ...room };
    newRoom.players = [...room.players];
    newRoom.discardPile = [...room.discardPile, card];
    
    // Remove card from hand
    newRoom.players[playerIndex] = {
      ...player,
      hand: player.hand.filter((_, i) => i !== cardIndex)
    };

    let log = `${player.username} played ${card.name}`;

    // Resolve card effect
    switch (card.name) {
      case 'Firewall':
        log += ` — ${card.flavorText}`;
        // Player gains defense until next turn (handled in client state)
        break;

      case 'Debugger':
        if (targetPlayerId) {
          const target = newRoom.players.find(p => p.userId === targetPlayerId);
          if (target) {
            log += ` on ${target.username} — ${card.flavorText}`;
            // Reveal target's hand to current player (handled in socket event)
          }
        } else {
          return { room: newRoom, log, requiresInput: true, inputType: 'selectPlayer' };
        }
        break;

      case 'Botnet':
        if (targetPlayerId) {
          const target = newRoom.players.find(p => p.userId === targetPlayerId);
          if (target) {
            log += ` targeting ${target.username} — ${card.flavorText}`;
            // Compare hands, loser loses a life
            const result = this.comparehands(newRoom.players[playerIndex], target);
            if (result.loserId) {
              const loserIndex = newRoom.players.findIndex(p => p.userId === result.loserId);
              if (loserIndex !== -1) {
                newRoom.players[loserIndex] = {
                  ...newRoom.players[loserIndex],
                  lives: Math.max(0, newRoom.players[loserIndex].lives - 1)
                };
                log += ` — ${newRoom.players[loserIndex].username} loses a life!`;
                
                if (newRoom.players[loserIndex].lives === 0) {
                  newRoom.players[loserIndex].isActive = false;
                  log += ` ${newRoom.players[loserIndex].username} is eliminated!`;
                }
              }
            }
          }
        } else {
          return { room: newRoom, log, requiresInput: true, inputType: 'selectPlayer' };
        }
        break;

      case 'VPN Cloak':
        log += ` — ${card.flavorText}`;
        // Player cannot be targeted next turn (handled in client state)
        break;

      case 'System Override':
        if (targetPlayerId) {
          const targetIndex = newRoom.players.findIndex(p => p.userId === targetPlayerId);
          if (targetIndex !== -1) {
            const target = newRoom.players[targetIndex];
            log += ` on ${target.username} — ${card.flavorText}`;
            
            // Swap hands
            const tempHand = [...newRoom.players[playerIndex].hand];
            newRoom.players[playerIndex].hand = [...target.hand];
            newRoom.players[targetIndex].hand = tempHand;
          }
        } else {
          return { room: newRoom, log, requiresInput: true, inputType: 'selectPlayer' };
        }
        break;

      case 'Encryption Key':
        log += ` — ${card.flavorText}`;
        // Mandatory card, stays in hand normally
        break;

      case 'Master Algorithm':
        log += ` — ${card.flavorText}`;
        // If discarded, player loses immediately
        newRoom.players[playerIndex].lives = 0;
        newRoom.players[playerIndex].isActive = false;
        log += ` — ${player.username} has been eliminated for losing the Master Algorithm!`;
        break;

      case 'Exploit Script':
        if (targetPlayerId) {
          const targetIndex = newRoom.players.findIndex(p => p.userId === targetPlayerId);
          if (targetIndex !== -1) {
            const target = newRoom.players[targetIndex];
            log += ` on ${target.username} — ${card.flavorText}`;
            
            if (target.hand.length > 0) {
              // Target must discard a card (handled via socket event)
              return { room: newRoom, log, requiresInput: true, inputType: 'selectCard' };
            }
          }
        } else {
          return { room: newRoom, log, requiresInput: true, inputType: 'selectPlayer' };
        }
        break;
    }

    return { room: newRoom, log };
  }

  // Compare hands for Botnet attack
  private static comparehands(attacker: Player, defender: Player): { loserId?: string } {
    const attackerValue = this.calculateHandValue(attacker.hand);
    const defenderValue = this.calculateHandValue(defender.hand);

    if (attackerValue > defenderValue) {
      return { loserId: defender.userId };
    } else if (defenderValue > attackerValue) {
      return { loserId: attacker.userId };
    }
    
    // Tie - both lose a life (or implement tiebreaker)
    return { loserId: defender.userId }; // Defender loses on tie
  }

  // Calculate hand value for comparison
  private static calculateHandValue(hand: Card[]): number {
    const cardValues: { [key: string]: number } = {
      'Master Algorithm': 10,
      'System Override': 8,
      'Botnet': 7,
      'Exploit Script': 6,
      'Encryption Key': 5,
      'VPN Cloak': 4,
      'Firewall': 3,
      'Debugger': 2
    };

    return hand.reduce((sum, card) => sum + (cardValues[card.name] || 0), 0);
  }

  // Check if game is over
  static checkGameOver(room: IGameRoom): { isOver: boolean, winner?: Player } {
    const activePlayers = room.players.filter(p => p.isActive && p.lives > 0);
    
    if (activePlayers.length === 1) {
      return { isOver: true, winner: activePlayers[0] };
    }
    
    if (activePlayers.length === 0) {
      return { isOver: true };
    }

    return { isOver: false };
  }

  // Get next active player
  static getNextPlayerIndex(room: IGameRoom): number {
    let nextIndex = (room.currentPlayerIndex + 1) % room.players.length;
    let attempts = 0;
    
    // Find next active player
    while (!room.players[nextIndex].isActive && attempts < room.players.length) {
      nextIndex = (nextIndex + 1) % room.players.length;
      attempts++;
    }

    return nextIndex;
  }

  // Validate if a player can play a card
  static canPlayCard(player: Player, card: Card, targetPlayer?: Player): { valid: boolean, reason?: string } {
    // Check if player has the card
    if (!player.hand.find(c => c.name === card.name)) {
      return { valid: false, reason: 'Card not in hand' };
    }

    // Check if Encryption Key is required
    if (card.name === 'System Override' || card.name === 'Botnet') {
      const hasEncryptionKey = player.hand.find(c => c.name === 'Encryption Key');
      if (!hasEncryptionKey) {
        return { valid: false, reason: 'Encryption Key required to play this card' };
      }
    }

    // Check card limits (max 2 cards in hand)
    if (player.hand.length > 2) {
      return { valid: false, reason: 'Must play or discard to maintain 2 card limit' };
    }

    // Card-specific validations
    if (card.type === 'Attack' || card.type === 'Recon' || card.type === 'Swap') {
      if (!targetPlayer) {
        return { valid: false, reason: 'Target player required' };
      }
      if (!targetPlayer.isActive) {
        return { valid: false, reason: 'Target player is not active' };
      }
    }

    return { valid: true };
  }

  // Start a new game
  static async startGame(roomId: string): Promise<IGameRoom> {
    const room = await CodeHeistDB.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length < 3) {
      throw new Error('Need at least 3 players to start');
    }

    // Initialize deck and deal cards
    const deck = this.initializeDeck();
    const { players, deck: remainingDeck } = this.dealInitialCards(room.players, deck);

    // Update room
    return await CodeHeistDB.updateRoom(roomId, {
      players,
      deck: remainingDeck,
      gameState: 'playing',
      currentPlayerIndex: 0,
      turnNumber: 1
    });
  }

  // End turn and move to next player
  static async endTurn(roomId: string): Promise<IGameRoom> {
    const room = await CodeHeistDB.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const nextPlayerIndex = this.getNextPlayerIndex(room);
    
    // Check if game is over
    const gameOver = this.checkGameOver(room);
    if (gameOver.isOver) {
      return await CodeHeistDB.updateRoom(roomId, {
        gameState: 'ended',
        winner: gameOver.winner?.username,
        currentPlayerIndex: nextPlayerIndex
      });
    }

    return await CodeHeistDB.updateRoom(roomId, {
      currentPlayerIndex: nextPlayerIndex,
      turnNumber: room.turnNumber + 1
    });
  }
}

