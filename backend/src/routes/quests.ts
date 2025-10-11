import express from 'express';
import { questController } from '../controllers/questController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all quests for user
router.get('/', questController.getUserQuests);

// Get specific quest by ID
router.get('/:questId', questController.getQuestById);

// Get quest progress
router.get('/:questId/progress', questController.getQuestProgress);

// Get completed missions for a quest
router.get('/:questId/missions/completed', questController.getCompletedMissions);

// Submit a mission answer
router.post('/:questId/missions/:missionId/submit', questController.submitMission);

// Get quest statistics
router.get('/stats/overview', questController.getQuestStats);

export default router;

