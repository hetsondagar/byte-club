import express from 'express';
import { CodeHeistController } from '../controllers/codeHeistController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get active rooms (public endpoint)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await CodeHeistController.getActiveRooms();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get active rooms' });
  }
});

// Get room details (authenticated)
router.get('/room/:roomCode', authenticateToken, async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await CodeHeistController.getRoom(roomCode);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Return public room data only
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
        hasVPNCloak: p.hasVPNCloak
      })),
      gameState: room.gameState,
      currentPlayerIndex: room.currentPlayerIndex,
      turnNumber: room.turnNumber,
      winner: room.winner,
      deckSize: room.deck.length,
      discardPileSize: room.discardPile.length
    };

    res.json({ success: true, room: publicRoomData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get room details' });
  }
});

// Cleanup old games (admin endpoint)
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Only allow cleanup from authenticated users (you might want to add admin check)
    await CodeHeistController.cleanupOldGames();
    res.json({ success: true, message: 'Old games cleaned up successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cleanup old games' });
  }
});

export default router;
