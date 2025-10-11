import { Request, Response } from 'express';
import { Quest } from '../models';

export const questController = {
  // Get all quests for a user
  async getUserQuests(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const quests = await Quest.getAllQuests(userId);
      
      return res.json({
        quests,
        totalQuests: quests.length,
        completedQuests: quests.filter(q => q.isCompleted).length
      });
    } catch (error) {
      console.error('Error fetching quests:', error);
      return res.status(500).json({ error: 'Failed to fetch quests' });
    }
  },

  // Get a specific quest by ID
  async getQuestById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { questId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const quest = await Quest.getQuestById(userId, questId);

      if (!quest) {
        return res.status(404).json({ error: 'Quest not found' });
      }

      return res.json(quest);
    } catch (error) {
      console.error('Error fetching quest:', error);
      return res.status(500).json({ error: 'Failed to fetch quest' });
    }
  },

  // Submit a mission answer
  async submitMission(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { questId, missionId } = req.params;
      const { answer } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!answer || answer.trim() === '') {
        return res.status(400).json({ error: 'Answer is required' });
      }

      const result = await Quest.submitMission(userId, questId, missionId, answer);

      if (!result.success) {
        return res.json({
          success: false,
          message: 'Incorrect answer. Try again!',
          isCorrect: false
        });
      }

      return res.json({
        success: true,
        message: result.successText || 'Mission completed!',
        isCorrect: true,
        xpEarned: result.xpEarned,
        totalXP: result.totalXP,
        questCompleted: result.questCompleted,
        allMissionsCompleted: result.allMissionsCompleted
      });
    } catch (error) {
      console.error('Error submitting mission:', error);
      return res.status(500).json({ error: 'Failed to submit mission' });
    }
  },

  // Get user's quest progress
  async getQuestProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { questId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const progress = await Quest.getQuestProgress(userId, questId);

      return res.json(progress);
    } catch (error) {
      console.error('Error fetching quest progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
  },

  // Get all completed missions for a quest
  async getCompletedMissions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { questId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const completedMissions = await Quest.getCompletedMissions(userId, questId);

      return res.json({
        completedMissions,
        totalCompleted: completedMissions.length
      });
    } catch (error) {
      console.error('Error fetching completed missions:', error);
      return res.status(500).json({ error: 'Failed to fetch completed missions' });
    }
  },

  // Get quest statistics
  async getQuestStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await Quest.getQuestStats(userId);

      return res.json(stats);
    } catch (error) {
      console.error('Error fetching quest stats:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

